import type { PromptVars, SkillId } from '../../types'

/**
 * Prompt variables for the A2 Key `answer` and `review` prompts, derived from the stored
 * exercise and the learner's submission. `interpolate` leaves an unknown `{placeholder}`
 * verbatim, so every variable a prompt names must be supplied here.
 */

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function cambridgeA2ReviewVars(input: {
  skill: SkillId
  part: number
  kind: 'answer' | 'review'
  payload: Record<string, unknown>
  answers: Record<string, unknown>
  outputLanguage: string
}): PromptVars {
  const { skill, kind, payload, answers, outputLanguage } = input
  if (skill === 'speaking') return speakingVars(kind, payload, answers, outputLanguage)
  if (skill !== 'writing')
    return { task: JSON.stringify(payload), userContent: JSON.stringify(answers), outputLanguage }

  const task = text(payload['task'])
  const topicId = text(payload['id'])
  if (kind === 'answer') return { task, topicId, outputLanguage }
  return {
    task,
    requirements: strings(payload['requirements']).join('; '),
    pictures: strings(payload['pictures'])
      .map((picture, i) => `Picture ${i + 1}: ${picture}`)
      .join('\n'),
    userContent: text(answers['answer'] ?? answers['content'] ?? answers['userContent']),
    outputLanguage,
  }
}

const TURN: Record<string, string> = {
  ask: 'the learner asks their partner a question made from the card',
  answer: 'the learner answers',
}

/**
 * Every turn with its card and, for a review, the learner's transcript, keyed by segment id so
 * the rubric can quote the turns.
 */
function speakingVars(
  kind: 'answer' | 'review',
  payload: Record<string, unknown>,
  answers: Record<string, unknown>,
  outputLanguage: string
): PromptVars {
  const theme = text(payload['theme'])
  const cards = Array.isArray(payload['cards']) ? payload['cards'].map(record) : []
  const turns = cards
    .map(card => {
      const segment = text(card['segment'])
      const who = card['speaker'] === 'examiner' ? 'Examiner' : 'Card'
      const line = `${segment} — ${TURN[text(card['kind'])] ?? 'turn'}. ${who}: "${text(card['cue'])}"`
      if (kind === 'answer') return line
      return `${line}. Learner said: "${text(answers[segment]).trim() || '—'}"`
    })
    .join('\n')
  return {
    theme,
    task: theme,
    pictures: strings(payload['pictures']).join(', '),
    turns,
    userContent: turns,
    topicId: text(payload['id']),
    outputLanguage,
  }
}
