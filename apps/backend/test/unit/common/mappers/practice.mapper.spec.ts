import {
  toAttemptDto,
  toDraftDto,
  toExerciseDto,
  toGenerationJobDto,
  toMockExamAttemptDto,
  toMockExamSetDto,
  toMockExamSetSummaryDto,
  toResultDto,
} from '../../../../src/common/mappers/practice.mapper'
import {
  makeAttempt,
  makeDraft,
  makeExercise,
  makeGenerationJob,
  makeMockExamAttempt,
  makeMockExamSet,
  makeResult,
} from '../../../../src/testing/fixtures'

describe('practice mappers', () => {
  it('maps an exercise with ISO createdAt', () => {
    const dto = toExerciseDto(makeExercise())
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(dto.externalId).toBe('reading-a2-teil1-001')
  })

  it('maps a result', () => {
    const dto = toResultDto(makeResult({ review: { note: 'ok' } }))
    expect(dto.score).toBe(8)
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(dto.review).toEqual({ note: 'ok' })
  })

  it('maps an attempt without exercise or result', () => {
    const dto = toAttemptDto(makeAttempt({ exerciseId: null }))
    expect(dto.exerciseExternalId).toBeNull()
    expect(dto.result).toBeNull()
    expect(dto.submittedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('maps an attempt with nested exercise and result', () => {
    const exercise = makeExercise({ externalId: 'reading-a2-teil1-001' })
    const result = makeResult()
    const dto = toAttemptDto({ ...makeAttempt({ exerciseId: exercise.id }), exercise, result })

    expect(dto.exerciseExternalId).toBe('reading-a2-teil1-001')
    expect(dto.result?.id).toBe(result.id)
  })

  it('maps a draft', () => {
    const dto = toDraftDto(makeDraft())
    expect(dto.topicId).toBe('topic-1')
    expect(dto.updatedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('maps a generation job', () => {
    const dto = toGenerationJobDto(makeGenerationJob({ status: 'FAILED' }))
    expect(dto.status).toBe('FAILED')
    expect(dto.kind).toBe('READING')
  })

  it('maps mock exam set summary and full dto', () => {
    const row = makeMockExamSet({ content: { reading: [] }, modules: { reading: true } })
    expect(toMockExamSetSummaryDto(row)).toEqual(
      expect.objectContaining({
        externalId: 'set-1',
        generated: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      })
    )
    expect(toMockExamSetDto(row).content).toEqual({ reading: [] })
  })

  it('maps mock exam attempt setExternalId from the nested set', () => {
    const set = makeMockExamSet({ externalId: 'set-9' })
    const dto = toMockExamAttemptDto(makeMockExamAttempt({ set }))
    expect(dto.setExternalId).toBe('set-9')
    expect(dto.setId).toBe(set.id)
  })
})
