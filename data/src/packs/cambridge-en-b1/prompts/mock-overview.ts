import {
  createGoetheMockOverview,
  type MockExamOverviewInput,
} from '../../goethe-shared/mock-overview'

const overview = createGoetheMockOverview('Cambridge B1 Preliminary')
export const cambridgeB1MockOverview = {
  ...overview,
  assemble(outputLanguage: string, result: MockExamOverviewInput): string {
    return (
      overview.assemble(outputLanguage, result) +
      '\nThese are estimated Cambridge English Scale results from original, uncalibrated app tasks. Speaking is assessed from transcripts with an adapted rubric, without pronunciation or official criterion weighting. Do not describe this as an official Cambridge grade or certificate. If any required grade is pending or unavailable, the overall result remains pending.'
    )
  },
}
