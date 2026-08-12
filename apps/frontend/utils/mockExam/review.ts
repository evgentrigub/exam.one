export interface ReviewQuestion {
  id: string
  prompt: string
  options: readonly string[]
  correctIndex: number
  explanation: string
}
