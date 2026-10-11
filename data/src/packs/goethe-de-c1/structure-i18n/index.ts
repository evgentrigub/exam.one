import type { StructureTranslations } from '../../../types'
import { structureCopy } from '../practice-copy'
import { modules } from '../structure'
export const structureText: StructureTranslations = {
  de: structureCopy(modules, 'de'),
  es: structureCopy(modules, 'es'),
  pl: structureCopy(modules, 'pl'),
  ru: structureCopy(modules, 'ru'),
}
