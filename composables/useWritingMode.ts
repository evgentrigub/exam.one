/**
 * Writing Mode Composable
 * Manages different writing modes (Quick, Challenge, Model Help) and timer functionality
 */

export type WritingMode = 'quick' | 'challenge' | 'model-help'

export const useWritingMode = () => {
  // Current writing mode
  const currentMode = ref<WritingMode>('quick')
  
  // Challenge mode timer state
  const challengeTimer = ref(0) // seconds elapsed
  const isTimerRunning = ref(false)
  const timerInterval = ref<number | null>(null)
  
  // Start the challenge timer
  const startTimer = () => {
    if (isTimerRunning.value) return
    
    isTimerRunning.value = true
    timerInterval.value = setInterval(() => {
      challengeTimer.value++
    }, 1000) as unknown as number
  }
  
  // Stop the timer
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    isTimerRunning.value = false
  }
  
  // Reset the timer
  const resetTimer = () => {
    stopTimer()
    challengeTimer.value = 0
  }
  
  // Change writing mode
  const changeMode = (newMode: WritingMode) => {
    const previousMode = currentMode.value
    currentMode.value = newMode
    
    // Handle timer based on mode changes
    if (previousMode === 'challenge') {
      // Leaving challenge mode - stop timer
      stopTimer()
    }
    
    if (newMode === 'challenge') {
      // Entering challenge mode - reset and start timer
      resetTimer()
      startTimer()
    } else {
      // Not challenge mode - make sure timer is stopped
      stopTimer()
    }
  }
  
  // Format timer display (mm:ss)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Get formatted timer display
  const timerDisplay = computed(() => formatTime(challengeTimer.value))
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer()
  })
  
  return {
    // State
    currentMode: readonly(currentMode),
    challengeTimer: readonly(challengeTimer),
    isTimerRunning: readonly(isTimerRunning),
    timerDisplay,
    
    // Actions
    changeMode,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime
  }
}
