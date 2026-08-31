import type { ExamLevel, PromptKind, PromptOverrideDto, Skill } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import {
  clampPromptSlot,
  defaultPromptBody,
  isValidPromptSlot,
  type PromptKindId,
  type PromptSkillId,
  type PromptSlotKey,
} from '~/data/prompts/a2Catalog'
import { applyPromptTemplate } from '~/utils/prompts/applyPromptTemplate'

const SKILL_TO_NEST: Record<PromptSkillId, Exclude<Skill, 'MOCK'>> = {
  reading: 'READING',
  writing: 'WRITING',
  listening: 'LISTENING',
  speaking: 'SPEAKING',
}

const KIND_TO_NEST: Record<PromptKindId, PromptKind> = {
  generator: 'GENERATOR',
  answer: 'ANSWER',
  review: 'REVIEW',
}

function nestSkill(skill: PromptSkillId): Exclude<Skill, 'MOCK'> {
  return SKILL_TO_NEST[skill]
}

function nestKind(kind: PromptKindId): PromptKind {
  return KIND_TO_NEST[kind]
}

function matchesSlot(row: PromptOverrideDto, slot: PromptSlotKey): boolean {
  return (
    row.skill === nestSkill(slot.skill) &&
    row.level === slot.level &&
    row.part === slot.part &&
    row.kind === nestKind(slot.kind)
  )
}

let hydratePromise: Promise<void> | null = null

export const usePromptOverrides = () => {
  const overrides = useState<PromptOverrideDto[]>('prompt-overrides', () => [])
  const loaded = useState('prompt-overrides-loaded', () => false)

  async function hydrate(): Promise<void> {
    if (!import.meta.client) return
    if (loaded.value) return
    if (hydratePromise) {
      await hydratePromise
      return
    }

    hydratePromise = (async () => {
      try {
        overrides.value = await apiFetch<PromptOverrideDto[]>('/prompt-overrides')
        loaded.value = true
      } catch (error) {
        console.warn('Failed to load prompt overrides', error)
        overrides.value = []
        loaded.value = true
      } finally {
        hydratePromise = null
      }
    })()

    await hydratePromise
  }

  function findOverride(slot: PromptSlotKey): PromptOverrideDto | undefined {
    if (!isValidPromptSlot(slot)) return undefined
    return overrides.value.find(row => matchesSlot(row, slot))
  }

  function editorBody(slot: PromptSlotKey): string {
    return findOverride(slot)?.body ?? defaultPromptBody(slot)
  }

  function generatorPrompt(skill: PromptSkillId, part: number, count = 1): string {
    const slot = clampPromptSlot(skill, part, 'generator')
    return findOverride(slot)?.body ?? defaultPromptBody(slot, count)
  }

  function filledOrDefault(
    skill: PromptSkillId,
    part: number,
    kind: Exclude<PromptKindId, 'generator'>,
    fallback: string,
    vars: Record<string, string>
  ): string {
    const slot = clampPromptSlot(skill, part, kind)
    const override = findOverride(slot)
    return override ? applyPromptTemplate(override.body, vars) : fallback
  }

  async function saveOverride(slot: PromptSlotKey, body: string): Promise<PromptOverrideDto> {
    const saved = await apiFetch<PromptOverrideDto>('/prompt-overrides', {
      method: 'PUT',
      body: {
        skill: nestSkill(slot.skill),
        level: slot.level satisfies ExamLevel,
        part: slot.part,
        kind: nestKind(slot.kind),
        body,
      },
    })
    overrides.value = [...overrides.value.filter(row => !matchesSlot(row, slot)), saved]
    return saved
  }

  async function restoreDefault(slot: PromptSlotKey): Promise<void> {
    const existing = findOverride(slot)
    if (!existing) return
    await apiFetch(
      `/prompt-overrides/${nestSkill(slot.skill)}/${slot.level}/${slot.part}/${nestKind(slot.kind)}`,
      { method: 'DELETE' }
    )
    overrides.value = overrides.value.filter(row => !matchesSlot(row, slot))
  }

  return {
    // State
    overrides: readonly(overrides),
    loaded: readonly(loaded),

    // Methods
    hydrate,
    findOverride,
    editorBody,
    generatorPrompt,
    filledOrDefault,
    saveOverride,
    restoreDefault,
  }
}
