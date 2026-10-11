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

const PAPERS: {
  id: string
  skill: SkillId
  label: string
  minutes: number
  first: number
  last: number
  maximum: number
}[] = [
  {
    id: 'listening',
    skill: 'listening',
    label: 'Słuchanie',
    minutes: 30,
    first: 1,
    last: 5,
    maximum: 30,
  },
  {
    id: 'reading',
    skill: 'reading',
    label: 'Czytanie',
    minutes: 40,
    first: 1,
    last: 5,
    maximum: 30,
  },
  {
    id: 'grammar',
    skill: 'reading',
    label: 'Gramatyka',
    minutes: 45,
    first: 6,
    last: 13,
    maximum: 30,
  },
  {
    id: 'writing',
    skill: 'writing',
    label: 'Pisanie',
    minutes: 75,
    first: 1,
    last: 2,
    maximum: 30,
  },
  {
    id: 'speaking',
    skill: 'speaking',
    label: 'Mówienie',
    minutes: 15,
    first: 1,
    last: 3,
    maximum: 40,
  },
]
export const CERTPOL_B1_MOCK_RULES: MockExamRules = {
  maximumPoints: 160,
  groups: PAPERS.map(paper => ({
    id: paper.id,
    label: paper.label,
    skills: [paper.skill],
    moduleIds: [paper.id],
    maximumPoints: paper.maximum,
    passPoints: paper.maximum / 2,
    rounding: 'none',
  })),
}
/** Five papers, four renderers. The full static blueprint also works for empty worker drafts. */
export function buildCertpolB1MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return PAPERS.map(paper => {
    const tasks = modules
      .find(module => module.id === paper.skill)!
      .tasks.filter(task => task.n >= paper.first && task.n <= paper.last)
    const maxRawPoints = tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
    return {
      id: paper.id,
      skill: paper.skill,
      label: paper.label,
      labelKey: paper.id === 'grammar' ? 'mockExam.grammar' : `skill.${paper.skill}`,
      minutes: paper.minutes,
      maxRawPoints,
      maxFinalPoints: paper.maximum,
      multiplier: paper.maximum / maxRawPoints,
      ...(paper.skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...content[paper.skill]]
        .filter(exercise => {
          const part = exercise.testingPart ?? 1
          return part >= paper.first && part <= paper.last
        })
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const task = tasks.find(task => task.n === part)!
          return {
            id: exercise.id ?? '',
            title: `${paper.label} · Zadanie ${part - paper.first + 1}`,
            part,
            maxRawPoints: task.runtime.maxPoints,
            ...(paper.skill === 'listening' ? { replays: task.runtime.replays } : {}),
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
export const certpolB1MockExamSet1: MockExamSet = {
  id: 'certpol-pl-b1-set-1',
  examId: 'certpol-pl-b1',
  level: 'B1',
  title: 'Certyfikat Polski B1 · Set 1',
  generated: false,
  createdAt: '2026-10-10',
  rules: CERTPOL_B1_MOCK_RULES,
  modules: buildCertpolB1MockModules(content),
  content,
}
export function createCertpolB1MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `certpol-pl-b1-set-${setNumber}`,
    examId: 'certpol-pl-b1',
    level: 'B1',
    title: `Certyfikat Polski B1 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: CERTPOL_B1_MOCK_RULES,
    modules: buildCertpolB1MockModules(content),
    content,
  }
}
