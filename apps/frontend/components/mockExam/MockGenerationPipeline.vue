<template>
  <section v-if="draft" class="card border border-base-300 bg-base-100 ring-soft">
    <div class="card-body gap-5 p-5 sm:p-6">
      <div class="flex flex-wrap items-start gap-3">
        <div class="min-w-0 flex-1">
          <div
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <Layers3 :size="16" />
            {{ $t('mockExam.generationPipeline') }}
          </div>
          <h2 class="mt-1 font-display text-xl font-bold">
            {{ $t('mockExam.generatingSet', { number: draft.setNumber }) }}
          </h2>
          <p class="mt-1 text-sm text-base-content/55">{{ pipelineDescription }}</p>
        </div>
        <span class="badge gap-1.5" :class="statusBadgeClass(draft.status)">
          <span v-if="draft.status === 'running'" class="loading loading-spinner loading-xs" />
          {{ statusLabel(draft.status) }}
        </span>
      </div>

      <div class="grid items-start gap-3 lg:grid-cols-4">
        <template v-for="(module, index) in draft.modules" :key="module.skill">
          <details open class="group relative rounded-box border border-base-300 bg-base-100">
            <div
              v-if="index > 0"
              class="absolute -left-3 top-8 hidden h-0.5 w-3 bg-base-300 lg:block"
            />
            <summary
              class="flex cursor-pointer list-none items-center gap-2.5 rounded-box p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden"
            >
              <span
                class="grid h-8 w-8 place-items-center rounded-full"
                :class="statusIconClass(module.status)"
              >
                <span
                  v-if="module.status === 'running'"
                  class="loading loading-spinner loading-sm"
                />
                <Check v-else-if="module.status === 'done'" :size="20" />
                <X v-else-if="module.status === 'failed'" :size="20" />
                <Clock v-else :size="16" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="font-semibold">{{ $t(`skill.${module.skill}`) }}</div>
                <div class="mt-0.5 text-xs text-base-content/45">
                  {{ completedJobCount(module.jobs) }}/{{ module.jobs.length }} ·
                  {{ statusLabel(module.status) }}
                </div>
              </div>
              <ChevronDown
                :size="17"
                class="shrink-0 text-base-content/40 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <div class="space-y-2 border-t border-base-300 px-4 pb-4 pt-3">
              <div v-for="job in module.jobs" :key="job.id" class="flex items-start gap-2 text-xs">
                <span
                  class="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full"
                  :class="jobIconClass(job.status)"
                >
                  <span
                    v-if="job.status === 'running'"
                    class="loading loading-spinner loading-xs"
                  />
                  <Check v-else-if="job.status === 'done'" :size="12" />
                  <TriangleAlert v-else-if="job.status === 'failed'" :size="12" />
                </span>
                <div class="min-w-0">
                  <div>
                    {{
                      $t('mockExam.pipelineJob', {
                        part: labelFor(module.skill, job.part),
                        kind: $t(`mockExam.jobKind.${job.kind}`),
                      })
                    }}
                  </div>
                  <div v-if="job.error" class="mt-0.5 line-clamp-2 text-error">{{ job.error }}</div>
                </div>
              </div>
            </div>
          </details>
        </template>
      </div>

      <div v-if="draft.error" class="alert border border-error/30 bg-error/10 text-sm">
        <CircleAlert :size="20" class="text-error" />
        <span>{{ draft.error }}</span>
      </div>

      <div class="card-actions justify-end">
        <button
          v-if="draft.status === 'failed'"
          class="btn btn-primary btn-sm"
          :disabled="preflight.checking"
          @click="retryGeneration"
        >
          <span v-if="preflight.checking" class="loading loading-spinner loading-xs" />
          <RefreshCw v-else :size="16" />
          {{ $t('mockExam.retryGeneration') }}
        </button>
        <button
          v-if="draft.status === 'done'"
          class="btn btn-ghost btn-sm"
          @click="clearGeneration"
        >
          {{ $t('mockExam.dismissPipeline') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Layers3,
  RefreshCw,
  TriangleAlert,
  X,
} from 'lucide-vue-next'
import type { MockGenerationJob, MockGenerationStatus } from '~/composables/useMockExamGeneration'

const { t } = useI18n()
const { draft, preflight, retryGeneration, clearGeneration } = useMockExamGeneration()
const { labelFor } = useActivePack()

const pipelineDescription = computed(() => {
  if (!draft.value) return ''
  if (draft.value.status === 'done') return t('mockExam.pipelineDoneDescription')
  if (draft.value.status === 'failed') return t('mockExam.pipelineFailedDescription')
  return t('mockExam.pipelineRunningDescription')
})

function statusLabel(status: MockGenerationStatus): string {
  return t(`mockExam.pipelineStatus.${status}`)
}

function statusBadgeClass(status: MockGenerationStatus): string {
  if (status === 'done') return 'badge-success'
  if (status === 'failed') return 'badge-error'
  if (status === 'running') return 'badge-primary'
  return 'badge-ghost'
}

function statusIconClass(status: MockGenerationStatus): string {
  if (status === 'done') return 'bg-success/15 text-success'
  if (status === 'failed') return 'bg-error/15 text-error'
  if (status === 'running') return 'bg-primary/15 text-primary'
  return 'bg-base-200 text-base-content/40'
}

function jobIconClass(status: MockGenerationStatus): string {
  if (status === 'done') return 'bg-success text-success-content'
  if (status === 'failed') return 'bg-error text-error-content'
  if (status === 'running') return 'text-primary'
  return 'border border-base-300'
}

function completedJobCount(jobs: readonly MockGenerationJob[]): number {
  return jobs.filter(job => job.status === 'done').length
}
</script>
