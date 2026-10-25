import {
  Prisma,
  type PrismaClient,
  type ExerciseVisibility,
  type Skill,
} from './generated/prisma/client'
import { listPacks, type SkillId } from '@exam-one/exam-packs'

export interface SeedCatalogSummary {
  reading: number
  writing: number
  listening: number
  speaking: number
  /** Exercises seeded per pack, keyed by `packId`. */
  packs: Record<string, number>
}

const SKILLS: Record<SkillId, Skill> = {
  reading: 'READING',
  writing: 'WRITING',
  listening: 'LISTENING',
  speaking: 'SPEAKING',
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function visibilityOf(examOnly: unknown): ExerciseVisibility {
  return examOnly === true ? 'EXAM_ONLY' : 'PRACTICE'
}

async function upsertExercise(
  prisma: PrismaClient,
  input: {
    packId: string
    skill: Skill
    externalId: string
    level: string
    visibility: ExerciseVisibility
    payload: unknown
  }
): Promise<void> {
  const existing = await prisma.exercise.findFirst({
    where: { source: 'seed', packId: input.packId, externalId: input.externalId },
  })
  const data = {
    skill: input.skill,
    level: input.level,
    packId: input.packId,
    visibility: input.visibility,
    payload: asJson(input.payload),
  }
  if (existing) {
    await prisma.exercise.update({ where: { id: existing.id }, data })
    return
  }
  await prisma.exercise.create({
    data: { ...data, source: 'seed', externalId: input.externalId },
  })
}

/**
 * Upsert every registered pack's bundled exercises under that pack's id and level. Packs are
 * seeded whether or not they are live, so a pack's catalog is ready the moment it is enabled.
 */
async function seedPacks(prisma: PrismaClient): Promise<SeedCatalogSummary> {
  const summary: SeedCatalogSummary = {
    reading: 0,
    writing: 0,
    listening: 0,
    speaking: 0,
    packs: {},
  }
  for (const pack of listPacks()) {
    for (const [skill, items] of Object.entries(pack.seedExercises ?? {}) as [
      SkillId,
      readonly Record<string, unknown>[],
    ][]) {
      for (const item of items) {
        await upsertExercise(prisma, {
          packId: pack.packId,
          skill: SKILLS[skill],
          externalId: String(item['id']),
          level: pack.cefr,
          visibility: visibilityOf(item['examOnly']),
          payload: item,
        })
      }
      summary[skill] += items.length
      summary.packs[pack.packId] = (summary.packs[pack.packId] ?? 0) + items.length
    }
  }
  return summary
}

/** Upsert every registered pack's bundled mock set (its Set 1) as a shared, non-generated row. */
async function seedBundledMockSets(prisma: PrismaClient): Promise<void> {
  for (const pack of listPacks()) {
    const set = pack.bundledMockSet
    if (!set) continue
    const existing = await prisma.mockExamSet.findFirst({
      where: { generated: false, userId: null, packId: pack.packId, externalId: set.id },
    })
    const data = {
      userId: null,
      externalId: set.id,
      packId: pack.packId,
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
      continue
    }
    await prisma.mockExamSet.create({ data })
  }
}

export async function seedCatalog(prisma: PrismaClient): Promise<SeedCatalogSummary> {
  const summary = await seedPacks(prisma)
  await seedBundledMockSets(prisma)
  return summary
}
