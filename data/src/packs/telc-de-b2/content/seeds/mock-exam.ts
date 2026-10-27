import type {
  MockExamContent,
  MockExamModuleDefinition,
  MockExamRules,
  MockExamSet,
} from '../../../goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from '../../../../types'
import { modules } from '../../structure'
import { mockReadingSeeds } from './mock-reading'
import { mockListeningSeeds } from './mock-listening'
import { mockWritingSeeds } from './mock-writing'
import { mockSpeakingSeeds } from './mock-speaking'

const ORDER: SkillId[] = ['reading', 'listening', 'writing', 'speaking']

/** Official final points per module: Lesen + Sprachbausteine 105, Hören 75, Schreiben 45, Sprechen 75. */
const FINAL_POINTS: Record<SkillId, number> = {
  reading: 105,
  listening: 75,
  writing: 45,
  speaking: 75,
}

/**
 * telc Deutsch B2: the written exam (225) and the oral exam (75) each pass at 60 %, exactly and
 * without rounding; a passed result earns a grade on its total of 300.
 */
export const TELC_B2_MOCK_RULES: MockExamRules = {
  maximumPoints: 300,
  groups: [
    {
      id: 'written',
      label: 'Schriftliche Prüfung',
      skills: ['reading', 'listening', 'writing'],
      maximumPoints: 225,
      passPoints: 135,
      rounding: 'none',
    },
    {
      id: 'oral',
      label: 'Mündliche Prüfung',
      skills: ['speaking'],
      maximumPoints: 75,
      passPoints: 45,
      rounding: 'none',
    },
  ],
  grades: [
    { id: 'sehrGut', min: 270 },
    { id: 'gut', min: 240 },
    { id: 'befriedigend', min: 210 },
    { id: 'ausreichend', min: 180 },
  ],
}

function exerciseTitle(skill: SkillId, part: number): string {
  if (skill === 'reading')
    return part <= 3 ? `Leseverstehen · Teil ${part}` : `Sprachbausteine · Teil ${part - 3}`
  if (skill === 'listening') return `Hörverstehen · Teil ${part}`
  if (skill === 'writing') return 'Schriftlicher Ausdruck'
  return `Mündlicher Ausdruck · Teil ${part}`
}

/** Empty content is supported while the generation worker allocates a draft set. */
export function buildTelcB2MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const module = modules.find(item => item.id === skill)!
    const maxRawPoints = module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
    return {
      skill,
      minutes: module.minutes,
      maxRawPoints,
      maxFinalPoints: FINAL_POINTS[skill],
      multiplier: FINAL_POINTS[skill] / maxRawPoints,
      ...(skill === 'speaking' ? { provisional: true, preparationMinutes: 20 } : {}),
      exercises: [...content[skill]]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = module.tasks.find(task => task.n === part)?.runtime
          if (!rules) throw new Error(`telc-de-b2: unknown ${skill} Part ${part}`)
          return {
            id: exercise.id ?? '',
            title: exerciseTitle(skill, part),
            part,
            maxRawPoints: rules.maxPoints,
            ...(skill === 'listening' ? { replays: rules.replays } : {}),
          }
        }),
    }
  })
}

const content = {
  reading: mockReadingSeeds,
  listening: mockListeningSeeds,
  writing: mockWritingSeeds,
  speaking: mockSpeakingSeeds,
} as unknown as MockExamContent

export const telcB2MockExamSet1: MockExamSet = {
  id: 'telc-de-b2-set-1',
  examId: 'telc-de-b2',
  level: 'B2',
  title: 'telc Deutsch B2 · Set 1',
  generated: false,
  createdAt: '2026-10-25',
  rules: TELC_B2_MOCK_RULES,
  modules: buildTelcB2MockModules(content),
  content,
}

export function createTelcB2MockExamSet(setNumber: number, content: MockExamContent): MockExamSet {
  return {
    id: `telc-de-b2-set-${setNumber}`,
    examId: 'telc-de-b2',
    level: 'B2',
    title: `telc Deutsch B2 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: TELC_B2_MOCK_RULES,
    modules: buildTelcB2MockModules(content),
    content,
  }
}
