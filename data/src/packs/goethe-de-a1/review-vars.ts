import type { PromptVars, SkillId } from '../../types'

/**
 * Prompt variables for the A1 `answer` and `review` prompts, derived from the stored exercise
 * and the learner's submission. `interpolate` leaves an unknown `{placeholder}` verbatim, so
 * every variable a prompt names must be supplied here.
 */

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function list(value: unknown): string {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string').join(', ') : ''
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

interface FormRow {
  label: string
  value?: string
  field?: string
  options?: string[]
}

function formRows(payload: Record<string, unknown>): FormRow[] {
  const rows = record(payload['form'])['rows']
  return Array.isArray(rows) ? (rows.map(record) as unknown as FormRow[]) : []
}

/** The printed form: filled rows with their value, blank rows as `(field1) ____`. */
function describeForm(payload: Record<string, unknown>): string {
  return formRows(payload)
    .map(row => {
      if (!row.field) return `${row.label}: ${text(row.value)}`
      const choice = row.options?.length ? ` [choose: ${row.options.join(' / ')}]` : ''
      return `${row.label}: (${row.field}) ____${choice}`
    })
    .join('\n')
}

/** One line per blank field, `id (label): value`, so the model can echo the ids back. */
function perField(payload: Record<string, unknown>, values: Record<string, unknown>): string {
  return formRows(payload)
    .filter(row => row.field)
    .map(row => `${row.field} (${row.label}): ${text(values[row.field!]).trim() || '—'}`)
    .join('\n')
}

export function goetheA1ReviewVars(input: {
  skill: SkillId
  part: number
  kind: 'answer' | 'review'
  payload: Record<string, unknown>
  answers: Record<string, unknown>
  outputLanguage: string
}): PromptVars {
  const { skill, part, kind, payload, answers, outputLanguage } = input
  if (skill !== 'writing')
    return { task: JSON.stringify(payload), userContent: JSON.stringify(answers), outputLanguage }

  const task = text(payload['task'])
  const topicId = text(payload['id'])
  if (part === 1) {
    const form = describeForm(payload)
    if (kind === 'answer') return { task, form, topicId, outputLanguage }
    return {
      task,
      form,
      expected: perField(payload, record(payload['expected'])),
      userContent: perField(payload, answers),
      outputLanguage,
    }
  }
  if (kind === 'answer') return { task, topicId, outputLanguage }
  return {
    task,
    requirements: list(payload['requirements']),
    userContent: text(answers['answer'] ?? answers['content'] ?? answers['userContent']),
    outputLanguage,
  }
}
