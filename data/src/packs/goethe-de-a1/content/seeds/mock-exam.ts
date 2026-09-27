import type {
  MockExamContent,
  MockExamModuleDefinition,
  MockExamSet,
} from '../../../goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from '../../../../types'
import { a1PartRules } from '../../runtime'
import { goetheDeA1Structure } from '../../structure'
import { mockListeningA1Seeds } from './listening'
import { mockReadingA1Seeds } from './reading'
import { mockSpeakingA1Seeds } from './speaking'
import { mockWritingA1Seeds } from './writing'

/**
 * Official scoring: each module has 15 raw points and is converted to 25 (×1.66, rounded
 * total). The mock uses the exact 25/15 so full marks read 25/25 per module and 100 in all.
 */
const RAW_POINTS = 15
const FINAL_POINTS = 25
const MULTIPLIER = FINAL_POINTS / RAW_POINTS

const TITLES: Record<SkillId, string> = {
  reading: 'Lesen',
  listening: 'Hören',
  writing: 'Schreiben',
  speaking: 'Sprechen',
}

/** Same module order as the Goethe A2 mock, so the shared screens and pipeline stay unchanged. */
const ORDER: readonly SkillId[] = ['reading', 'listening', 'writing', 'speaking']

const RULES = { maximumPoints: 100, passPoints: 60 }

function minutesFor(skill: SkillId): number {
  return goetheDeA1Structure.find(module => module.id === skill)?.minutes ?? 0
}

/** Module definitions for a set; per-part points and replay limits come from the runtime rules. */
export function buildGoetheA1MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => ({
    skill,
    minutes: minutesFor(skill),
    maxRawPoints: RAW_POINTS,
    maxFinalPoints: FINAL_POINTS,
    multiplier: MULTIPLIER,
    // Speaking is graded by AI from transcripts only, so its score stays provisional.
    ...(skill === 'speaking' ? { provisional: true } : {}),
    exercises: [...(content[skill] as { id?: string; testingPart?: number }[])]
      .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
      .map(exercise => {
        const part = exercise.testingPart ?? 1
        const rules = a1PartRules(skill, part)
        return {
          id: exercise.id ?? '',
          title: `${TITLES[skill]} · Teil ${part}`,
          part,
          maxRawPoints: rules.maxPoints,
          ...(skill === 'listening' ? { replays: rules.replays ?? 1 } : {}),
        }
      }),
  }))
}

/**
 * Set 1 content. The A1 payloads use the raw Goethe field names the shared mock screens read;
 * the casts only bridge the A2-shaped tuple types (A1 Hören Teil 1 has six items, not five).
 */
const set1Content: MockExamContent = {
  reading: mockReadingA1Seeds as unknown as MockExamContent['reading'],
  listening: mockListeningA1Seeds as unknown as MockExamContent['listening'],
  writing: mockWritingA1Seeds,
  speaking: mockSpeakingA1Seeds,
}

export const goetheA1MockExamSet1: MockExamSet = {
  id: 'goethe-a1-set-1',
  examId: 'goethe-a1',
  level: 'A1',
  title: 'Goethe-Zertifikat A1 · Set 1',
  generated: false,
  rules: RULES,
  createdAt: '2026-09-27',
  modules: buildGoetheA1MockModules(set1Content),
  content: set1Content,
}

export function createGoetheA1MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `goethe-a1-set-${setNumber}`,
    examId: 'goethe-a1',
    level: 'A1',
    title: `Goethe-Zertifikat A1 · Set ${setNumber}`,
    generated: true,
    rules: RULES,
    createdAt: new Date().toISOString(),
    modules: buildGoetheA1MockModules(content),
    content,
  }
}
