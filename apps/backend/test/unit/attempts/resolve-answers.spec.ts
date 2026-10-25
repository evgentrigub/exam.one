import { getPack, objectiveScore, resolveAnswers, type ExerciseView } from '@exam-one/exam-packs'
import { syntheticEnglishA1, syntheticPayloads } from '../../../../../data/src/testing/english-a1'

const pack = getPack('goethe-de-a2')!
const viewFor = (skill: string, part: number, payload: Record<string, unknown>): ExerciseView => {
  const definition = pack.structure
    .find(module => module.id === skill)!
    .parts.find(p => p.n === part)!
  return definition.adapter!.project({ ...payload, testingPart: part, difficulty: 'A2' })
}

/**
 * The client stores a submission record, not a flat answer map. These cover the shape each
 * skill actually writes — reading/listening nest under `responses`, writing keeps the essay
 * under `content`, speaking keeps transcripts under `transcripts`.
 */
describe('resolveAnswers', () => {
  it('lifts reading choices out of the responses envelope', () => {
    const view = viewFor('reading', 1, {
      id: 'r1',
      title: 'T',
      content: 'C',
      questions: Array.from({ length: 5 }, (_, i) => ({
        id: `r1-q${i + 1}`,
        question: `Q${i}`,
        options: ['a', 'b', 'c'],
        correctAnswer: 1,
        explanation: 'e',
      })),
    })
    const resolved = resolveAnswers(view, {
      score: 3,
      totalQuestions: 5,
      responses: { 'r1-q1': 0, 'r1-q2': 1, 'r1-q3': 2, 'r1-q4': 1, 'r1-q5': 0 },
    })
    expect(resolved).toEqual({ 'r1-q1': 0, 'r1-q2': 1, 'r1-q3': 2, 'r1-q4': 1, 'r1-q5': 0 })
  })

  it('lifts typed gap answers out of the responses envelope unchanged', () => {
    const part = syntheticEnglishA1.structure
      .find(module => module.id === 'reading')!
      .parts.find(p => p.itemFormat === 'gap-fill')!
    const view = part.adapter!.project(syntheticPayloads[17])
    const resolved = resolveAnswers(view, { responses: { a: ' In ', b: 'by' } })
    expect(resolved).toEqual({ a: ' In ', b: 'by' })
    expect(objectiveScore(view, part.runtime!, resolved).score).toBe(2)
  })

  it('lifts listening choices out of the responses envelope', () => {
    const view = viewFor('listening', 1, {
      id: 'l1',
      title: 'T',
      items: Array.from({ length: 5 }, (_, i) => ({
        id: `l1-i${i + 1}`,
        context: 'c',
        transcript: 't',
        question: `Q${i}`,
        options: ['a', 'b', 'c'],
        correctAnswer: 0,
        explanation: 'e',
      })),
    })
    const resolved = resolveAnswers(view, {
      score: 5,
      totalQuestions: 5,
      responses: { 'l1-i1': 0, 'l1-i2': 1, 'l1-i3': 2, 'l1-i4': 0, 'l1-i5': 1 },
    })
    expect(Object.keys(resolved)).toHaveLength(5)
    expect(resolved['l1-i3']).toBe(2)
  })

  it('maps the writing essay from content onto the field id', () => {
    const view = viewFor('writing', 2, { id: 'w1', title: 'T', task: 'Task' })
    const resolved = resolveAnswers(view, {
      id: 'w1-1',
      topicId: 'w1',
      content: 'Sehr geehrte Frau Berger, …',
      wordCount: 37,
      isDraft: false,
    })
    expect(resolved).toEqual({ answer: 'Sehr geehrte Frau Berger, …' })
  })

  it('lifts speaking transcripts onto their segment ids', () => {
    const view = viewFor('speaking', 1, {
      id: 's1',
      theme: 'Alltag',
      answerQuestions: ['a', 'b', 'c', 'd'],
      askQuestions: ['e', 'f', 'g', 'h'],
    })
    const resolved = resolveAnswers(view, {
      id: 's1-1',
      durationSec: 90,
      transcript: 'Antworten:\n…\n\nFragen:\n…',
      transcripts: { answers: 'Ich wohne in Berlin.', questions: 'Wie alt bist du?' },
    })
    expect(resolved).toEqual({
      answers: 'Ich wohne in Berlin.',
      questions: 'Wie alt bist du?',
    })
  })

  it('falls back to the combined transcript for a single-segment part', () => {
    const view = viewFor('speaking', 2, {
      id: 's2',
      theme: 'Freizeit',
      keywords: ['a', 'b', 'c', 'd'],
    })
    const resolved = resolveAnswers(view, {
      id: 's2-1',
      durationSec: 60,
      transcript: 'Ich spiele Fussball.',
    })
    expect(resolved).toEqual({ monologue: 'Ich spiele Fussball.' })
  })

  it('prefers a flat value, so an already-flat map passes through untouched', () => {
    const view = viewFor('writing', 1, { id: 'w2', title: 'T', task: 'Task' })
    expect(resolveAnswers(view, { answer: 'flat', content: 'nested' })).toEqual({ answer: 'flat' })
  })

  it('omits slots with no stored answer rather than inventing one', () => {
    const view = viewFor('writing', 1, { id: 'w3', title: 'T', task: 'Task' })
    expect(resolveAnswers(view, { id: 'w3-1', wordCount: 0 })).toEqual({})
  })
})
