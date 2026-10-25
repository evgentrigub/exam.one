import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { AiResponse } from '@exam-one/contracts'
import { ApiErrorDto, AiGenericResponseDto } from '../core/dto/api-response.dto'
import {
  GenerateListeningDto,
  GenerateModelAnswerDto,
  GenerateReadingDto,
  GenerateSpeakingDto,
  GenerateTopicsDto,
  ReviewMockExamDto,
  ReviewSpeakingDto,
  ReviewWritingDto,
} from './dto/ai.dto'
import { PackAiService } from './pack-ai.service'

@ApiTags('llm')
@ApiCookieAuth('exam_one_access')
@ApiHeader({
  name: 'x-exam-pack',
  required: false,
  description:
    'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
})
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller('llm')
export class AiController {
  constructor(private readonly packs: PackAiService) {}

  private payload(body: object): Record<string, unknown> {
    return { ...body, difficulty: this.packs.pack().cefr }
  }

  @Post('generate-reading')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate reading exercises via the configured LLM',
    description:
      'Calls the configured LLM provider to generate reading texts, questions, and solutions conforming to the active pack format.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Generated reading exercises or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  generateReading(@Body() body: GenerateReadingDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError('reading', body.prompts?.map(part => part.part) ?? [1])
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.generateForSkill(
      'reading',
      this.payload(body),
      body.prompts?.map(part => part.part) ?? [1]
    )
  }

  @Post('generate-listening')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate listening exercises via the configured LLM',
    description:
      'Calls the configured LLM to generate listening dialogue transcripts, questions, and answer keys.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Generated listening exercises or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  generateListening(@Body() body: GenerateListeningDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError(
      'listening',
      body.prompts.map(part => part.part)
    )
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.generateForSkill(
      'listening',
      this.payload(body),
      body.prompts.map(part => part.part)
    )
  }

  @Post('generate-speaking')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate speaking topics via the configured LLM',
    description: 'Calls LLM to generate speaking prompts and topic cards.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Generated speaking topics or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  generateSpeaking(@Body() body: GenerateSpeakingDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError(
      'speaking',
      body.prompts.map(part => part.part)
    )
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.generateForSkill(
      'speaking',
      this.payload(body),
      body.prompts.map(part => part.part)
    )
  }

  @Post('generate-topics')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate writing topics via the configured LLM',
    description: 'Calls LLM to produce new writing tasks and scenarios for the specified part.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Generated writing topics or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  generateTopics(@Body() body: GenerateTopicsDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError('writing', [body.part])
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.generateForSkill('writing', this.payload(body), [body.part])
  }

  @Post('generate-model-answer')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate a writing model answer via the configured LLM',
    description: 'Synthesizes an exemplary high-scoring response for a writing prompt.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Model answer payload or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  generateModelAnswer(@Body() body: GenerateModelAnswerDto): Promise<AiResponse<unknown>> {
    const error = this.packs.payloadError('writing', body.topic)
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.answerFor(body as unknown as Record<string, unknown>)
  }

  @Post('review')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Grade a writing submission via the configured LLM',
    description:
      'Evaluates candidate written text against the pack grading rubric, returning scores and criterion feedback.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Grading evaluation review or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  reviewWriting(@Body() body: ReviewWritingDto): Promise<AiResponse<unknown>> {
    const error = this.packs.payloadError('writing', body.topic)
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.reviewWritingFor(body as unknown as Record<string, unknown>)
  }

  @Post('review-speaking')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Grade a speaking attempt via the configured LLM',
    description: 'Evaluates candidate spoken transcription against the pack speaking rubric.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Speaking evaluation review or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  reviewSpeaking(@Body() body: ReviewSpeakingDto): Promise<AiResponse<unknown>> {
    const error = body.topic ? this.packs.payloadError('speaking', body.topic) : null
    if (error) return Promise.resolve({ data: null, error })
    return this.packs.reviewSpeakingFor(body as unknown as Record<string, unknown>)
  }

  @Post('review-mock-exam')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate an aggregate mock-exam AI overview',
    description: 'Produces cross-module analysis and overall feedback for a completed mock exam.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Mock exam aggregate evaluation or business error',
    type: AiGenericResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid request body', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  reviewMockExam(@Body() body: ReviewMockExamDto): Promise<AiResponse<unknown>> {
    return this.packs.reviewMockFor(body as unknown as Record<string, unknown>)
  }
}
