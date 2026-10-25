import type { PromptVars, SkillId } from '../../types'

/**
 * Prompt variables for the DELE A2 `answer` and `review` prompts, derived from the stored
 * exercise and the learner's submission. `interpolate` leaves an unknown `{placeholder}`
 * verbatim, so every variable a prompt names must be supplied here.
 */

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function deleA2ReviewVars(input: {
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
  const wordCount = record(payload['wordCount'])
  const words = `${wordCount['min'] ?? ''}–${wordCount['max'] ?? ''}`
  const option = text(payload['topicType'])
  if (kind === 'answer') return { task, topicId, words, option, outputLanguage }
  return {
    task,
    option,
    requirements: strings(payload['requirements']).join('; '),
    userContent: text(answers['answer'] ?? answers['content'] ?? answers['userContent']),
    outputLanguage,
  }
}

const TURN: Record<string, string> = {
  ask: 'the learner asks the examiner a question from their card',
  answer: 'the learner answers the examiner',
}

/**
 * A monologue passes its theme, points and transcript; the role-play passes every turn with
 * its card and, for a review, the learner's transcript, keyed by segment id.
 */
function speakingVars(
  kind: 'answer' | 'review',
  payload: Record<string, unknown>,
  answers: Record<string, unknown>,
  outputLanguage: string
): PromptVars {
  const theme = text(payload['theme'])
  const keywords = strings(payload['keywords']).join('; ')
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
  const monologue = text(answers['monologue']).trim()
  return {
    theme,
    task: theme,
    keywords,
    turns,
    userContent: cards.length ? turns : monologue || '—',
    topicId: text(payload['id']),
    outputLanguage,
  }
}
