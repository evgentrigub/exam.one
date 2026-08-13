export interface ResultDto {
  id: string
  attemptId: string
  score: number | null
  maxScore: number | null
  percentage: number | null
  review: unknown
  createdAt: string
}
