<template>
  <div class="app-shell flex">
    <AppSidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <AppTopbar :title="translatedTitle" :subtitle="translatedSubtitle" />
      <main class="flex-1 overflow-y-auto bg-base-200">
        <slot />
      </main>
    </div>
    <ActivityToasts />
  </div>
</template>

<script setup lang="ts">
import { resetPackScope } from '~/utils/packScope'
const { t, te } = useI18n()
const pageTitle = useState<string>('pageTitle', () => 'Exam.one')
const pageSubtitle = useState<string>('pageSubtitle', () => '')
const settingsStore = useSettingsStore()
const auth = useAuth()
watch(
  () => [settingsStore.packId, auth.user.value?.id],
  () => resetPackScope(),
  { flush: 'sync' }
)

onMounted(() => {
  void settingsStore.hydrateFromApi()
})

const translatedTitle = computed(() => (te(pageTitle.value) ? t(pageTitle.value) : pageTitle.value))
const translatedSubtitle = computed(() =>
  pageSubtitle.value && te(pageSubtitle.value) ? t(pageSubtitle.value) : pageSubtitle.value
)
</script>
