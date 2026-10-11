import {
  createGoetheMockOverview,
  type MockExamOverviewInput,
} from '../../goethe-shared/mock-overview'
const overview = createGoetheMockOverview('Certyfikat Polski B1')
export const certpolB1MockOverview = {
  ...overview,
  assemble(outputLanguage: string, result: MockExamOverviewInput): string {
    return (
      overview.assemble(outputLanguage, result) +
      '\nThese original adult B1 app tasks use five independent papers: Listening /30, Reading /30, Grammar /30, Writing /30 and estimated Speaking /40. Each requires at least 50%, with no rounding up and no compensation by another paper. Paper id and label identify Grammar separately even though its renderer skill is reading; feedback about Grammar must explicitly name it. A group with pending=true has no final result; do not claim an overall pass or fail until every required grade is available. Writing is an assigned 25+175-word pair, with formative 6+24-point allocation across 10/10/10 criteria, rather than the official choice of three sets. Speaking uses a written scene and fixed solo examiner cards; transcript-visible /36 points are normalized to estimated /40. Pronunciation, intonation and live interaction are not assessed. Do not call this an official certificate or an official calibrated score.'
    )
  },
}
