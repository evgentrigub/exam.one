/**
 * Ensure only one listening AudioPlayer plays at a time within a session.
 */

export function useListeningExclusivePlayback() {
  const activePlayerId = ref<string | null>(null)

  function claim(playerId: string): void {
    activePlayerId.value = playerId
  }

  function release(playerId: string): void {
    if (activePlayerId.value === playerId) {
      activePlayerId.value = null
    }
  }

  return {
    activePlayerId: readonly(activePlayerId),
    claim,
    release,
  }
}
