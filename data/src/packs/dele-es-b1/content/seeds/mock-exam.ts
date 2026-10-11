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
const TITLES = {
  reading: 'Comprensión de lectura',
  listening: 'Comprensión auditiva',
  writing: 'Expresión e interacción escritas',
  speaking: 'Expresión e interacción orales',
}

/** Both groups require 30/50. Fractional marks must not be rounded across a pass threshold. */
export const DELE_B1_MOCK_RULES: MockExamRules = {
  maximumPoints: 100,
  groups: [
    {
      id: 'grupo-1',
      label: 'Grupo 1 · Lectura + Escritura',
      skills: ['reading', 'writing'],
      maximumPoints: 50,
      passPoints: 30,
      rounding: 'none',
    },
    {
      id: 'grupo-2',
      label: 'Grupo 2 · Auditiva + Oral',
      skills: ['listening', 'speaking'],
      maximumPoints: 50,
      passPoints: 30,
      rounding: 'none',
    },
  ],
}

/** Empty content is supported while the generation worker allocates a draft set. */
export function buildDeleB1MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const module = modules.find(item => item.id === skill)!
    const maxRawPoints = module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
    return {
      skill,
      minutes: module.minutes,
      maxRawPoints,
      maxFinalPoints: 25,
      multiplier: 25 / maxRawPoints,
      ...(skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...content[skill]]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = module.tasks.find(task => task.n === part)?.runtime
          if (!rules) throw new Error(`dele-es-b1: unknown ${skill} Part ${part}`)
          return {
            id: exercise.id ?? '',
            title: `${TITLES[skill]} · Tarea ${part}`,
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

export const deleB1MockExamSet1: MockExamSet = {
  id: 'dele-es-b1-set-1',
  examId: 'dele-es-b1',
  level: 'B1',
  title: 'DELE B1 · Set 1',
  generated: false,
  createdAt: '2026-10-11',
  rules: DELE_B1_MOCK_RULES,
  modules: buildDeleB1MockModules(content),
  content,
}
export function createDeleB1MockExamSet(setNumber: number, content: MockExamContent): MockExamSet {
  return {
    id: `dele-es-b1-set-${setNumber}`,
    examId: 'dele-es-b1',
    level: 'B1',
    title: `DELE B1 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: DELE_B1_MOCK_RULES,
    modules: buildDeleB1MockModules(content),
    content,
  }
}
