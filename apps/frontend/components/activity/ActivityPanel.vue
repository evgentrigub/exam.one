<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="fixed inset-0 z-[60]" @click="emit('close')" />
      <section class="fixed top-[60px] right-4 z-[61] w-[440px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-76px)] flex flex-col bg-base-100 rounded-box border border-base-300 shadow-2xl overflow-hidden" role="dialog" aria-modal="true" :aria-label="$t('activity.title')">
        <div class="px-4 pt-3.5 pb-3 border-b border-base-300/70">
          <div class="flex items-center gap-2">
            <h2 class="font-display text-[17px] font-bold">{{ $t('activity.title') }}</h2>
            <span class="badge badge-sm badge-ghost">{{ $t('activity.inProgressCount', { count: center.active.value.length }) }}</span>
            <div class="ml-auto flex items-center gap-1">
              <button type="button" class="btn btn-ghost btn-xs btn-circle" :title="$t('activity.markRead')" @click="void center.markAllRead()"><CheckCheck :size="14" /></button>
              <button ref="closeButton" type="button" class="btn btn-ghost btn-xs btn-circle" :aria-label="$t('activity.close')" @click="emit('close')"><X :size="14" /></button>
            </div>
          </div>
          <div v-if="center.active.value.length" class="mt-3 flex items-center gap-3">
            <progress class="progress progress-primary h-1.5 flex-1" :value="center.overall.value" max="100" />
            <span class="text-[11px] text-base-content/60 tabular-nums shrink-0">{{ `≈${Math.round(center.overall.value / 5) * 5}%` }}</span>
          </div>
          <div class="mt-3 flex gap-1 overflow-x-auto">
            <button v-for="option in filters" :key="option.id" type="button" class="h-7 px-3 rounded-full text-xs font-medium shrink-0" :class="tab === option.id ? 'bg-base-content text-base-100' : 'bg-base-200 text-base-content/70'" @click="tab = option.id">{{ option.label }}<span v-if="option.count" class="ml-1 text-primary">{{ option.count }}</span></button>
          </div>
        </div>
        <div class="overflow-y-auto flex-1 min-h-0">
          <div v-if="showIntro" class="m-3 rounded-box bg-base-200 p-3.5 flex gap-3 text-xs">
            <BellRing :size="17" class="text-primary shrink-0" />
            <div class="flex-1"><strong>{{ $t('activity.introTitle') }}</strong><p class="mt-1 text-base-content/70">{{ $t('activity.intro') }}</p></div>
            <button type="button" class="btn btn-ghost btn-xs btn-circle" :aria-label="$t('activity.dismiss')" @click="dismissIntro"><X :size="12" /></button>
          </div>
          <template v-if="filteredActive.length">
            <h3 class="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-base-content/45">{{ $t('activity.inProgress') }}</h3>
            <div class="divide-y divide-base-300/60"><ActivityJobCard v-for="job in filteredActive" :key="job.id" :job="job" /></div>
          </template>
          <template v-if="filteredFinished.length">
            <div class="px-4 pt-4 pb-1 flex items-center"><h3 class="text-[10px] font-semibold uppercase tracking-wider text-base-content/45">{{ $t('activity.earlier') }}</h3><button type="button" class="ml-auto text-[11px] text-base-content/55" @click="void center.clearFinished()">{{ $t('activity.clear') }}</button></div>
            <div class="divide-y divide-base-300/60"><ActivityJobCard v-for="job in filteredFinished" :key="job.id" :job="job" /></div>
          </template>
          <div v-if="!filteredActive.length && !filteredFinished.length" class="px-6 py-12 text-center"><Inbox :size="25" class="mx-auto text-base-content/40" /><div class="mt-3 text-sm font-semibold">{{ $t('activity.empty') }}</div><p class="text-xs text-base-content/55 mt-1">{{ $t('activity.emptyDescription') }}</p></div>
          <button v-if="center.nextCursor.value" class="btn btn-ghost btn-sm w-full" @click="void center.loadMore()">{{ $t('activity.more') }}</button>
        </div>
        <div v-if="emailAvailable" class="px-4 py-2.5 border-t border-base-300/70 bg-base-200/40 flex items-center gap-2 text-[11px] text-base-content/55">
          <Mail :size="12" /> {{ $t('activity.emailMock') }}
          <input type="checkbox" class="toggle toggle-xs toggle-primary ml-auto" :checked="emailEnabled" @change="setEmail(($event.target as HTMLInputElement).checked)" />
        </div>
      </section>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { BellRing, CheckCheck, Inbox, Mail, X } from 'lucide-vue-next'
import type { BackgroundJobType } from '@exam-one/contracts'
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const center = useJobCenter()
const closeButton = ref<HTMLButtonElement | null>(null)
const tab = ref<BackgroundJobType | 'all'>('all')
const INTRO_KEY = 'exam-one:activity-intro'
const showIntro = ref(true)
const emailAvailable = ref(false)
const emailEnabled = ref(true)
const kinds: BackgroundJobType[] = ['EXERCISE_GENERATION', 'LISTENING_AUDIO', 'MOCK_EXAM_SET']
const filters = computed(() => [
  { id: 'all' as const, label: t('activity.all'), count: 0 },
  ...kinds.map(id => ({ id, label: t(`activity.kinds.${id}`), count: center.active.value.filter(job => job.type === id).length })),
])
const filteredActive = computed(() => center.active.value.filter(job => tab.value === 'all' || job.type === tab.value))
const filteredFinished = computed(() => center.finished.value.filter(job => tab.value === 'all' || job.type === tab.value))
function dismissIntro() {
  showIntro.value = false
  if (!import.meta.client) return
  try { localStorage.setItem(INTRO_KEY, '0') } catch { return }
}
async function setEmail(value: boolean) {
  try { emailEnabled.value = (await useAuth().updateSettings({ notifyMockReadyEmail: value })).notifyMockReadyEmail }
  catch { emailEnabled.value = !value }
}
function onKey(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => {
  if (!import.meta.client) return
  try {
    showIntro.value = localStorage.getItem(INTRO_KEY) !== '0'
    window.addEventListener('keydown', onKey)
    void Promise.all([useAuth().loadConfig(), useAuth().getSettings()]).then(([config, settings]) => {
      emailAvailable.value = config.emailConfigured
      emailEnabled.value = settings.notifyMockReadyEmail
    }).catch(() => undefined)
    void nextTick(() => closeButton.value?.focus())
  } catch { return }
})
onUnmounted(() => { if (import.meta.client) try { window.removeEventListener('keydown', onKey) } catch { return } })
</script>
