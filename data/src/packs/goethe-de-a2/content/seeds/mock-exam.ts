import { mockExamListeningTopics } from './listening'
import { mockExamReadingTopics } from './reading'
import { mockExamSpeakingTopics } from './speaking'
import { mockExamWritingTopics } from './writing'
import type { ListeningA2Exercise } from '../types/listening'
import type { ReadingExercise } from '../types/reading'
import type { SpeakingA2Topic } from '../types/speaking'
import type { SkillId } from '../types/common'
import type { WritingExercise } from '../types/writing'

export interface MockExamContent {
  reading: ReadingExercise[]
  listening: ListeningA2Exercise[]
  writing: WritingExercise[]
  speaking: SpeakingA2Topic[]
}

export interface MockExamExerciseDefinition {
  id: string
  title: string
  part: number
  maxRawPoints: number
  replays?: number
}

export interface MockExamModuleDefinition {
  preparationMinutes?: number
  roundFinalPoints?: boolean
  /** Stable paper identity; omitted legacy sets use their renderer skill. */
  id?: string
  /** Optional paper name, independent of the renderer (for example Grammar). */
  label?: string
  /** Translation key for the paper name; label remains a prompt/document fallback. */
  labelKey?: string
  skill: SkillId
  minutes: number
  maxRawPoints: number
  maxFinalPoints: number
  multiplier: number
  provisional?: boolean
  exercises: MockExamExerciseDefinition[]
}

/** Resolve persisted state keys without changing older set IDs or attempt shapes. */
export function mockModuleId(module: MockExamModuleDefinition): string {
  return module.id ?? module.skill
}

/** Modules whose final points count together toward one pass mark (DELE: Grupo 1 and 2). */
export interface MockPassGroup {
  id: string
  label: string
  skills: SkillId[]
  /** Select independent papers instead of renderer skills when present. */
  moduleIds?: string[]
  /** Legacy groups round to whole marks; fractional papers compare exact points. */
  rounding?: 'none'
  maximumPoints: number
  passPoints: number
}

/**
 * A reported score scale (Cambridge English Scale): each module's raw marks convert to a scale
 * score through ascending `[raw, scale]` anchors, interpolated linearly; the overall result is
 * the rounded average of the module scores. `officialRaw` is the raw maximum the anchors are
 * written for; a module marked out of fewer points is rescaled to it first.
 */
export interface MockScaleRules {
  /** Names the scale for the UI (`mockExam.scale.<id>`). */
  id: string
  /** Original app tasks use an estimated conversion, not a calibrated official result. */
  estimated?: boolean
  /** The lowest reported score; anything below shows as "below {min}". */
  min: number
  max: number
  /** The overall score that passes. */
  pass: number
  officialRaw: Partial<Record<SkillId, number>>
  anchors: Partial<Record<SkillId, ReadonlyArray<readonly [number, number]>>>
  /** Highest first: an overall score earns the first band whose `min` it reaches. */
  bands: ReadonlyArray<{ id: string; min: number; labelKey?: string }>
}

/**
 * How a set is passed: one total against `passPoints` (Goethe: 60 of 100), every group
 * against its own mark when `groups` is set, or the average on a `scale` reaching its pass
 * score (Cambridge: 120).
 */
/**
 * A grade awarded on the exact total of a passed result (telc: sehr gut from 270 of 300).
 * Highest first; the UI names it `mockExam.grades.<id>` unless `labelKey` says otherwise.
 */
export interface MockGradeBand {
  id: string
  min: number
  labelKey?: string
}

export interface MockExamRules {
  maximumPoints: number
  passPoints?: number
  groups?: MockPassGroup[]
  scale?: MockScaleRules
  /** Grades for a passed result; a failed result reports `failed`, whatever its total. */
  grades?: ReadonlyArray<MockGradeBand>
}

export interface MockExamSet {
  id: string
  examId: string
  level: string
  title: string
  generated: boolean
  createdAt: string
  modules: MockExamModuleDefinition[]
  content: MockExamContent
  rules?: MockExamRules
}

export const goetheA2MockExamSet1: MockExamSet = {
  id: 'goethe-a2-set-1',
  examId: 'goethe-a2',
  level: 'A2',
  title: 'Goethe-Zertifikat A2 · Set 1',
  generated: false,
  rules: { maximumPoints: 100, passPoints: 60 },
  createdAt: '2026-08-09',
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
        replays: part === 1 || part === 4 ? 2 : 1,
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
  content: {
    reading: mockExamReadingTopics,
    listening: mockExamListeningTopics,
    writing: mockExamWritingTopics,
    speaking: mockExamSpeakingTopics,
  },
}

export const mockExamSets: MockExamSet[] = [goetheA2MockExamSet1]

export function getMockExamSet(id: string): MockExamSet | undefined {
  return mockExamSets.find(set => set.id === id)
}

export function createGoetheA2MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  const setId = `goethe-a2-set-${setNumber}`
  const definition = (
    skill: SkillId,
    minutes: number,
    maxRawPoints: number,
    maxFinalPoints: number,
    multiplier: number
  ) => ({
    skill,
    minutes,
    maxRawPoints,
    maxFinalPoints,
    multiplier,
    ...(skill === 'speaking' ? { provisional: true } : {}),
    exercises: content[skill].map(exercise => ({
      id: exercise.id ?? '',
      title:
        skill === 'speaking'
          ? `Sprechen · Teil ${exercise.testingPart}`
          : 'title' in exercise
            ? exercise.title
            : `${skill} · Teil ${exercise.testingPart}`,
      part: exercise.testingPart ?? 1,
      ...(skill === 'listening'
        ? { replays: exercise.testingPart === 1 || exercise.testingPart === 4 ? 2 : 1 }
        : {}),
      maxRawPoints:
        skill === 'speaking' ? (exercise.testingPart === 1 ? 4 : 8) : skill === 'writing' ? 10 : 5,
    })),
  })

  return {
    id: setId,
    examId: 'goethe-a2',
    level: 'A2',
    title: `Goethe-Zertifikat A2 · Set ${setNumber}`,
    generated: true,
    rules: { maximumPoints: 100, passPoints: 60 },
    createdAt: new Date().toISOString(),
    modules: [
      definition('reading', 30, 20, 25, 1.25),
      definition('listening', 30, 20, 25, 1.25),
      definition('writing', 30, 20, 25, 1.25),
      definition('speaking', 15, 12, 12, 1),
    ],
    content,
  }
}
