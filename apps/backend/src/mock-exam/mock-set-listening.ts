/** The listening exercises of a mock set's `content` that carry an id (their audio key). */
export function mockSetListeningExercises(
  content: unknown
): Array<Record<string, unknown> & { id: string }> {
  const listening =
    content && typeof content === 'object'
      ? (content as { listening?: unknown }).listening
      : undefined
  if (!Array.isArray(listening)) return []
  return listening.filter(
    (item): item is Record<string, unknown> & { id: string } =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as { id?: unknown }).id === 'string' &&
      Boolean((item as { id: string }).id)
  )
}
