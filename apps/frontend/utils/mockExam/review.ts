export interface ReviewQuestion {
  id: string
  prompt: string
  options: readonly string[]
  correctIndex: number
  /** Typed-answer gaps only: every accepted answer; such a question has no options. */
  accepted?: readonly string[]
  explanation: string
}
