/** The practice languages of Settings → Generated files, in display order. */
export const MEDIA_LANGUAGES = [
  { id: 'en', labelKey: 'settings.mediaLangEn', code: 'EN' },
  { id: 'de', labelKey: 'settings.mediaLangDe', code: 'DE' },
  { id: 'pl', labelKey: 'settings.mediaLangPl', code: 'PL' },
  { id: 'es', labelKey: 'settings.mediaLangEs', code: 'ES' },
] as const

export type MediaLanguageId = (typeof MEDIA_LANGUAGES)[number]['id']

export function mediaLanguage(id: string): (typeof MEDIA_LANGUAGES)[number] | undefined {
  return MEDIA_LANGUAGES.find(language => language.id === id)
}
