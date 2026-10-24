import type { ExamPack } from '@exam-one/exam-packs'

/** The coach tips of a writing part, from the active pack (two packs may share a CEFR level). */
export function getWritingTips(pack: ExamPack, testingPart?: number): string[] {
  const parts = pack.structure.find(module => module.id === 'writing')?.parts ?? []
  const part = parts.find(item => item.n === testingPart) ?? parts.find(item => item.n === 2) ?? parts[0]
  return [...(part?.tips ?? [])]
}
