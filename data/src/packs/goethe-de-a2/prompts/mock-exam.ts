import { createGoetheMockOverview } from '../../goethe-shared/mock-overview'

export { isMockExamOverview } from '../../goethe-shared/mock-overview'
export type {
  MockExamOverview,
  MockExamOverviewInput,
  MockExamOverviewItem,
} from '../../goethe-shared/mock-overview'

export const goetheA2MockOverview = createGoetheMockOverview('Goethe A2')

export const buildMockExamOverviewPrompt = goetheA2MockOverview.assemble
