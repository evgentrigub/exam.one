import { localizeStructure, type ExamModule } from '@exam-one/exam-packs'

/**
 * The active pack's structure with its text in the UI locale, for display only.
 * Anything sent to the backend or the AI should keep using `useActivePack().pack`.
 */
export function useLocalizedStructure(): ComputedRef<ExamModule[]> {
  const { pack } = useActivePack()
  const { locale } = useI18n()
  return computed(() => localizeStructure(pack.value, String(locale.value)))
}
