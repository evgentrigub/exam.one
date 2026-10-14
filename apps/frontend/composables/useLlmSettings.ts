import type {
  LlmKeySummary,
  LlmModelListData,
  LlmProvider,
  LlmSettingsDto,
  UpdateLlmSettingsInput,
} from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

/** Per-user LLM provider, key and model (`/settings/llm`). Keys go up once and never come back. */
export function useLlmSettings() {
  return {
    get: () => apiFetch<LlmSettingsDto>('/settings/llm'),
    save: (input: UpdateLlmSettingsInput) =>
      apiFetch<LlmSettingsDto>('/settings/llm', { method: 'PUT', body: input }),
    saveKey: (provider: LlmProvider, apiKey: string) =>
      apiFetch<LlmKeySummary>(`/settings/llm/keys/${provider}`, { method: 'PUT', body: { apiKey } }),
    removeKey: (provider: LlmProvider) =>
      apiFetch<LlmSettingsDto>(`/settings/llm/keys/${provider}`, { method: 'DELETE' }),
    listModels: (provider: LlmProvider) =>
      apiFetch<LlmModelListData>('/settings/llm/models', { query: { provider } }),
  }
}
