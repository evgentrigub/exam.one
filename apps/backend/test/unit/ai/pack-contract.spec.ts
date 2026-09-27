import { goetheDeA2, validatePacks, type ExamPack } from '@exam-one/exam-packs'
import { syntheticEnglishA1 } from '../../../../../data/src/testing/english-a1'
import { goetheRawAdapter } from '../../../../../data/src/packs/goethe-shared/raw-adapter'

function withPart(pack: ExamPack, skill: string, patch: Record<string, unknown>): ExamPack {
  return {
    ...pack,
    structure: pack.structure.map(module =>
      module.id === skill
        ? { ...module, parts: module.parts.map((part, i) => (i === 0 ? { ...part, ...patch } : part)) }
        : module
    ),
  }
}

describe('Pack contract: layouts and seeds', () => {
  it('accepts a layout on its own format and rejects it on another', () => {
    expect(() => validatePacks([withPart(syntheticEnglishA1, 'writing', { layout: 'form-fill' })])).not.toThrow()
    expect(() => validatePacks([withPart(syntheticEnglishA1, 'speaking', { layout: 'word-cards' })])).not.toThrow()
    expect(() => validatePacks([withPart(syntheticEnglishA1, 'speaking', { layout: 'form-fill' })])).toThrow(
      'layout form-fill does not fit recording'
    )
  })

  it('rejects seeds without an id or with a duplicate id', () => {
    expect(() =>
      validatePacks([{ ...syntheticEnglishA1, seedExercises: { reading: [{ title: 'x' }] } }])
    ).toThrow('reading seed without an id')
    expect(() =>
      validatePacks([{ ...syntheticEnglishA1, seedExercises: { reading: [{ id: 'a' }, { id: 'a' }] } }])
    ).toThrow('duplicate reading seed a')
  })

  it('registers every A2 seed, practice and mock, under a unique id', () => {
    const seeds = Object.values(goetheDeA2.seedExercises ?? {}).flat()
    expect(seeds).toHaveLength(24)
    expect(new Set(seeds.map(seed => seed['id'])).size).toBe(24)
  })
})

describe('Goethe raw adapter: layout payloads', () => {
  const writing = goetheDeA2.structure.find(m => m.id === 'writing')!.parts[0]!
  const speaking = goetheDeA2.structure.find(m => m.id === 'speaking')!.parts[0]!

  it('takes form-fill field prompts from the blank form rows', () => {
    const rules = {
      minutes: 5,
      maxPoints: 2,
      fields: [
        { id: 'field1', label: 'Field 1' },
        { id: 'field2', label: 'Field 2' },
      ],
    }
    const view = goetheRawAdapter('writing', writing, rules).project({
      title: 'Anmeldung',
      task: 'Frau Kim meldet sich an.',
      form: {
        rows: [
          { label: 'Name', value: 'Kim' },
          { label: 'Geburtsort', field: 'field1' },
          { label: 'Beruf', field: 'field2' },
        ],
      },
    })
    expect(view.fields?.map(f => [f.id, f.prompt])).toEqual([
      ['field1', 'Geburtsort'],
      ['field2', 'Beruf'],
    ])
  })

  it('takes card segment prompts from cards keyed by segment id', () => {
    const rules = {
      minutes: 5,
      maxPoints: 3,
      segments: [
        { id: 'ask1', label: 'Frage 1' },
        { id: 'answer1', label: 'Antwort 1' },
      ],
    }
    const view = goetheRawAdapter('speaking', speaking, rules).project({
      theme: 'Essen und Trinken',
      cards: [
        { segment: 'ask1', topic: 'Essen und Trinken', cue: 'Frühstück' },
        { segment: 'answer1', cue: 'Was trinkst du gern?' },
      ],
    })
    expect(view.segments?.map(s => [s.id, s.prompt])).toEqual([
      ['ask1', 'Essen und Trinken · Frühstück'],
      ['answer1', 'Was trinkst du gern?'],
    ])
  })
})
