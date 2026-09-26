import type { PromptVars, SkillId } from '../../types'

/**
 * Prompt variables for the `answer` and `review` prompts.
 *
 * `interpolate` leaves an unknown `{placeholder}` in the prompt verbatim, so a review sent
 * without these would reach the model with a literal `{requirements}` in it and come back
 * with a confident, fabricated score. Everything here is derived from the stored exercise
 * and the learner's submission, which is why this moved off the client.
 */

/** The writing prompts want a comma-joined list; tolerate a missing or ragged value. */
function list(value: unknown): string {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string').join(', ') : ''
}

/** The speaking prompts want the cards numbered on their own lines, not comma-joined. */
function numbered(value: unknown): string {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n')
    : ''
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function goetheA2ReviewVars(input: {
  skill: SkillId
  part: number
  kind: 'answer' | 'review'
  payload: Record<string, unknown>
  answers: Record<string, unknown>
  outputLanguage: string
}): PromptVars {
  const { skill, kind, payload, answers, outputLanguage } = input
  if (skill === 'speaking') return speakingVars(payload, answers, outputLanguage)
  if (skill !== 'writing')
    return {
      task: JSON.stringify(payload),
      userContent: JSON.stringify(answers),
      outputLanguage,
    }

  const task = text(payload['task'])
  if (kind === 'answer') return { task, topicId: text(payload['id']), outputLanguage }
  return {
    task,
    requirements: list(payload['requirements']),
    // The writing part's only field is `answer`; `content` is what the mock client stores.
    userContent: text(answers['answer'] ?? answers['content'] ?? answers['userContent']),
    outputLanguage,
  }
}

/**
 * Speaking review variables.
 *
 * Every key is always present, empty for the other Teil, so a Teil 2 review never carries a
 * literal `{answerQuestions}`. The transcripts arrive under `answers`, keyed by segment id.
 */
function speakingVars(
  payload: Record<string, unknown>,
  answers: Record<string, unknown>,
  outputLanguage: string
): PromptVars {
  const theme = text(payload['theme'])
  return {
    topicId: text(payload['id']),
    theme,
    task: theme,
    answerQuestions: numbered(payload['answerQuestions']),
    askQuestions: numbered(payload['askQuestions']),
    keywords: numbered(payload['keywords']),
    answers: text(answers['answers']).trim(),
    questions: text(answers['questions']).trim(),
    monologue: text(answers['monologue']).trim(),
    userContent: text(answers['monologue']).trim() || text(answers['answers']).trim(),
    outputLanguage,
  }
}
