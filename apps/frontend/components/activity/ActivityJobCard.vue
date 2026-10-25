<template>
  <div
    class="px-4 py-3.5"
    :class="
      !job.seenAt && (job.status === 'COMPLETED' || job.status === 'FAILED') ? 'bg-primary/5' : ''
    "
  >
    <div class="flex gap-3">
      <ActivityKindIcon :type="job.type" :status="job.status" />
      <div class="flex-1 min-w-0">
        <div class="flex items-start gap-2">
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-semibold leading-snug text-pretty">{{ title }}</div>
            <div class="text-[11px] text-base-content/55 mt-0.5 flex flex-wrap items-center gap-1">
              <span
                class="font-semibold uppercase tracking-wide text-[10px]"
                :class="KIND_TONE[job.type]"
                >{{ $t(`activity.kinds.${job.type}`) }}</span
              >
              <span>· {{ job.level || job.packId }}</span
              ><span v-if="job.subtitle">· {{ job.subtitle }}</span>
              <span v-if="job.packId !== settings.packId">· {{ job.packId }}</span>
            </div>
          </div>
          <span
            v-if="!job.seenAt && (job.status === 'COMPLETED' || job.status === 'FAILED')"
            class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"
          />
          <span
            v-if="job.status === 'RUNNING'"
            class="font-mono text-[12px] font-semibold tabular-nums text-base-content/75 shrink-0"
            >{{
              `≈${Math.max(5, Math.round(overallPercent(job.type, job.progress) / 5) * 5)}%`
            }}</span
          >
        </div>
        <div
          v-if="job.status === 'RUNNING' || job.status === 'CANCEL_REQUESTED'"
          class="mt-2.5 space-y-1.5"
        >
          <ActivityStageBar :job="job" />
          <div class="flex items-center gap-2 text-[11px] text-base-content/60">
            <span class="loading loading-spinner loading-xs opacity-60" />
            <span class="truncate"
              >{{
                $t('activity.step', { current: job.progress.stage + 1, total: stages.length })
              }}
              · {{ $t(stages[job.progress.stage]?.key ?? stages[0]!.key) }}</span
            >
            <span class="ml-auto shrink-0 tabular-nums">{{ eta }}</span>
          </div>
        </div>
        <p v-else-if="job.status === 'QUEUED'" class="mt-2 text-[11px] text-base-content/50">
          {{ $t('activity.queued') }}
        </p>
        <p v-else-if="job.status === 'FAILED'" class="mt-2 text-[11px] text-error">
          {{ job.error || $t('activity.failed') }}
        </p>
        <p v-else class="mt-1 text-[11px] text-base-content/50">
          {{ $t(`activity.status.${job.status}`)
          }}<template v-if="finishedAgo"> · {{ finishedAgo }}</template>
        </p>
        <div
          v-if="
            job.progress.items?.length &&
            ['QUEUED', 'RUNNING', 'FAILED', 'CANCEL_REQUESTED'].includes(job.status)
          "
          class="mt-2"
        >
          <button
            type="button"
            class="text-[11px] font-medium text-base-content/60 flex items-center gap-1"
            @click="expanded = !expanded"
          >
            <ChevronDown v-if="expanded" :size="12" /><ChevronRight v-else :size="12" />
            {{ job.progress.items.filter(item => item.done).length }}/{{
              job.progress.items.length
            }}
            {{ $t('activity.items') }}
          </button>
          <div
            v-if="expanded"
            class="mt-1.5 grid gap-1"
            :class="job.type === 'MOCK_EXAM_SET' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1'"
          >
            <div
              v-for="(item, index) in job.progress.items"
              :key="index"
              class="flex items-center gap-1.5 text-[11px] rounded-selector px-2 h-7 bg-base-200/50"
              :class="item.done ? 'text-success' : 'text-base-content/50'"
            >
              <Check v-if="item.done" :size="12" /><Circle v-else :size="10" />
              <span class="truncate">{{ itemLabel(item.label) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-2.5 flex items-center gap-1.5">
          <button
            v-if="job.status === 'COMPLETED'"
            type="button"
            class="btn btn-primary btn-xs rounded-full"
            @click="void center.navigate(job)"
          >
            {{ $t('activity.open') }}
          </button>
          <button
            v-if="job.status === 'FAILED'"
            type="button"
            class="btn btn-outline btn-error btn-xs rounded-full"
            @click="void center.retry(job.id)"
          >
            {{ $t('activity.retry') }}
          </button>
          <button
            v-if="job.status === 'RUNNING' || job.status === 'QUEUED'"
            type="button"
            class="btn btn-ghost btn-xs rounded-full"
            @click="void center.cancel(job.id)"
          >
            {{ $t('activity.cancel') }}
          </button>
          <button
            v-if="['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)"
            type="button"
            class="btn btn-ghost btn-xs rounded-full text-base-content/50"
            @click="void center.dismiss(job.id)"
          >
            {{ $t('activity.dismiss') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown, ChevronRight, Circle } from 'lucide-vue-next'
import { JOB_STAGES, overallPercent } from '@exam-one/contracts'
import type { BackgroundJobType } from '@exam-one/contracts'
import type { ActivityJob } from '~/composables/useJobCenter'
const props = defineProps<{ job: ActivityJob }>()
const KIND_TONE: Record<BackgroundJobType, string> = {
  EXERCISE_GENERATION: 'text-primary',
  LISTENING_AUDIO: 'text-info',
  MOCK_EXAM_SET: 'text-secondary',
}
const center = useJobCenter()
const settings = useSettingsStore()
const { t, locale } = useI18n()
const expanded = ref(props.job.type === 'MOCK_EXAM_SET')
const stages = computed(() => JOB_STAGES[props.job.type].stages)
const eta = computed(() => {
  const percent = overallPercent(props.job.type, props.job.progress)
  if (percent >= 100) return ''
  const fallback = props.job.progress.estimateSec ?? JOB_STAGES[props.job.type].estimateSec
  const elapsed = props.job.startedAt
    ? (Date.now() - new Date(props.job.startedAt).getTime()) / 1000
    : 0
  const seconds = percent > 10 && elapsed > 0 ? (elapsed / percent) * (100 - percent) : fallback
  return seconds < 50
    ? t('activity.eta', { seconds: Math.max(10, Math.ceil(seconds / 10) * 10) })
    : t('activity.etaMinutes', { minutes: Math.max(1, Math.round(seconds / 60)) })
})
const finishedAgo = computed(() => {
  if (!props.job.finishedAt) return ''
  const minutes = Math.round((new Date(props.job.finishedAt).getTime() - Date.now()) / 60_000)
  const format = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  return Math.abs(minutes) < 60
    ? format.format(minutes, 'minute')
    : format.format(Math.round(minutes / 60), 'hour')
})
// Exercise batches get a localized title; the stored title is the server's fallback.
const title = computed(() =>
  props.job.type === 'EXERCISE_GENERATION' && props.job.progress.items?.length
    ? t('activity.exercisesTitle', { count: props.job.progress.items.length })
    : props.job.title
)
// Items are `skill` (mock modules) or `skill:part` (exercise batches).
function itemLabel(label: string): string {
  const [skill, part] = label.split(':')
  return part ? `${t(`skill.${skill}`)} · ${t('exercisesUi.part')} ${part}` : t(`skill.${skill}`)
}
</script>
