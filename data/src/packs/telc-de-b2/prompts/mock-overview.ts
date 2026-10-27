import {
  createGoetheMockOverview,
  type MockExamOverviewInput,
} from '../../goethe-shared/mock-overview'

const overview = createGoetheMockOverview('telc Deutsch B2')

export const telcB2MockOverview = {
  ...overview,
  assemble(outputLanguage: string, result: MockExamOverviewInput): string {
    return (
      overview.assemble(outputLanguage, result) +
      '\nThese are original app tasks. telc Deutsch B2 has two parts: the written exam (Leseverstehen and Sprachbausteine 105, Hörverstehen 75, Schriftlicher Ausdruck 45; 225 points) and the oral exam (75 points). Each must reach 60 % on its own (135 and 45 points, exactly, without rounding up); a high written score cannot compensate for a failed oral exam. Only a passed result earns a grade on the total of 300 (sehr gut from 270, gut from 240, befriedigend from 210, ausreichend from 180). A group with pending=true has no final result: do not claim a pass, fail or grade while a required grade is pending. Writing grades are AI estimates on the telc A–D criteria. Speaking uses fixed partner cues and transcripts; pronunciation and live interaction are not assessed, so the oral score is provisional. Do not describe these results as an official telc certificate.'
    )
  },
}
