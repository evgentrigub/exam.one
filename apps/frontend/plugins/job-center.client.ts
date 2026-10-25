export default defineNuxtPlugin(() => {
  const auth = useAuth()
  const center = useJobCenter()
  watch(
    auth.user,
    user => {
      if (user) center.connect(user.id)
      else center.disconnect()
    },
    { immediate: true }
  )
})
