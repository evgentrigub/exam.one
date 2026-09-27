import { validatePacks } from './validation'
import { goetheDeA1 } from './packs/goethe-de-a1/pack'
import { goetheDeA2 } from './packs/goethe-de-a2/pack'
import { goetheDeC1 } from './packs/goethe-de-c1/pack'
import { DEFAULT_PACK_ID, type ExamPack } from './types'

const PACKS: readonly ExamPack[] = [goetheDeA2, goetheDeA1, goetheDeC1]
validatePacks(PACKS)

export function listPacks(): readonly ExamPack[] {
  return PACKS
}

export function listLivePacks(): ExamPack[] {
  return PACKS.filter(pack => pack.live)
}

export function getPack(id: string | undefined | null): ExamPack | undefined {
  if (!id) return undefined
  return PACKS.find(pack => pack.packId === id || pack.examIds.includes(id))
}

export function getLivePack(id: string | undefined | null): ExamPack {
  const pack = getPack(id)
  if (pack?.live) return pack
  const fallback = getPack(DEFAULT_PACK_ID)
  if (!fallback?.live) {
    throw new Error(`Default pack ${DEFAULT_PACK_ID} is not registered as live`)
  }
  return fallback
}
