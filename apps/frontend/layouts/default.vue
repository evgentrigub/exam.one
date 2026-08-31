<template>
  <div class="app-shell flex">
    <AppSidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <AppTopbar :title="translatedTitle" :subtitle="translatedSubtitle" />
      <main class="flex-1 overflow-y-auto bg-base-200">
        <slot />
      </main>
    </div>
    <GenerationJobHost />
  </div>
</template>

<script setup lang="ts">
const { t, te } = useI18n()
const pageTitle = useState<string>('pageTitle', () => 'Exam.one')
const pageSubtitle = useState<string>('pageSubtitle', () => '')
const settingsStore = useSettingsStore()

onMounted(() => {
  void settingsStore.hydrateFromApi()
})

const translatedTitle = computed(() => (te(pageTitle.value) ? t(pageTitle.value) : pageTitle.value))
const translatedSubtitle = computed(() =>
  pageSubtitle.value && te(pageSubtitle.value) ? t(pageSubtitle.value) : pageSubtitle.value
)
</script>
