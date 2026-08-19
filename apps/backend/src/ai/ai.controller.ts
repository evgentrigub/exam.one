import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { AiResponse } from '@exam-one/contracts'
import type { ListeningA2Exercise, ReadingExercise, SpeakingA2Topic, SpeakingReviewData, WritingExercise } from '@exam-one/exam-content'
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
import { GenerateWritingService, type ModelAnswerData } from './generate-writing.service'
import { ReviewService, type MockExamOverview, type WritingReviewData } from './review.service'

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly reading: GenerateReadingService,
    private readonly listening: GenerateListeningService,
    private readonly speaking: GenerateSpeakingService,
    private readonly writing: GenerateWritingService,
    private readonly reviews: ReviewService
  ) {}

  @Post('generate-reading')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate reading exercises via the configured LLM' })
  generateReading(@Body() body: GenerateReadingDto): Promise<AiResponse<ReadingExercise[]>> {
    return this.reading.generate(body)
  }

  @Post('generate-listening')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate listening exercises via the configured LLM' })
  generateListening(
    @Body() body: GenerateListeningDto
  ): Promise<AiResponse<ListeningA2Exercise[]>> {
    return this.listening.generate(body)
  }

  @Post('generate-speaking')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate speaking topics via the configured LLM' })
  generateSpeaking(@Body() body: GenerateSpeakingDto): Promise<AiResponse<SpeakingA2Topic[]>> {
    return this.speaking.generate(body)
  }

  @Post('generate-topics')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate writing topics via the configured LLM' })
  generateTopics(@Body() body: GenerateTopicsDto): Promise<AiResponse<WritingExercise[]>> {
    return this.writing.generateTopics(body)
  }

  @Post('generate-model-answer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate a writing model answer via the configured LLM' })
  generateModelAnswer(
    @Body() body: GenerateModelAnswerDto
  ): Promise<AiResponse<ModelAnswerData>> {
    return this.writing.generateModelAnswer(body)
  }

  @Post('review')
  @HttpCode(200)
  @ApiOperation({ summary: 'Grade a writing submission via the configured LLM' })
  reviewWriting(@Body() body: ReviewWritingDto): Promise<AiResponse<WritingReviewData>> {
    return this.reviews.reviewWriting(body)
  }

  @Post('review-speaking')
  @HttpCode(200)
  @ApiOperation({ summary: 'Grade a speaking attempt via the configured LLM' })
  reviewSpeaking(@Body() body: ReviewSpeakingDto): Promise<AiResponse<SpeakingReviewData>> {
    return this.reviews.reviewSpeaking(body)
  }

  @Post('review-mock-exam')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate an aggregate mock-exam AI overview' })
  reviewMockExam(@Body() body: ReviewMockExamDto): Promise<AiResponse<MockExamOverview>> {
    return this.reviews.reviewMockExam(body)
  }
}
