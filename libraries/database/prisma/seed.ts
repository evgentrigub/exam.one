import {
  Prisma,
  PrismaClient,
  type ExamLevel,
  type ExerciseVisibility,
  type Skill,
} from '@prisma/client'
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

const prisma = new PrismaClient()

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function examLevelOf(difficulty: string | undefined): ExamLevel {
  return difficulty === 'C1' ? 'C1' : 'A2'
}

function visibilityOf(examOnly: boolean | undefined): ExerciseVisibility {
  return examOnly ? 'EXAM_ONLY' : 'PRACTICE'
}

async function upsertExercise(input: {
  skill: Skill
  externalId: string
  level: ExamLevel
  visibility: ExerciseVisibility
  payload: unknown
}): Promise<void> {
  const existing = await prisma.exercise.findFirst({
    where: { source: 'seed', externalId: input.externalId },
  })
  if (existing) {
    await prisma.exercise.update({
      where: { id: existing.id },
      data: {
        skill: input.skill,
        level: input.level,
        visibility: input.visibility,
        payload: asJson(input.payload),
      },
    })
    return
  }
  await prisma.exercise.create({
    data: {
      skill: input.skill,
      level: input.level,
      source: 'seed',
      visibility: input.visibility,
      externalId: input.externalId,
      payload: asJson(input.payload),
    },
  })
}

async function seedReading(): Promise<number> {
  const items = allDefaultReadingTopics as ReadingExercise[]
  for (const item of items) {
    await upsertExercise({
      skill: 'READING',
      externalId: item.id,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedWriting(): Promise<number> {
  const items = allDefaultWritingTopics as WritingExercise[]
  for (const item of items) {
    await upsertExercise({
      skill: 'WRITING',
      externalId: item.id,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedListening(): Promise<number> {
  const items = allDefaultListeningTopics as ListeningA2Exercise[]
  for (const item of items) {
    const externalId = item.id
    if (!externalId) continue
    await upsertExercise({
      skill: 'LISTENING',
      externalId,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedSpeaking(): Promise<number> {
  const items = allDefaultSpeakingTopics as SpeakingA2Topic[]
  for (const item of items) {
    await upsertExercise({
      skill: 'SPEAKING',
      externalId: item.id,
      level: examLevelOf(item.difficulty),
      visibility: visibilityOf(item.examOnly),
      payload: item,
    })
  }
  return items.length
}

async function seedMockSet1(): Promise<void> {
  const set = goetheA2MockExamSet1
  const existing = await prisma.mockExamSet.findFirst({
    where: { generated: false, externalId: set.id, userId: null },
  })
  const data = {
    userId: null,
    externalId: set.id,
    examId: set.examId,
    level: set.level,
    title: set.title,
    generated: false,
    content: asJson(set.content),
    modules: asJson(set.modules),
    createdAt: new Date(set.createdAt),
  }
  if (existing) {
    await prisma.mockExamSet.update({ where: { id: existing.id }, data })
    return
  }
  await prisma.mockExamSet.create({ data })
}

async function main(): Promise<void> {
  const reading = await seedReading()
  const writing = await seedWriting()
  const listening = await seedListening()
  const speaking = await seedSpeaking()
  await seedMockSet1()
  console.info(
    `Seeded exercises: reading=${reading} writing=${writing} listening=${listening} speaking=${speaking}; mock set 1 upserted.`
  )
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
