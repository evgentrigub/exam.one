export const useTimer = (initialSeconds: number) => {
  const seconds = ref(initialSeconds)
  const isRunning = ref(false)
  let timer: NodeJS.Timeout | null = null

  const formattedTime = computed(() => {
    const minutes = Math.floor(seconds.value / 60)
    const remainingSeconds = seconds.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  })

  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    timer = setInterval(() => {
      if (seconds.value > 0) {
        seconds.value--
      } else {
        stop()
      }
    }, 1000)
  }

  const stop = () => {
    isRunning.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    seconds,
    isRunning,
    formattedTime,
    start,
    stop
  }
} 