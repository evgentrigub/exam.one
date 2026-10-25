import type {
  MockExamContent,
  MockExamModuleDefinition,
  MockExamRules,
  MockExamSet,
} from '../../../goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from '../../../../types'
import { certpolA2PartRules } from '../../runtime'
import { certpolPlA2Structure } from '../../structure'
import { mockListeningPlSeeds } from './listening'
import { mockReadingPlSeeds } from './reading'
import { mockSpeakingPlSeeds } from './speaking'
import { mockWritingPlSeeds } from './writing'

const TITLES: Record<SkillId, string> = {
  listening: 'Rozumienie ze słuchu',
  reading: 'Rozumienie tekstów pisanych',
  writing: 'Pisanie',
  speaking: 'Mówienie',
}

/** The exam order: the written part (listening, reading, writing), then the oral part. */
const ORDER: readonly SkillId[] = ['listening', 'reading', 'writing', 'speaking']

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const

/** Task labels as the exam prints them: roman for the written modules, a / b for writing. */
function taskLabel(skill: SkillId, part: number): string {
  if (skill === 'writing') return `Zadanie ${part === 1 ? 'a' : 'b'}`
  if (skill === 'speaking') return `Zadanie ${part}`
  return `Zadanie ${ROMAN[part - 1] ?? part}`
}

/**
 * The A2 pass rule: at least 50% of the written part and 50% of the oral part, with no
 * overall mark (Dz.U. 2025 poz. 217, §23). Practice speaking is out of 36, because
 * pronunciation (0–4 of the exam's 40) cannot be marked from a transcript; the oral pass mark
 * stays at half of what is marked.
 */
const RULES: MockExamRules = {
  maximumPoints: 116,
  groups: [
    {
      id: 'written',
      label: 'Część pisemna · Słuchanie + Czytanie + Pisanie',
      skills: ['listening', 'reading', 'writing'],
      maximumPoints: 80,
      passPoints: 40,
    },
    {
      id: 'oral',
      label: 'Część ustna · Mówienie',
      skills: ['speaking'],
      maximumPoints: 36,
      passPoints: 18,
    },
  ],
}

function moduleOf(skill: SkillId) {
  const module = certpolPlA2Structure.find(item => item.id === skill)
  if (!module) throw new Error(`certpol-pl-a2: no ${skill} module`)
  return module
}

/** Raw points of a module: the sum of its tasks' maxima (30 / 30 / 20 / 36). Practice applies no conversion. */
function rawPointsFor(skill: SkillId): number {
  return moduleOf(skill).parts.reduce(
    (sum, part) => sum + certpolA2PartRules(skill, part.n).maxPoints,
    0
  )
}

/** Module definitions for a set; per-task points and replay limits come from the runtime rules. */
export function buildCertpolA2MockModules(content: MockExamContent): MockExamModuleDefinition[] {
  return ORDER.map(skill => {
    const maxRawPoints = rawPointsFor(skill)
    return {
      skill,
      minutes: moduleOf(skill).minutes,
      maxRawPoints,
      maxFinalPoints: maxRawPoints,
      multiplier: 1,
      // Speaking is graded by AI from transcripts only, so its score stays provisional.
      ...(skill === 'speaking' ? { provisional: true } : {}),
      exercises: [...(content[skill] as { id?: string; testingPart?: number }[])]
        .sort((left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0))
        .map(exercise => {
          const part = exercise.testingPart ?? 1
          const rules = certpolA2PartRules(skill, part)
          return {
            id: exercise.id ?? '',
            title: `${TITLES[skill]} · ${taskLabel(skill, part)}`,
            part,
            maxRawPoints: rules.maxPoints,
            ...(skill === 'listening' ? { replays: rules.replays ?? 1 } : {}),
          }
        }),
    }
  })
}

/**
 * Set 1 content. The Polish payloads use the raw field names the shared mock screens read; the
 * casts only bridge the Goethe A2-shaped content types.
 */
const set1Content: MockExamContent = {
  reading: mockReadingPlSeeds as unknown as MockExamContent['reading'],
  listening: mockListeningPlSeeds as unknown as MockExamContent['listening'],
  writing: mockWritingPlSeeds,
  speaking: mockSpeakingPlSeeds as unknown as MockExamContent['speaking'],
}

export const certpolA2MockExamSet1: MockExamSet = {
  id: 'certpol-pl-a2-set-1',
  examId: 'certpol-pl-a2',
  level: 'A2',
  title: 'Certyfikat Polski A2 · Set 1',
  generated: false,
  createdAt: '2026-10-04',
  rules: RULES,
  modules: buildCertpolA2MockModules(set1Content),
  content: set1Content,
}

/**
 * A generated set from pipeline content. The pipeline first calls this with blank content to
 * read the set id, so it must not depend on the content being complete.
 */
export function createCertpolA2MockExamSet(
  setNumber: number,
  content: MockExamContent
): MockExamSet {
  return {
    id: `certpol-pl-a2-set-${setNumber}`,
    examId: 'certpol-pl-a2',
    level: 'A2',
    title: `Certyfikat Polski A2 · Set ${setNumber}`,
    generated: true,
    createdAt: new Date().toISOString(),
    rules: RULES,
    modules: buildCertpolA2MockModules(content),
    content,
  }
}
