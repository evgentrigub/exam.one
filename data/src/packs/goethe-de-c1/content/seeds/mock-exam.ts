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
const TITLES = { reading: 'Lesen', listening: 'Hören', writing: 'Schreiben', speaking: 'Sprechen' }

/** Each C1 module passes independently at 60/100; only objective conversion rounds. */
export const GOETHE_C1_MOCK_RULES: MockExamRules = {
  maximumPoints: 400,
  groups: ORDER.map(skill => ({
    id: skill,
    label: TITLES[skill],
    skills: [skill],
    maximumPoints: 100,
    passPoints: 60,
    rounding: 'none',
  })),
}

/** Empty content is supported while the generation worker allocates a draft set. */
export function buildGoetheC1MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const module = modules.find(item => item.id === skill)!
    const maxRawPoints = module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
    return {
      skill,
      minutes: module.minutes,
      maxRawPoints,
      maxFinalPoints: 100,
      multiplier: 100 / maxRawPoints,
      ...(skill === 'reading' || skill === 'listening' ? { roundFinalPoints: true } : {}),
      ...(skill === 'speaking' ? { provisional: true, preparationMinutes: 20 } : {}),
      exercises: [...content[skill]]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = module.tasks.find(task => task.n === part)?.runtime
          if (!rules) throw new Error(`goethe-de-c1: unknown ${skill} Part ${part}`)
          return {
            id: exercise.id ?? '',
            title: `${TITLES[skill]} · ${skill === 'writing' ? 'Aufgabe' : 'Teil'} ${part}`,
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

export const goetheC1MockExamSet1: MockExamSet = {
  id: 'goethe-de-c1-set-1',
  examId: 'goethe-de-c1',
  level: 'C1',
  title: 'Goethe-Zertifikat C1 · Set 1',
  generated: false,
  createdAt: '2026-10-10',
  rules: GOETHE_C1_MOCK_RULES,
  modules: buildGoetheC1MockModules(content),
  content,
}
export function createGoetheC1MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `goethe-de-c1-set-${setNumber}`,
    examId: 'goethe-de-c1',
    level: 'C1',
    title: `Goethe-Zertifikat C1 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: GOETHE_C1_MOCK_RULES,
    modules: buildGoetheC1MockModules(content),
    content,
  }
}
