import {
  STRUCTURE_LOCALES,
  type ExamModule,
  type ExamPack,
  type ExamPart,
  type ModuleText,
  type PartText,
  type StructureLocale,
} from './types'

function isStructureLocale(locale: string): locale is StructureLocale {
  return (STRUCTURE_LOCALES as readonly string[]).includes(locale)
}

function localizePart(part: ExamPart, text: PartText | undefined): ExamPart {
  return text ? { ...part, ...text } : part
}

function localizeModule(module: ExamModule, text: ModuleText | undefined): ExamModule {
  if (!text) return module
  const { parts, ...moduleText } = text
  return {
    ...module,
    ...moduleText,
    parts: module.parts.map(part => localizePart(part, parts[part.n])),
  }
}

/**
 * The pack's structure with its user-facing text in `locale`, for display only.
 *
 * English, an unknown locale, or a module the pack has not translated keep the English
 * source. The pack itself is never changed, so callers that feed the structure to
 * prompts or adapters are unaffected.
 */
export function localizeStructure(pack: ExamPack, locale: string): ExamModule[] {
  const text = isStructureLocale(locale) ? pack.structureText?.[locale] : undefined
  if (!text) return pack.structure
  return pack.structure.map(module => localizeModule(module, text[module.id]))
}
