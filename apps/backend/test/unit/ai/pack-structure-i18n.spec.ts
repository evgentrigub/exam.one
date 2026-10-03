import {
  STRUCTURE_LOCALES,
  goetheDeA2,
  listPacks,
  localizeStructure,
  type ExamModule,
  type ExamPack,
  type ModuleText,
  type PartText,
} from '@exam-one/exam-packs'

const MODULE_FIELDS = [
  'label',
  'summary',
  'scoringNote',
] as const satisfies readonly (keyof ModuleText)[]
const PART_FIELDS = [
  'title',
  'format',
  'short',
  'goal',
  'skill',
] as const satisfies readonly (keyof PartText)[]

function digits(text: string): string[] {
  return text.match(/\d+/g) ?? []
}

/** Every number in the English source must survive translation: "5 ×", "~200 words", "Teil 1–2". */
function missingNumbers(source: string, translated: string): string[] {
  const kept = new Set(digits(translated))
  return digits(source).filter(number => !kept.has(number))
}

/** Lists every mismatch between a pack's English structure and one locale's translation. */
function structureProblems(pack: ExamPack, locale: (typeof STRUCTURE_LOCALES)[number]): string[] {
  const text = pack.structureText?.[locale]
  if (!text) return [`${pack.packId}/${locale}: missing translation`]

  const problems: string[] = []
  const moduleIds = pack.structure.map(module => module.id)
  for (const id of Object.keys(text)) {
    if (!moduleIds.includes(id as ExamModule['id']))
      problems.push(`${pack.packId}/${locale}: extra module ${id}`)
  }

  for (const module of pack.structure) {
    const where = `${pack.packId}/${locale}/${module.id}`
    const moduleText = text[module.id]
    if (!moduleText) {
      problems.push(`${where}: missing module`)
      continue
    }
    for (const field of MODULE_FIELDS) {
      if (!moduleText[field]?.trim()) problems.push(`${where}.${field}: empty`)
      for (const number of missingNumbers(module[field], moduleText[field] ?? '')) {
        problems.push(`${where}.${field}: lost number ${number}`)
      }
    }

    const partNumbers = module.parts.map(part => part.n)
    for (const n of Object.keys(moduleText.parts).map(Number)) {
      if (!partNumbers.includes(n)) problems.push(`${where}: extra part ${n}`)
    }
    for (const part of module.parts) {
      const partText = moduleText.parts[part.n]
      if (!partText) {
        problems.push(`${where}/${part.n}: missing part`)
        continue
      }
      for (const field of PART_FIELDS) {
        if (!partText[field]?.trim()) problems.push(`${where}/${part.n}.${field}: empty`)
        for (const number of missingNumbers(part[field], partText[field] ?? '')) {
          problems.push(`${where}/${part.n}.${field}: lost number ${number}`)
        }
      }
    }
  }
  return problems
}

describe('Pack structure translations', () => {
  it.each(listPacks().map(pack => [pack.packId, pack] as const))(
    '%s translates every module and part into every UI locale',
    (_packId, pack) => {
      const problems = STRUCTURE_LOCALES.flatMap(locale => structureProblems(pack, locale))
      expect(problems).toEqual([])
    }
  )
})

describe('localizeStructure', () => {
  it('returns the English source for English and unknown locales', () => {
    expect(localizeStructure(goetheDeA2, 'en')).toBe(goetheDeA2.structure)
    expect(localizeStructure(goetheDeA2, 'fr')).toBe(goetheDeA2.structure)
  })

  it('swaps in translated text and keeps everything else', () => {
    const english = goetheDeA2.structure
    const german = localizeStructure(goetheDeA2, 'de')
    const reading = german.find(module => module.id === 'reading')
    const translated = goetheDeA2.structureText?.de.reading

    expect(reading?.summary).toBe(translated?.summary)
    expect(reading?.parts[0]?.title).toBe(translated?.parts[1]?.title)
    expect(german.map(module => [module.id, module.minutes, module.points])).toEqual(
      english.map(module => [module.id, module.minutes, module.points])
    )
    const englishParts = english.flatMap(module => module.parts)
    german
      .flatMap(module => module.parts)
      .forEach((part, i) => {
        const source = englishParts[i]
        expect(part.n).toBe(source?.n)
        expect(part.available).toBe(source?.available)
        expect(part.runtime).toBe(source?.runtime)
        expect(part.practiceLabel).toBe(source?.practiceLabel)
      })
  })

  it('leaves the pack itself untouched', () => {
    const before = JSON.stringify(goetheDeA2.structure)
    localizeStructure(goetheDeA2, 'ru')
    expect(JSON.stringify(goetheDeA2.structure)).toBe(before)
  })
})
