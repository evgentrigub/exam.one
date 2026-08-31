<template>
  <ClientOnly>
    <div
      v-if="active"
      class="fixed top-0 left-0 right-0 z-[80] h-[3px] bg-primary/15 pointer-events-none"
    >
      <div
        class="h-full bg-primary transition-[width] duration-300 ease-out"
        :style="{ width: `${overall}%`, boxShadow: '0 0 8px var(--color-primary)' }"
      />
    </div>

    <div
      v-if="total > 0"
      class="fixed bottom-5 right-5 z-[70] w-[360px] max-w-[calc(100vw-2rem)]"
    >
      <div class="bg-base-100 rounded-box border border-base-300 shadow-2xl overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-base-200/50 transition-colors"
          @click="open = !open"
        >
          <span
            class="w-8 h-8 rounded-field grid place-items-center shrink-0"
            :class="allDone ? 'bg-success/12 text-success' : 'bg-primary/12 text-primary'"
          >
            <CheckCircle2 v-if="allDone" :size="17" />
            <span v-else class="loading loading-spinner loading-sm" />
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold leading-tight">
              {{
                allDone
                  ? $t('generation.trayReady', { count: doneCount })
                  : $t('generation.generating')
              }}
            </div>
            <div class="text-[11px] text-base-content/55 leading-tight mt-0.5">
              {{
                allDone
                  ? $t('generation.trayAllDone')
                  : $t('generation.trayProgress', {
                      done: doneCount,
                      total,
                      running: runningCount,
                      queued: queuedCount,
                    })
              }}
            </div>
          </div>
          <ChevronDown v-if="open" :size="16" class="opacity-50" />
          <ChevronUp v-else :size="16" class="opacity-50" />
        </button>

        <div class="px-4 pb-2 -mt-1">
          <progress
            class="progress h-1.5 w-full"
            :class="allDone ? 'progress-success' : 'progress-primary'"
            :value="overall"
            max="100"
          />
        </div>

        <template v-if="open">
          <div class="max-h-[300px] overflow-y-auto divide-y divide-base-300/60 border-t border-base-300/60">
            <div
              v-for="row in orderedRows"
              :key="row.id"
              class="flex items-center justify-between px-4 py-2.5"
            >
              <span class="text-sm capitalize">{{ rowLabel(row) }}</span>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-selector uppercase"
                :class="rowStatusClass(row.status)"
              >
                {{ $t(statusKey(row.status)) }}
              </span>
            </div>
          </div>
          <div
            class="flex items-center gap-2 px-3 py-2.5 border-t border-base-300/60 bg-base-200/40"
          >
            <template v-if="allDone">
              <NuxtLink
                to="/exercises"
                class="btn btn-primary btn-sm rounded-full gap-1.5 flex-1"
                @click="dismissAll"
              >
                {{ $t('generation.trayViewExercises') }}
              </NuxtLink>
              <button type="button" class="btn btn-ghost btn-sm rounded-full" @click="dismissAll">
                {{ $t('generation.dismiss') }}
              </button>
            </template>
            <template v-else>
              <span class="text-[11px] text-base-content/55">{{ $t('generation.trayKeepWorking') }}</span>
              <button
                v-if="doneCount > 0"
                type="button"
                class="btn btn-ghost btn-xs rounded-full ml-auto"
                @click="dismissCompleted"
              >
                {{ $t('generation.trayClearDone') }}
              </button>
            </template>
          </div>
        </template>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { GenerationTrayRow, TrayPartStatus } from '~/composables/useGenerationJobTray'

const { t } = useI18n()
const {
  rows,
  total,
  doneCount,
  runningCount,
  queuedCount,
  active,
  allDone,
  overall,
  dismissCompleted,
  dismissAll,
} = useGenerationJobTray()

const open = ref(true)

watch(total, (next, prev) => {
  if (next > (prev ?? 0)) open.value = true
})

const rank: Record<TrayPartStatus, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  done: 3,
}

const orderedRows = computed(() =>
  [...rows.value].sort((a, b) => rank[a.status] - rank[b.status])
)

function rowLabel(row: GenerationTrayRow): string {
  const skill = row.skillKey === 'mock' ? t('nav.mockExams') : t(`skill.${row.skillKey}`)
  const part = `${t('exercisesUi.part')} ${row.part}`
  if (row.jobKind) {
    const kindKey = `mockExam.jobKind.${row.jobKind}`
    return `${skill} · ${part} · ${t(kindKey)}`
  }
  return `${skill} · ${part}`
}

function statusKey(status: TrayPartStatus): string {
  const keys: Record<TrayPartStatus, string> = {
    queued: 'generation.statusQueued',
    running: 'generation.statusRunning',
    done: 'generation.statusDone',
    failed: 'generation.statusFailed',
  }
  return keys[status]
}

function rowStatusClass(status: TrayPartStatus): string {
  const map: Record<TrayPartStatus, string> = {
    queued: 'bg-base-200 text-base-content/60',
    running: 'bg-primary/15 text-primary',
    done: 'bg-success/15 text-success',
    failed: 'bg-error/15 text-error',
  }
  return map[status]
}
</script>
