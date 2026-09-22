import { listPacks } from '@exam-one/exam-packs'

export function getWritingTips(difficulty: string, testingPart?: number): string[] {
  const pack =
    listPacks().find(item => item.cefr === difficulty) ?? listPacks().find(item => item.live)
  const parts = pack?.structure.find(module => module.id === 'writing')?.parts ?? []
  const part = parts.find(item => item.n === testingPart) ?? parts.find(item => item.n === 2) ?? parts[0]
  return [...(part?.tips ?? [])]
}
