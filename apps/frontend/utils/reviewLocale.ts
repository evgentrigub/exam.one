import { toLanguageOption, type LanguageOptions } from '~/utils/types'

export function resolveReviewOutputLanguage(locale: string): LanguageOptions {
  return toLanguageOption(locale)
}

export function useReviewOutputLanguage(): ComputedRef<LanguageOptions> {
  const { locale } = useI18n()
  return computed(() => resolveReviewOutputLanguage(String(locale.value)))
}
