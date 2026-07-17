export function useLandingReveal() {
  if (!import.meta.client) return

  onMounted(() => {
    if (!window || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'))
      return
    }

    const els = document.querySelectorAll('.reveal:not(.in)')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    els.forEach(el => io.observe(el))
  })
}
