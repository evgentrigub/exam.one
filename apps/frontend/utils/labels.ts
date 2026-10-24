/**
 * Centralized label + state-class maps (see agent-os shared-label-maps standard).
 *
 * - Class maps (DaisyUI semantic tokens) live here as plain strings.
 * - User-facing labels are routed through i18n: pass a translate function `t`
 *   (from `useI18n()`) and the helpers return the localized string, falling back
 *   to a readable default when a key is missing.
 */

export type SkillId = 'reading' | 'writing' | 'listening' | 'speaking'

export type ExerciseStatus = 'new' | 'inprogress' | 'mastered'

export interface SkillMeta {
  id: SkillId
  /** DaisyUI semantic color role used for this skill. */
  color: 'primary' | 'success' | 'info' | 'warning'
  /** lucide-vue-next icon name, resolved to a component in the consuming view. */
  icon: 'BookOpen' | 'PenLine' | 'Headphones' | 'Mic'
  textClass: string
  softBgClass: string
  progressClass: string
}

export const SKILLS: SkillMeta[] = [
  {
    id: 'reading',
    color: 'primary',
    icon: 'BookOpen',
    textClass: 'text-reading',
    softBgClass: 'bg-reading-soft',
    progressClass: 'progress-primary',
  },
  {
    id: 'writing',
    color: 'success',
    icon: 'PenLine',
    textClass: 'text-writing',
    softBgClass: 'bg-writing-soft',
    progressClass: 'progress-success',
  },
  {
    id: 'listening',
    color: 'info',
    icon: 'Headphones',
    textClass: 'text-listening',
    softBgClass: 'bg-listening-soft',
    progressClass: 'progress-info',
  },
  {
    id: 'speaking',
    color: 'warning',
    icon: 'Mic',
    textClass: 'text-speaking',
    softBgClass: 'bg-speaking-soft',
    progressClass: 'progress-warning',
  },
]

export const SKILL_IDS: SkillId[] = SKILLS.map(s => s.id)

export function getSkillMeta(skill: string): SkillMeta {
  return SKILLS.find(s => s.id === skill) ?? SKILLS[0]!
}

type TranslateFn = (key: string, ...args: unknown[]) => string

const titleCase = (value: string = '') => value.charAt(0).toUpperCase() + value.slice(1)

/** Localized skill label, e.g. `t('skill.reading')` → "Reading". */
export function getSkillLabel(skill: string, t: TranslateFn): string {
  const key = `skill.${skill}`
  const label = t(key)
  return label === key ? titleCase(skill) : label
}

/** Localized exercise-type label, e.g. `t('exerciseType.article')`. */
export function getTypeLabel(type: string, t: TranslateFn): string {
  const key = `exerciseType.${type}`
  const label = t(key)
  return label === key ? titleCase(type) : label
}

/** Localized status label, e.g. `t('status.inprogress')` → "In progress". */
export function getStatusLabel(status: ExerciseStatus, t: TranslateFn): string {
  const key = `status.${status}`
  const label = t(key)
  return label === key ? t('status.new') : label
}

export function getStatusClass(status: ExerciseStatus): string {
  const map: Record<ExerciseStatus, string> = {
    new: 'bg-base-200 text-base-content/50',
    inprogress: 'bg-warning/20 text-warning',
    mastered: 'bg-success/20 text-success',
  }
  return map[status] ?? map.new
}

/** Maps a 0-100 score to a tiered DaisyUI color role. */
export function getScoreTier(percentage: number): 'success' | 'warning' | 'error' {
  if (percentage >= 75) return 'success'
  if (percentage >= 50) return 'warning'
  return 'error'
}

export function getScoreTextClass(percentage: number): string {
  return `text-${getScoreTier(percentage)}`
}
