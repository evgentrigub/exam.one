<script setup lang="ts">
const route = useRoute()
const { getSession } = useProgress()

if (import.meta.client && route.query['resume'] === 'true') {
  const session = getSession()
  if (session?.textId) {
    await navigateTo(`/reading/${session.textId}`, { replace: true })
  } else {
    await navigateTo('/exercises?skill=reading', { replace: true })
  }
} else {
  await navigateTo('/exercises?skill=reading', { replace: true })
}
</script>
