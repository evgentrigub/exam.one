import type { WritingExercise, WritingFormRow } from '@exam-one/exam-packs'

/**
 * Helpers for form-fill writing tasks.
 *
 * A form submission is stored like any writing submission, with `content` holding the
 * entries as a JSON object keyed by field id. That round-trips through drafts and history
 * unchanged; readable text is derived from it only for display and for the review request.
 */

export type FormValues = Record<string, string>

export function isFormFillTopic(topic: Pick<WritingExercise, 'form'> | null | undefined): boolean {
  return Array.isArray(topic?.form?.rows)
}

export function blankRows(
  topic: Pick<WritingExercise, 'form'>
): (WritingFormRow & { field: string })[] {
  return (topic.form?.rows ?? []).filter(
    (row): row is WritingFormRow & { field: string } => typeof row.field === 'string'
  )
}

export function parseFormValues(content: string | undefined): FormValues {
  if (!content) return {}
  try {
    const value: unknown = JSON.parse(content)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    )
  } catch {
    return {}
  }
}

export function serializeFormValues(values: FormValues): string {
  return JSON.stringify(values)
}

/** One "Label: entry" line per blank row, in form order. */
export function formatFormValues(topic: Pick<WritingExercise, 'form'>, values: FormValues): string {
  return blankRows(topic)
    .map(row => `${row.label}: ${values[row.field]?.trim() || '—'}`)
    .join('\n')
}

export function countFormWords(values: FormValues): number {
  return Object.values(values).reduce(
    (sum, value) => sum + value.trim().split(/\s+/).filter(Boolean).length,
    0
  )
}

/**
 * The review request body for a submission. A form is sent as its entries keyed by field id,
 * which is what its reviewer grades; `userContent` stays a readable version, since the DTO
 * requires one. An essay is its text.
 */
export function writingReviewPayload(
  topic: WritingExercise,
  content: string
): { userContent: string; answers?: FormValues } {
  if (!isFormFillTopic(topic)) return { userContent: content }
  const answers = parseFormValues(content)
  return { userContent: formatFormValues(topic, answers), answers }
}

/** Stored content for display: readable lines for a form, the text itself otherwise. */
export function displayWritingContent(
  topic: WritingExercise | null | undefined,
  content: string
): string {
  return topic && isFormFillTopic(topic)
    ? formatFormValues(topic, parseFormValues(content))
    : content
}
