import {
  createGoetheMockOverview,
  type MockExamOverviewInput,
} from '../../goethe-shared/mock-overview'

const overview = createGoetheMockOverview('DELE B1')
export const deleB1MockOverview = {
  ...overview,
  assemble(outputLanguage: string, result: MockExamOverviewInput): string {
    return (
      overview.assemble(outputLanguage, result) +
      '\nThese are original app tasks. Each paper is normalized to /25. Both groups must reach 30/50: Reading + Writing and Listening + Speaking. Compare unrounded marks; a high total cannot compensate for a failed group. A group with pending=true has no final pass/fail result: ignore its partial points and passed flag. Do not claim an overall pass or fail while a required grade is pending or unavailable. Writing uses equally weighted analytic 0–3 bands (/24 normalized to /25); speaking uses transcript-visible Coherence, Accuracy and Range (/36 normalized to /25). Band 2 represents B1, while band 3 exceeds it. Official holistic weighting, acoustic fluency and live interaction are not assessed. Writing options and presentation topics are assigned, scenes are written and examiner cues are fixed. These are estimated mock results, not an official DELE certificate.'
    )
  },
}
