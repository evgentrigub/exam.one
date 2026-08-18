import type {
  PracticeImportDomain,
  PracticeImportResultDto,
  PracticeMigrationStatusDto,
} from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

const DOMAINS: PracticeImportDomain[] = [
  'reading',
  'writing',
  'listening',
  'speaking',
  'mock-exam',
]

const DOMAIN_KEYS: Record<PracticeImportDomain, string[]> = {
  reading: [
    'exam-one:reading:texts',
    'exame-one-reading-texts',
    'exam-one:reading:generation-state',
    'quiz-progress',
    'quiz-session',
  ],
  writing: [
    'exam-one:writing:topics',
    'exame-one-writing-topics',
    'exam-one:writing:progress',
    'writing-progress',
    'exam-one:writing:reviews',
    'writing-reviews',
    'exam-one:writing:model-answers',
    'model-answers',
    'exam-one:writing:topic-generation-state',
    'exame-one-topic-generation-state',
  ],
  listening: [
    'exam-one:listening:exercises',
    'exam-one:listening:audio-overrides',
    'exam-one:listening:progress',
    'exam-one:listening:generation-state',
  ],
  speaking: [
    'exam-one:speaking:exercises',
    'exam-one:speaking:progress',
    'exam-one:speaking:generation-state',
  ],
  'mock-exam': ['exam-one:mock-exam:sets', 'exam-one:mock-exam:generation-state'],
}

const PREFIX_KEYS: Partial<Record<PracticeImportDomain, string[]>> = {
  writing: ['exam-one:writing:session:', 'writing-session-'],
  'mock-exam': ['exam-one:mock-exam:'],
}

const lastResult = ref<PracticeImportResultDto | null>(null)
const lastError = ref<string | null>(null)
const importing = ref(false)
const migratedDomains = ref<PracticeImportDomain[]>([])
let ran = false
let resolveReady: (() => void) | null = null
const ready = new Promise<void>(resolve => {
  resolveReady = resolve
})

export function whenPracticeReady(): Promise<void> {
  return ready
}

function readJson(key: string): unknown {
  if (!import.meta.client) return undefined
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : undefined
  } catch {
    return undefined
  }
}

function collectEntries(domain: PracticeImportDomain): Record<string, unknown> {
  const entries: Record<string, unknown> = {}
  if (!import.meta.client) return entries

  for (const key of DOMAIN_KEYS[domain]) {
    const value = readJson(key)
    if (value !== undefined) entries[key] = value
  }

  const prefixes = PREFIX_KEYS[domain] ?? []
  if (prefixes.length > 0) {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key) continue
      if (DOMAIN_KEYS[domain].includes(key)) continue
      if (!prefixes.some(prefix => key.startsWith(prefix))) continue
      const value = readJson(key)
      if (value !== undefined) entries[key] = value
    }
  }

  return entries
}

function clearImportedKeys(domain: PracticeImportDomain, entries: Record<string, unknown>): void {
  if (!import.meta.client) return
  for (const key of Object.keys(entries)) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Keep going so a single key failure does not leave a mixed store.
    }
  }
  for (const key of DOMAIN_KEYS[domain]) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }
}

export function usePracticeImport() {
  async function refreshStatus(): Promise<PracticeImportDomain[]> {
    const data = await apiFetch<PracticeMigrationStatusDto>('/me/migrations')
    migratedDomains.value = data.migratedDomains
    return data.migratedDomains
  }

  async function importDomain(domain: PracticeImportDomain): Promise<PracticeImportResultDto> {
    const entries = collectEntries(domain)
    const result = await apiFetch<PracticeImportResultDto>(`/me/import/${domain}`, {
      method: 'POST',
      body: { entries },
    })
    if (!result.skipped) clearImportedKeys(domain, entries)
    lastResult.value = result
    lastError.value = null
    if (!migratedDomains.value.includes(domain)) {
      migratedDomains.value = [...migratedDomains.value, domain]
    }
    return result
  }

  async function skipDomain(domain: PracticeImportDomain): Promise<PracticeImportResultDto> {
    const result = await apiFetch<PracticeImportResultDto>(`/me/import/${domain}/skip`, {
      method: 'POST',
    })
    lastResult.value = result
    if (!migratedDomains.value.includes(domain)) {
      migratedDomains.value = [...migratedDomains.value, domain]
    }
    return result
  }

  async function runPendingImports(): Promise<void> {
    if (!import.meta.client || importing.value) return
    importing.value = true
    lastError.value = null
    try {
      const already = await refreshStatus()
      for (const domain of DOMAINS) {
        if (already.includes(domain)) continue
        const entries = collectEntries(domain)
        if (Object.keys(entries).length === 0) {
          await skipDomain(domain)
          continue
        }
        await importDomain(domain)
      }
    } catch (error) {
      lastError.value = error instanceof Error ? error.message : 'Practice data import failed'
    } finally {
      importing.value = false
    }
  }

  async function runOnceAfterLogin(): Promise<void> {
    if (ran || !import.meta.client) {
      resolveReady?.()
      return
    }
    ran = true
    await runPendingImports()
    resolveReady?.()
  }

  return {
    domains: DOMAINS,
    migratedDomains: readonly(migratedDomains),
    importing: readonly(importing),
    lastResult: readonly(lastResult),
    lastError: readonly(lastError),
    refreshStatus,
    importDomain,
    skipDomain,
    runPendingImports,
    runOnceAfterLogin,
    whenPracticeReady,
  }
}
