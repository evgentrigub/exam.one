export const SETTINGS_SECTIONS = [
  'profile',
  'plan',
  'learning',
  'ai',
  'notify',
  'appearance',
  'media-audio',
  'media-voices',
  'data',
] as const

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]

const PROFILE_ALIASES = new Set(['security', 'connected', 'prompts'])
/** The Generated files group opens on its first page. */
const SECTION_ALIASES: Readonly<Record<string, SettingsSectionId>> = { media: 'media-audio' }

export function resolveSettingsSection(raw: unknown): SettingsSectionId {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return 'profile'
  if (PROFILE_ALIASES.has(value)) return 'profile'
  if (Object.hasOwn(SECTION_ALIASES, value)) return SECTION_ALIASES[value]!
  return SETTINGS_SECTIONS.includes(value as SettingsSectionId)
    ? (value as SettingsSectionId)
    : 'profile'
}
