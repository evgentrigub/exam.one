import type { MockExamSet } from '@exam-one/exam-packs'

type TranslateFn = (key: string, ...args: unknown[]) => string

/**
 * Stand-in while mock sets load, or when a pack ships no mock set at all. It has no modules,
 * so the mock screens render their "not found" state instead of dereferencing `undefined`.
 * Its title is untranslated; use `createUnavailableMockSet(t)` wherever it can reach the UI.
 */
export const UNAVAILABLE_MOCK_SET: MockExamSet = {
  id: 'unavailable',
  examId: '',
  level: '',
  title: 'Mock exam',
  generated: false,
  createdAt: '',
  modules: [],
  content: { reading: [], listening: [], writing: [], speaking: [] },
  rules: { maximumPoints: 100, passPoints: 60 },
}

/** The unavailable stand-in with a localized title. */
export function createUnavailableMockSet(t: TranslateFn): MockExamSet {
  return { ...UNAVAILABLE_MOCK_SET, title: t('dashboard.mockExam') }
}
