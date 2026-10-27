/**
 * Option-bank helpers for choice parts whose questions share one option list (a headline,
 * advertisement or word bank). The bank is shown once; each question is answered by letter.
 */

/** A leading label written into the option itself, such as `x · Keine passende Anzeige`. */
const OPTION_PREFIX = /^([A-Za-z0-9]{1,2})\s+·\s+/

/** The letter an option is answered by: its own prefix when it has one, otherwise A, B, C… */
export function optionLetter(option: string | undefined, index: number): string {
  return option?.match(OPTION_PREFIX)?.[1] ?? String.fromCharCode(65 + index)
}

/** The option text without its own letter prefix, for display beside the letter. */
export function optionText(option: string): string {
  return option.replace(OPTION_PREFIX, '')
}

/** The shared option list when every question offers the same options in the same order. */
export function sharedOptions(
  questions: ReadonlyArray<{ options?: readonly string[] }>
): readonly string[] | null {
  const first = questions[0]?.options
  if (!first?.length) return null
  const same = questions.every(
    question =>
      question.options?.length === first.length &&
      question.options.every((option, index) => option === first[index])
  )
  return same ? first : null
}

/** For each option index, the 1-based numbers of the questions currently answered with it. */
export function optionUsage(
  questions: ReadonlyArray<{ id: string }>,
  answers: Readonly<Record<string, unknown>>
): Map<number, number[]> {
  const usage = new Map<number, number[]>()
  questions.forEach((question, index) => {
    const answer = answers[question.id]
    if (typeof answer !== 'number') return
    usage.set(answer, [...(usage.get(answer) ?? []), index + 1])
  })
  return usage
}
