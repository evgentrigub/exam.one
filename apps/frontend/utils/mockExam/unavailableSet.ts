import type { MockExamSet } from '@exam-one/exam-packs'

/**
 * Stand-in while mock sets load, or when a pack ships no mock set at all. It has no modules,
 * so the mock screens render their "not found" state instead of dereferencing `undefined`.
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
