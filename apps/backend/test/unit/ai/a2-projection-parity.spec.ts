import {
  allDefaultListeningTopics,
  allDefaultReadingTopics,
  allDefaultSpeakingTopics,
  allDefaultWritingTopics,
  goetheDeA2,
  type SkillId,
} from '@exam-one/exam-packs'

/**
 * Pins what the A2 adapter produces for every bundled payload. The projection is shared with
 * other Goethe packs, so a change to it must be deliberate: this snapshot fails otherwise.
 */
const catalog: Record<SkillId, readonly unknown[]> = {
  reading: allDefaultReadingTopics,
  listening: allDefaultListeningTopics,
  writing: allDefaultWritingTopics,
  speaking: allDefaultSpeakingTopics,
}

describe('Goethe A2 projection parity', () => {
  for (const [skill, payloads] of Object.entries(catalog) as [SkillId, readonly unknown[]][]) {
    it(`projects every bundled ${skill} payload unchanged`, () => {
      const module = goetheDeA2.structure.find(m => m.id === skill)!
      const projected = payloads.map(payload => {
        const n = Number((payload as { testingPart?: number }).testingPart ?? 1)
        const part = module.parts.find(p => p.n === n)!
        return { n, runtime: part.runtime, view: part.adapter!.project(payload) }
      })
      expect(projected.length).toBeGreaterThan(0)
      expect(projected).toMatchSnapshot()
    })
  }
})
