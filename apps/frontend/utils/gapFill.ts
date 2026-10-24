/**
 * Gap-fill helpers shared by the reading and listening screens. A gap is written in the
 * text as `(n) ____`; `(0)` is the worked example and is shown as plain text.
 */

/** A learner's objective answer: an option index, or the typed word of a gap. */
export type ObjectiveAnswer = number | string

export type ObjectiveAnswers = Record<string, ObjectiveAnswer | undefined>

/** A gap as the screens read it: the raw payload question, scored against `accepted`. */
export interface GapQuestion {
  id: string
  question: string
  accepted?: readonly string[]
  options?: readonly string[]
  correctAnswer?: number
  explanation?: string
}

export type GapTextToken = { kind: 'text'; value: string } | { kind: 'gap'; n: number }

const GAP_MARKER = /\((\d+)\)\s*_{2,}/g

/** Split one line of a gapped text into plain text and numbered gaps. */
export function splitGapLine(line: string): GapTextToken[] {
  const tokens: GapTextToken[] = []
  let last = 0
  for (const match of line.matchAll(GAP_MARKER)) {
    const n = Number(match[1])
    if (n < 1) continue
    if (match.index > last) tokens.push({ kind: 'text', value: line.slice(last, match.index) })
    tokens.push({ kind: 'gap', n })
    last = match.index + match[0].length
  }
  if (last < line.length) tokens.push({ kind: 'text', value: line.slice(last) })
  return tokens
}

/** The DOM id of a gap's input, so a gap in the text can focus it. */
export function gapInputId(questionId: string): string {
  return `gap-input-${questionId.replace(/[^\w-]/g, '_')}`
}

/** A gapped text for read-aloud: each blank becomes a short pause. */
export function stripGapMarkers(content: string): string {
  return content.replace(GAP_MARKER, ' … ')
}

/** Typed answers kept only when non-blank, so an emptied gap counts as unanswered. */
export function withTypedAnswer(
  answers: ObjectiveAnswers,
  questionId: string,
  value: string
): ObjectiveAnswers {
  const { [questionId]: _previous, ...rest } = answers
  return value.trim() ? { ...rest, [questionId]: value } : rest
}
