import { apiFetch as requestApi, type ApiFetchOptions } from '~/composables/useApi'
import { aiFetch as requestAi, type AiFetchOptions } from '~/composables/useAiApi'

/** Capture both account and exam before a multi-request operation starts. */
export function usePackRequest(packId = useSettingsStore().packId) {
  const auth = useAuth()
  const userId = auth.user.value?.id
  const isCurrentUser = () => auth.user.value?.id === userId
  function checkUser() {
    if (!isCurrentUser())
      throw new Error('The signed-in account changed. Reopen this exercise to continue.')
  }
  return {
    isCurrentUser,
    async apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
      checkUser()
      const result = await requestApi<T>(path, { ...options, packId })
      checkUser()
      return result
    },
    async aiFetch<T>(path: string, options: AiFetchOptions = {}) {
      checkUser()
      const result = await requestAi<T>(path, { ...options, packId })
      checkUser()
      return result
    },
  }
}
