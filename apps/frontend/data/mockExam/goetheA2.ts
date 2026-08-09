import type { SkillId } from '~/utils/labels'

export interface MockExamExerciseDefinition {
  id: string
  title: string
  part: number
  maxRawPoints: number
}

export interface MockExamModuleDefinition {
  skill: SkillId
  minutes: number
  maxRawPoints: number
  maxFinalPoints: number
  multiplier: number
  provisional?: boolean
  exercises: MockExamExerciseDefinition[]
}

export interface MockExamSet {
  id: string
  examId: string
  level: string
  title: string
  modules: MockExamModuleDefinition[]
}

export const goetheA2MockExamSet1: MockExamSet = {
  id: 'goethe-a2-set-1',
  examId: 'goethe-a2',
  level: 'A2',
  title: 'Goethe-Zertifikat A2 · Set 1',
  modules: [
    {
      skill: 'reading',
      minutes: 30,
      maxRawPoints: 20,
      maxFinalPoints: 25,
      multiplier: 1.25,
      exercises: [1, 2, 3, 4].map(part => ({
        id: `mock-a2-set1-reading-teil${part}`,
        title: `Lesen · Teil ${part}`,
        part,
        maxRawPoints: 5,
      })),
    },
    {
      skill: 'listening',
      minutes: 30,
      maxRawPoints: 20,
      maxFinalPoints: 25,
      multiplier: 1.25,
      exercises: [1, 2, 3, 4].map(part => ({
        id: `mock-a2-set1-listening-teil${part}`,
        title: `Hören · Teil ${part}`,
        part,
        maxRawPoints: 5,
      })),
    },
    {
      skill: 'writing',
      minutes: 30,
      maxRawPoints: 20,
      maxFinalPoints: 25,
      multiplier: 1.25,
      exercises: [1, 2].map(part => ({
        id: `mock-a2-set1-writing-teil${part}`,
        title: `Schreiben · Teil ${part}`,
        part,
        maxRawPoints: 10,
      })),
    },
    {
      skill: 'speaking',
      minutes: 15,
      maxRawPoints: 12,
      maxFinalPoints: 12,
      multiplier: 1,
      provisional: true,
      exercises: [
        { id: 'mock-a2-set1-speaking-teil1', title: 'Sprechen · Teil 1', part: 1, maxRawPoints: 4 },
        { id: 'mock-a2-set1-speaking-teil2', title: 'Sprechen · Teil 2', part: 2, maxRawPoints: 8 },
      ],
    },
  ],
}

export const mockExamSets: MockExamSet[] = [goetheA2MockExamSet1]

export function getMockExamSet(id: string): MockExamSet | undefined {
  return mockExamSets.find(set => set.id === id)
}
