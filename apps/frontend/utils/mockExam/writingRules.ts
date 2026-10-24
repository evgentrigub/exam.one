import type { ExamPack } from '@exam-one/exam-packs'

/**
 * The word count below which a writing part scores 0 without an AI review, from the pack's
 * runtime (Goethe A2: 10 / 15). Undefined when the part has no such rule (Goethe A1).
 */
export function writingZeroThreshold(pack: ExamPack, part: number): number | undefined {
  return pack.structure
    .find(module => module.id === 'writing')
    ?.parts.find(item => item.n === part)
    ?.runtime?.fields?.find(field => field.zeroBelowWords !== undefined)?.zeroBelowWords
}
