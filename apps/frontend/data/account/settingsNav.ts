export const SETTINGS_SECTIONS = [
  'profile',
  'plan',
  'learning',
  'ai',
  'notify',
  'appearance',
  'data',
] as const

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]

const PROFILE_ALIASES = new Set(['security', 'connected'])

export function resolveSettingsSection(raw: unknown): SettingsSectionId {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return 'profile'
  if (PROFILE_ALIASES.has(value)) return 'profile'
  return SETTINGS_SECTIONS.includes(value as SettingsSectionId)
    ? (value as SettingsSectionId)
    : 'profile'
}
