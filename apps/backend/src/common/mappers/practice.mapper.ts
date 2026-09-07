import type {
  AttemptDto,
  DraftDto,
  ExerciseDto,
  GenerationJobDto,
  MockExamAttemptDto,
  MockExamSetDto,
  MockExamSetSummaryDto,
  PromptOverrideDto,
  ResultDto,
} from '@exam-one/contracts'
import type {
  Attempt,
  Draft,
  Exercise,
  GenerationJob,
  MockExamAttempt,
  MockExamSet,
  PromptOverride,
  Result,
} from '@exam-one/database'

export function toExerciseDto(row: Exercise): ExerciseDto {
  return {
    id: row.id,
    packId: row.packId,
    skill: row.skill,
    level: row.level,
    source: row.source,
    visibility: row.visibility,
    externalId: row.externalId,
    payload: row.payload,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toResultDto(row: Result): ResultDto {
  return {
    id: row.id,
    attemptId: row.attemptId,
    score: row.score,
    maxScore: row.maxScore,
    percentage: row.percentage,
    review: row.review,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toAttemptDto(
  row: Attempt & { result?: Result | null; exercise?: Exercise | null }
): AttemptDto {
  return {
    id: row.id,
    packId: row.packId,
    snapshot: row.snapshot,
    userId: row.userId,
    exerciseId: row.exerciseId,
    exerciseExternalId: row.exercise?.externalId ?? null,
    skill: row.skill,
    answers: row.answers,
    result: row.result ? toResultDto(row.result) : null,
    submittedAt: row.submittedAt.toISOString(),
  }
}

export function toDraftDto(row: Draft): DraftDto {
  return {
    id: row.id,
    packId: row.packId,
    userId: row.userId,
    skill: row.skill,
    topicId: row.topicId,
    payload: row.payload,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toPromptOverrideDto(row: PromptOverride): PromptOverrideDto {
  return {
    id: row.id,
    userId: row.userId,
    skill: row.skill,
    level: row.level,
    part: row.part,
    kind: row.kind,
    body: row.body,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toGenerationJobDto(row: GenerationJob): GenerationJobDto {
  return {
    id: row.id,
    userId: row.userId,
    packId: row.packId,
    kind: row.kind,
    status: row.status,
    payload: row.payload,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toMockExamSetSummaryDto(row: MockExamSet): MockExamSetSummaryDto {
  return {
    id: row.id,
    packId: row.packId,
    externalId: row.externalId,
    examId: row.examId,
    level: row.level,
    title: row.title,
    generated: row.generated,
    createdAt: row.createdAt.toISOString(),
  }
}

export function toMockExamSetDto(row: MockExamSet): MockExamSetDto {
  return {
    ...toMockExamSetSummaryDto(row),
    content: row.content,
    modules: row.modules,
    rules: row.rules,
  }
}

export function toMockExamAttemptDto(
  row: MockExamAttempt & { set: MockExamSet }
): MockExamAttemptDto {
  return {
    id: row.id,
    setId: row.setId,
    setExternalId: row.set.externalId,
    state: row.state,
    updatedAt: row.updatedAt.toISOString(),
  }
}
