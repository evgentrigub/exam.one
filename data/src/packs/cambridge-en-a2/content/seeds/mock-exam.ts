import type {
  MockExamContent,
  MockExamModuleDefinition,
  MockExamRules,
  MockExamSet,
  MockScaleRules,
} from '../../../goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from '../../../../types'
import { cambridgeA2PartRules } from '../../runtime'
import { cambridgeEnA2Structure } from '../../structure'
import { mockListeningKeySeeds } from './listening'
import { mockReadingKeySeeds } from './reading'
import { mockSpeakingKeySeeds } from './speaking'
import { mockWritingKeySeeds } from './writing'

/**
 * The Cambridge English Scale for A2 Key, from *The Cambridge English Scale explained*
 * (ENG/36303/V1/NOV23, p. 3): the raw marks a practice test needs for Scale 82, 100, 120 and
 * 140 per skill, plus the raw maximum at 150. Cambridge calls these rough guides.
 *
 * Speaking is marked out of 45 in the exam, including Pronunciation; practice marks it out of
 * 30 without Pronunciation, so `officialRaw` rescales 30 → 45 before the conversion.
 */
export const CAMBRIDGE_ENGLISH_SCALE: MockScaleRules = {
  id: 'cambridgeEnglish',
  min: 82,
  max: 150,
  pass: 120,
  officialRaw: { reading: 30, writing: 30, listening: 25, speaking: 45 },
  anchors: {
    reading: [
      [7, 82],
      [13, 100],
      [20, 120],
      [28, 140],
      [30, 150],
    ],
    writing: [
      [8, 82],
      [12, 100],
      [18, 120],
      [26, 140],
      [30, 150],
    ],
    listening: [
      [6, 82],
      [11, 100],
      [17, 120],
      [23, 140],
      [25, 150],
    ],
    speaking: [
      [10, 82],
      [18, 100],
      [27, 120],
      [41, 140],
      [45, 150],
    ],
  },
  bands: [
    { id: 'gradeA', min: 140 },
    { id: 'gradeB', min: 133 },
    { id: 'gradeC', min: 120 },
    { id: 'levelA1', min: 100 },
  ],
}

/**
 * Raw marks per module (30 / 30 / 25 / 30), passed on the Scale at 120. `passPoints` is the sum
 * of the raw Scale-120 thresholds (20 + 18 + 17 + 18), for any reader that ignores the scale.
 */
export const CAMBRIDGE_A2_MOCK_RULES: MockExamRules = {
  maximumPoints: 115,
  passPoints: 73,
  scale: CAMBRIDGE_ENGLISH_SCALE,
}

const TITLES: Record<SkillId, string> = {
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
}

/** The exam order: the Reading & Writing paper (40 + 20 minutes), then Listening, then Speaking. */
const ORDER: readonly SkillId[] = ['reading', 'writing', 'listening', 'speaking']

function moduleOf(skill: SkillId) {
  const module = cambridgeEnA2Structure.find(item => item.id === skill)
  if (!module) throw new Error(`cambridge-en-a2: no ${skill} module`)
  return module
}

/** Writing parts 1 and 2 are Reading & Writing Parts 6 and 7 of the paper. */
function officialPart(skill: SkillId, part: number): number {
  return skill === 'writing' ? part + 5 : part
}

/**
 * Module definitions for a set. Scores stay raw (`multiplier` 1) because the Scale conversion
 * reads raw marks; per-part points and replay limits come from the runtime rules.
 */
export function buildCambridgeA2MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const maxRawPoints = moduleOf(skill).parts.reduce(
      (sum, part) => sum + cambridgeA2PartRules(skill, part.n).maxPoints,
      0
    )
    return {
      skill,
      minutes: moduleOf(skill).minutes,
      maxRawPoints,
      maxFinalPoints: maxRawPoints,
      multiplier: 1,
      // Speaking is graded by AI from transcripts only, without Pronunciation, so it is provisional.
      ...(skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...(content[skill] as { id?: string; testingPart?: number }[])]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = cambridgeA2PartRules(skill, part)
          return {
            id: exercise.id ?? '',
            title: `${TITLES[skill]} · Part ${officialPart(skill, part)}`,
            part,
            maxRawPoints: rules.maxPoints,
            ...(skill === 'listening' ? { replays: rules.replays ?? 2 } : {}),
          }
        }),
    }
  })
}

/**
 * Set 1 content. The A2 Key payloads use the raw field names the shared mock screens read; the
 * casts only bridge the Goethe A2-shaped content types.
 */
const set1Content: MockExamContent = {
  reading: mockReadingKeySeeds as unknown as MockExamContent['reading'],
  listening: mockListeningKeySeeds as unknown as MockExamContent['listening'],
  writing: mockWritingKeySeeds,
  speaking: mockSpeakingKeySeeds as unknown as MockExamContent['speaking'],
}

export const cambridgeA2MockExamSet1: MockExamSet = {
  id: 'cambridge-a2-set-1',
  examId: 'cambridge-a2',
  level: 'A2',
  title: 'Cambridge A2 Key · Set 1',
  generated: false,
  createdAt: '2026-10-03',
  rules: CAMBRIDGE_A2_MOCK_RULES,
  modules: buildCambridgeA2MockModules(set1Content),
  content: set1Content,
}

/**
 * A generated set from pipeline content. The pipeline first calls this with blank content to
 * read the set id, so it must not depend on the content being complete.
 */
export function createCambridgeA2MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `cambridge-a2-set-${setNumber}`,
    examId: 'cambridge-a2',
    level: 'A2',
    title: `Cambridge A2 Key · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: CAMBRIDGE_A2_MOCK_RULES,
    modules: buildCambridgeA2MockModules(content),
    content,
  }
}
