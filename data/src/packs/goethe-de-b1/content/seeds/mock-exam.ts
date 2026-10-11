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

/** Each B1 module passes independently at 60/100, after rounding to a whole point. */
export const GOETHE_B1_MOCK_RULES: MockExamRules = {
  maximumPoints: 400,
  groups: ORDER.map(skill => ({
    id: skill,
    label: TITLES[skill],
    skills: [skill],
    maximumPoints: 100,
    passPoints: 60,
  })),
}

/** Empty content is supported while the generation worker allocates a draft set. */
export function buildGoetheB1MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const module = modules.find(item => item.id === skill)!
    const maxRawPoints = module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
    return {
      skill,
      minutes: module.minutes,
      maxRawPoints,
      maxFinalPoints: 100,
      multiplier: 100 / maxRawPoints,
      ...(skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...content[skill]]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = module.tasks.find(task => task.n === part)?.runtime
          if (!rules) throw new Error(`goethe-de-b1: unknown ${skill} Part ${part}`)
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

export const goetheB1MockExamSet1: MockExamSet = {
  id: 'goethe-de-b1-set-1',
  examId: 'goethe-de-b1',
  level: 'B1',
  title: 'Goethe-Zertifikat B1 · Set 1',
  generated: false,
  createdAt: '2026-10-10',
  rules: GOETHE_B1_MOCK_RULES,
  modules: buildGoetheB1MockModules(content),
  content,
}
export function createGoetheB1MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `goethe-de-b1-set-${setNumber}`,
    examId: 'goethe-de-b1',
    level: 'B1',
    title: `Goethe-Zertifikat B1 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: GOETHE_B1_MOCK_RULES,
    modules: buildGoetheB1MockModules(content),
    content,
  }
}
