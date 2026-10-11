import {
  createGoetheMockOverview,
  type MockExamOverviewInput,
} from '../../goethe-shared/mock-overview'

const overview = createGoetheMockOverview('Goethe-Zertifikat C1')
export const goetheC1MockOverview = {
  ...overview,
  assemble(outputLanguage: string, result: MockExamOverviewInput): string {
    return (
      overview.assemble(outputLanguage, result) +
      '\nThese are original app tasks. Each of the four modules is independent, scored out of 100 and passed at 60. Only Reading and Listening use rounded conversion; Writing totals directly and Speaking is provisional. Never round a Writing total below 60 up to a pass. A high total cannot compensate for a failed module. A group with pending=true has no final pass/fail result: ignore its partial points and passed flag. Do not claim an overall pass or fail while a required grade is pending or unavailable. Writing grades are AI estimates. Speaking uses fixed partner cues and transcripts with an adapted /50 rubric normalized to /100; pronunciation, live interaction and official weighting are not assessed. Do not describe these results as an official Goethe certificate.'
    )
  },
}
