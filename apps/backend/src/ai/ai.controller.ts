import { PackAiService } from './pack-ai.service'
import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { AiResponse } from '@exam-one/contracts'
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
import { GenerateListeningService } from './generate-listening.service'
import { GenerateReadingService } from './generate-reading.service'
import { GenerateSpeakingService } from './generate-speaking.service'
import { GenerateWritingService } from './generate-writing.service'
import { ReviewService } from './review.service'

@ApiTags('ai')
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller('ai')
export class AiController {
  constructor(
    private readonly packs: PackAiService,
    private readonly reading: GenerateReadingService,
    private readonly listening: GenerateListeningService,
    private readonly speaking: GenerateSpeakingService,
    private readonly writing: GenerateWritingService,
    private readonly reviews: ReviewService
  ) {}

  @Post('generate-reading')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate reading exercises via the configured LLM' })
  generateReading(@Body() body: GenerateReadingDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError('reading', body.prompts?.map(part => part.part) ?? [1])
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric())
      return this.packs.generate('reading', body.prompts?.map(p => p.part) ?? [1])
    return this.packs.validateGenerated(
      'reading',
      this.reading.generate({ ...body, difficulty: this.packs.pack().cefr })
    )
  }

  @Post('generate-listening')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate listening exercises via the configured LLM' })
  generateListening(@Body() body: GenerateListeningDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError(
      'listening',
      body.prompts.map(part => part.part)
    )
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric())
      return this.packs.generate(
        'listening',
        body.prompts.map(p => p.part)
      )
    return this.packs.validateGenerated(
      'listening',
      this.listening.generate({ ...body, difficulty: this.packs.pack().cefr })
    )
  }

  @Post('generate-speaking')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate speaking topics via the configured LLM' })
  generateSpeaking(@Body() body: GenerateSpeakingDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError(
      'speaking',
      body.prompts.map(part => part.part)
    )
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric())
      return this.packs.generate(
        'speaking',
        body.prompts.map(p => p.part)
      )
    return this.packs.validateGenerated(
      'speaking',
      this.speaking.generate({ ...body, difficulty: this.packs.pack().cefr })
    )
  }

  @Post('generate-topics')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate writing topics via the configured LLM' })
  generateTopics(@Body() body: GenerateTopicsDto): Promise<AiResponse<unknown>> {
    const error = this.packs.partError('writing', [body.part])
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric()) return this.packs.generate('writing', [body.part])
    return this.packs.validateGenerated(
      'writing',
      this.writing.generateTopics({ ...body, difficulty: this.packs.pack().cefr })
    )
  }

  @Post('generate-model-answer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate a writing model answer via the configured LLM' })
  generateModelAnswer(@Body() body: GenerateModelAnswerDto): Promise<AiResponse<unknown>> {
    const error = this.packs.payloadError('writing', body.topic)
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric())
      return this.packs.respond(
        'writing',
        Number(body.topic['testingPart']),
        'answer',
        body.topic,
        {}
      )
    return this.writing.generateModelAnswer(body)
  }

  @Post('review')
  @HttpCode(200)
  @ApiOperation({ summary: 'Grade a writing submission via the configured LLM' })
  reviewWriting(@Body() body: ReviewWritingDto): Promise<AiResponse<unknown>> {
    const error = this.packs.payloadError('writing', body.topic)
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric())
      return this.packs.respond(
        'writing',
        Number(body.topic['testingPart']),
        'review',
        body.topic,
        body.answers ?? { answer: body.userContent }
      )
    return this.reviews.reviewWriting(body)
  }

  @Post('review-speaking')
  @HttpCode(200)
  @ApiOperation({ summary: 'Grade a speaking attempt via the configured LLM' })
  reviewSpeaking(@Body() body: ReviewSpeakingDto): Promise<AiResponse<unknown>> {
    const error = body.topic ? this.packs.payloadError('speaking', body.topic) : null
    if (error) return Promise.resolve({ data: null, error })
    if (this.packs.isGeneric())
      return this.packs.respond(
        'speaking',
        Number(body.topic?.['testingPart']),
        'review',
        body.topic,
        body.answers ?? {}
      )
    return this.reviews.reviewSpeaking(body)
  }

  @Post('review-mock-exam')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate an aggregate mock-exam AI overview' })
  reviewMockExam(@Body() body: ReviewMockExamDto): Promise<AiResponse<unknown>> {
    if (!this.packs.pack().createMockSet)
      return Promise.resolve({ data: null, error: 'Mock exams are unavailable for this pack' })
    return this.reviews.reviewMockExam(body)
  }
}
