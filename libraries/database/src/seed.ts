import {
  Prisma,
  type PrismaClient,
  type ExamLevel,
  type ExerciseVisibility,
  type Skill,
} from './generated/prisma/client'
import {
  allDefaultListeningTopics,
  allDefaultReadingTopics,
  allDefaultSpeakingTopics,
  allDefaultWritingTopics,
  goetheA2MockExamSet1,
  type ListeningA2Exercise,
  type ReadingExercise,
  type SpeakingA2Topic,
  type WritingExercise,
} from '@exam-one/exam-content'

export interface SeedCatalogSummary {
  reading: number
  writing: number
  listening: number
  speaking: number
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function examLevelOf(difficulty: string | undefined): ExamLevel {
  return difficulty === 'C1' ? 'C1' : 'A2'
}

function visibilityOf(examOnly: boolean | undefined): ExerciseVisibility {
  return examOnly ? 'EXAM_ONLY' : 'PRACTICE'
}

async function upsertExercise(
  prisma: PrismaClient,
  input: {
    skill: Skill
    externalId: string
    level: ExamLevel
    visibility: ExerciseVisibility
    payload: unknown
  }
): Promise<void> {
  const existing = await prisma.exercise.findFirst({
    where: { source: 'seed', packId: input.level === 'C1' ? 'goethe-de-c1' : 'goethe-de-a2', externalId: input.externalId },
  })
  const data = {
    skill: input.skill,
    level: input.level,
    packId: input.level === 'C1' ? 'goethe-de-c1' : 'goethe-de-a2' as const,
    visibility: input.visibility,
    payload: asJson(input.payload),
  }
  if (existing) {
    await prisma.exercise.update({
      where: { id: existing.id },
      data,
    })
    return
  }
  await prisma.exercise.create({
    data: {
      skill: input.skill,
      level: input.level,
      packId: input.level === 'C1' ? 'goethe-de-c1' : 'goethe-de-a2',
      source: 'seed',
      visibility: input.visibility,
      externalId: input.externalId,
      payload: asJson(input.payload),
    },
  })
}

async function seedReading(prisma: PrismaClient): Promise<number> {
  const items = allDefaultReadingTopics as ReadingExercise[]
  for (const item of items) {
    await upsertExercise(prisma, {
      skill: 'READING',
      externalId: item.id,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedWriting(prisma: PrismaClient): Promise<number> {
  const items = allDefaultWritingTopics as WritingExercise[]
  for (const item of items) {
    await upsertExercise(prisma, {
      skill: 'WRITING',
      externalId: item.id,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedListening(prisma: PrismaClient): Promise<number> {
  const items = allDefaultListeningTopics as ListeningA2Exercise[]
  for (const item of items) {
    const externalId = item.id
    if (!externalId) continue
    await upsertExercise(prisma, {
      skill: 'LISTENING',
      externalId,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedSpeaking(prisma: PrismaClient): Promise<number> {
  const items = allDefaultSpeakingTopics as SpeakingA2Topic[]
  for (const item of items) {
    await upsertExercise(prisma, {
      skill: 'SPEAKING',
      externalId: item.id,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedMockSet1(prisma: PrismaClient): Promise<void> {
  const set = goetheA2MockExamSet1
  const existing = await prisma.mockExamSet.findFirst({
    where: { generated: false, externalId: set.id, userId: null },
  })
  const data = {
    userId: null,
    externalId: set.id,
    packId: 'goethe-de-a2',
    examId: set.examId,
    level: set.level,
    title: set.title,
    generated: false,
    content: asJson(set.content),
    modules: asJson(set.modules),
    ...(set.rules ? { rules: asJson(set.rules) } : {}),
    createdAt: new Date(set.createdAt),
  }
  if (existing) {
    await prisma.mockExamSet.update({ where: { id: existing.id }, data })
    return
  }
  await prisma.mockExamSet.create({ data })
}

export async function seedCatalog(prisma: PrismaClient): Promise<SeedCatalogSummary> {
  const reading = await seedReading(prisma)
  const writing = await seedWriting(prisma)
  const listening = await seedListening(prisma)
  const speaking = await seedSpeaking(prisma)
  await seedMockSet1(prisma)
  return { reading, writing, listening, speaking }
}
