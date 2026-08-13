<template>
  <article class="card h-full border border-base-300 bg-base-100 ring-soft">
    <div class="card-body gap-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="level-pip">{{ set.level }}</span>
          <h2 class="mt-2 font-display text-xl font-bold">{{ set.title }}</h2>
          <p v-if="set.generated" class="mt-1 text-xs text-base-content/45">
            {{ formattedDate }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge" :class="statusClass">{{ statusLabel }}</span>
          <button
            v-if="set.generated"
            class="btn btn-ghost btn-sm btn-circle text-error"
            :aria-label="$t('mockExam.deleteSet')"
            @click="confirmDelete"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div
          v-for="module in set.modules"
          :key="module.skill"
          class="rounded-field bg-base-200 p-2.5"
        >
          <div class="font-semibold">{{ $t(`skill.${module.skill}`) }}</div>
          <div class="mt-0.5 text-base-content/50">
            {{ module.minutes }} {{ $t('mockExam.minutes') }}
          </div>
        </div>
      </div>

      <div>
        <div class="mb-1 flex justify-between text-xs text-base-content/55">
          <span>{{ $t('mockExam.progress') }}</span>
          <span class="font-mono">{{ doneExerciseCount }}/{{ totalExerciseCount }}</span>
        </div>
        <progress
          class="progress progress-primary h-2 w-full"
          :value="doneExerciseCount"
          :max="totalExerciseCount"
        />
      </div>

      <div class="card-actions mt-auto justify-end">
        <NuxtLink :to="`/mock-exam/${set.id}`" class="btn btn-primary btn-sm gap-2">
          {{ actionLabel }}
          <ArrowRight :size="16" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ArrowRight, Trash2 } from 'lucide-vue-next'
import type { MockExamSet } from '~/data/mockExam/goetheA2'

const props = defineProps<{ set: MockExamSet }>()
const emit = defineEmits<{ delete: [id: string] }>()
const { t, locale } = useI18n()
const { state, doneExerciseCount, totalExerciseCount } = useMockExam(props.set)

const lockedCount = computed(
  () => props.set.modules.filter(module => state.value.modules[module.skill].locked).length
)
const statusLabel = computed(() => {
  if (state.value.finished) return t('mockExam.completed')
  if (state.value.startedAt || lockedCount.value > 0 || doneExerciseCount.value > 0)
    return t('mockExam.inProgress')
  return t('mockExam.new')
})
const statusClass = computed(() => {
  if (state.value.finished) return 'badge-success'
  if (state.value.startedAt || doneExerciseCount.value > 0) return 'badge-warning'
  return 'badge-ghost'
})
const actionLabel = computed(() => {
  if (state.value.finished) return t('mockExam.viewResults')
  if (state.value.startedAt || doneExerciseCount.value > 0) return t('mockExam.resumeExam')
  return t('mockExam.startExam')
})
const formattedDate = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(
    new Date(props.set.createdAt)
  )
)

function confirmDelete(): void {
  if (import.meta.client && confirm(t('mockExam.deleteSetConfirm', { title: props.set.title }))) {
    emit('delete', props.set.id)
  }
}
</script>
