import { JOB_STAGES, type BackgroundJobType } from '@exam-one/contracts'
import { FINAL_STAGE } from '../../../src/jobs/queues'

describe('FINAL_STAGE', () => {
  it('matches the shared stage lists', () => {
    for (const type of Object.keys(JOB_STAGES) as BackgroundJobType[])
      expect(FINAL_STAGE[type]).toBe(JOB_STAGES[type].stages.length - 1)
  })
})
