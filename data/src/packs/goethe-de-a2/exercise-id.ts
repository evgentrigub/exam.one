import type { SkillId } from '../../types'

/** Base36 timestamp plus randomness, so ids stay unique within a millisecond. */
function suffix(): string {
  const random = (): string => Math.random().toString(36).slice(2, 7)
  return `${Date.now().toString(36)}-${random()}${random()}`
}

/**
 * Ids for generated exercises, in the shape the audio pipeline expects.
 *
 * Listening is the reason this hook exists. `tts.service.ts` refuses to synthesize an
 * exercise whose id fails `GENERATED_EXERCISE_ID_RE` (`listening-a2-part<n>-…`), and the
 * id is also a path component inside the hashed audio directory, so the guard is real and
 * the format is not cosmetic. A generic `listening-<packId>-<uuid>` stores cleanly and then
 * silently has no audio.
 *
 * Returning `undefined` leaves a skill on the generic id; only listening is constrained.
 */
export function goetheA2ExerciseId(skill: SkillId, part: number): string | undefined {
  return skill === 'listening' ? `listening-a2-part${part}-${suffix()}` : undefined
}
