import { validatePacks } from './validation'
import { cambridgeEnA2 } from './packs/cambridge-en-a2/pack'
import { cambridgeEnB1 } from './packs/cambridge-en-b1/pack'
import { certpolPlA2 } from './packs/certpol-pl-a2/pack'
import { certpolPlB1 } from './packs/certpol-pl-b1/pack'
import { deleEsA2 } from './packs/dele-es-a2/pack'
import { deleEsB1 } from './packs/dele-es-b1/pack'
import { goetheDeA1 } from './packs/goethe-de-a1/pack'
import { goetheDeA2 } from './packs/goethe-de-a2/pack'
import { goetheDeB1 } from './packs/goethe-de-b1/pack'
import { goetheDeC1 } from './packs/goethe-de-c1/pack'
import { telcDeB2 } from './packs/telc-de-b2/pack'
import { DEFAULT_PACK_ID, type ExamPack } from './types'

const PACKS: readonly ExamPack[] = [
  goetheDeA1,
  goetheDeA2,
  goetheDeB1,
  cambridgeEnA2,
  cambridgeEnB1,
  certpolPlA2,
  certpolPlB1,
  deleEsA2,
  deleEsB1,
  goetheDeC1,
  telcDeB2,
]
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
