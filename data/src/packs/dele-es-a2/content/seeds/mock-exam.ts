import type {
  MockExamContent,
  MockExamModuleDefinition,
  MockExamRules,
  MockExamSet,
} from '../../../goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from '../../../../types'
import { deleA2PartRules } from '../../runtime'
import { deleEsA2Structure } from '../../structure'
import { mockListeningEsSeeds } from './listening'
import { mockReadingEsSeeds } from './reading'
import { mockSpeakingEsSeeds } from './speaking'
import { mockWritingEsSeeds } from './writing'

/** Each prueba is worth 25 points; raw points are converted linearly (equal criterion weights). */
const FINAL_POINTS = 25

const TITLES: Record<SkillId, string> = {
  reading: 'Comprensión de lectura',
  listening: 'Comprensión auditiva',
  writing: 'Expresión e interacción escritas',
  speaking: 'Expresión e interacción orales',
}

/** The exam order, which is also the order the shared mock screens and pipeline use. */
const ORDER: readonly SkillId[] = ['reading', 'listening', 'writing', 'speaking']

/**
 * Apto needs at least 30 of 50 in each group; there is no overall pass mark (Guía del examen
 * DELE A2, p. 27).
 */
const RULES: MockExamRules = {
  maximumPoints: 100,
  groups: [
    {
      id: 'grupo-1',
      label: 'Grupo 1 · Lectura + Escritura',
      skills: ['reading', 'writing'],
      maximumPoints: 50,
      passPoints: 30,
    },
    {
      id: 'grupo-2',
      label: 'Grupo 2 · Auditiva + Oral',
      skills: ['listening', 'speaking'],
      maximumPoints: 50,
      passPoints: 30,
    },
  ],
}

function moduleOf(skill: SkillId) {
  const module = deleEsA2Structure.find(item => item.id === skill)
  if (!module) throw new Error(`dele-es-a2: no ${skill} module`)
  return module
}

/** Raw points of a prueba: the sum of its parts' maxima (25 / 25 / 12 / 18). */
function rawPointsFor(skill: SkillId): number {
  return moduleOf(skill).parts.reduce(
    (sum, part) => sum + deleA2PartRules(skill, part.n).maxPoints,
    0
  )
}

/** Module definitions for a set; per-part points and replay limits come from the runtime rules. */
export function buildDeleA2MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const maxRawPoints = rawPointsFor(skill)
    return {
      skill,
      minutes: moduleOf(skill).minutes,
      maxRawPoints,
      maxFinalPoints: FINAL_POINTS,
      multiplier: FINAL_POINTS / maxRawPoints,
      // Speaking is graded by AI from transcripts only, so its score stays provisional.
      ...(skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...(content[skill] as { id?: string; testingPart?: number }[])]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = deleA2PartRules(skill, part)
          return {
            id: exercise.id ?? '',
            title: `${TITLES[skill]} · Tarea ${part}`,
            part,
            maxRawPoints: rules.maxPoints,
            ...(skill === 'listening' ? { replays: rules.replays ?? 1 } : {}),
          }
        }),
    }
  })
}

/**
 * Set 1 content. The DELE payloads use the raw field names the shared mock screens read; the
 * casts only bridge the Goethe A2-shaped content types.
 */
const set1Content: MockExamContent = {
  reading: mockReadingEsSeeds as unknown as MockExamContent['reading'],
  listening: mockListeningEsSeeds as unknown as MockExamContent['listening'],
  writing: mockWritingEsSeeds,
  speaking: mockSpeakingEsSeeds as unknown as MockExamContent['speaking'],
}

export const deleA2MockExamSet1: MockExamSet = {
  id: 'dele-es-a2-set-1',
  examId: 'dele-es-a2',
  level: 'A2',
  title: 'DELE A2 · Set 1',
  generated: false,
  createdAt: '2026-10-03',
  rules: RULES,
  modules: buildDeleA2MockModules(set1Content),
  content: set1Content,
}

/**
 * A generated set from pipeline content. The pipeline first calls this with blank content to
 * read the set id, so it must not depend on the content being complete.
 */
export function createDeleA2MockExamSet(setNumber: number, content: MockExamContent): MockExamSet {
  return {
    id: `dele-es-a2-set-${setNumber}`,
    examId: 'dele-es-a2',
    level: 'A2',
    title: `DELE A2 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: RULES,
    modules: buildDeleA2MockModules(content),
    content,
  }
}
