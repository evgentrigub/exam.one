import type {
  MockExamContent,
  MockExamModuleDefinition,
  MockExamRules,
  MockExamSet,
  MockScaleRules,
} from '../../../goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from '../../../../types'
import { modules } from '../../structure'
import { mockReadingSeeds } from './mock-reading'
import { mockListeningSeeds } from './mock-listening'
import { mockWritingSeeds } from './mock-writing'
import { mockSpeakingSeeds } from './mock-speaking'

/**
 * B1 Preliminary anchors from Cambridge's practice-test conversion guide, p. 4:
 * https://www.cambridgeenglish.org/my/images/210434-converting-practice-test-scores-to-cambridge-english-scale-scores.pdf
 * The maximum-mark → 170 endpoints are app estimates, as in A2. These original tasks are
 * uncalibrated. Speaking's 80 transcript-visible practice marks are normalized to the official
 * /30 maximum; this does not reproduce the official criterion weighting or pronunciation.
 */
export const CAMBRIDGE_B1_SCALE: MockScaleRules = {
  id: 'cambridgeEnglish',
  min: 102,
  max: 170,
  pass: 140,
  estimated: true,
  officialRaw: { reading: 32, writing: 40, listening: 25, speaking: 30 },
  anchors: {
    reading: [
      [5, 102],
      [13, 120],
      [23, 140],
      [29, 160],
      [32, 170],
    ],
    writing: [
      [10, 102],
      [16, 120],
      [24, 140],
      [34, 160],
      [40, 170],
    ],
    listening: [
      [5, 102],
      [11, 120],
      [18, 140],
      [23, 160],
      [25, 170],
    ],
    speaking: [
      [7, 102],
      [12, 120],
      [18, 140],
      [27, 160],
      [30, 170],
    ],
  },
  bands: [
    { id: 'gradeA', min: 160, labelKey: 'mockExam.scale.bands.gradeAB2' },
    { id: 'gradeB', min: 153, labelKey: 'mockExam.scale.bands.gradeBB1' },
    { id: 'gradeC', min: 140, labelKey: 'mockExam.scale.bands.gradeCB1' },
    { id: 'levelA2', min: 120 },
  ],
}
export const CAMBRIDGE_B1_MOCK_RULES: MockExamRules = {
  maximumPoints: 177,
  scale: CAMBRIDGE_B1_SCALE,
}
const ORDER: SkillId[] = ['reading', 'writing', 'listening', 'speaking']
const TITLES = {
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
}

/** Blank content is valid when the generation pipeline allocates a draft set ID. */
export function buildCambridgeB1MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const module = modules.find(item => item.id === skill)!
    const maxRawPoints = module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
    return {
      skill,
      minutes: module.minutes,
      maxRawPoints,
      maxFinalPoints: maxRawPoints,
      multiplier: 1,
      ...(skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...content[skill]]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = module.tasks.find(task => task.n === part)?.runtime
          if (!rules) throw new Error(`cambridge-en-b1: unknown ${skill} Part ${part}`)
          return {
            id: exercise.id ?? '',
            title: `${TITLES[skill]} · Part ${part}`,
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

export const cambridgeB1MockExamSet1: MockExamSet = {
  id: 'cambridge-en-b1-set-1',
  examId: 'cambridge-en-b1',
  level: 'B1',
  title: 'Cambridge B1 Preliminary · Set 1',
  generated: false,
  createdAt: '2026-10-10',
  rules: CAMBRIDGE_B1_MOCK_RULES,
  modules: buildCambridgeB1MockModules(content),
  content,
}

export function createCambridgeB1MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `cambridge-en-b1-set-${setNumber}`,
    examId: 'cambridge-en-b1',
    level: 'B1',
    title: `Cambridge B1 Preliminary · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: CAMBRIDGE_B1_MOCK_RULES,
    modules: buildCambridgeB1MockModules(content),
    content,
  }
}
