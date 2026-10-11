<template>
  <div class="flex items-center gap-4 p-5">
    <div class="min-w-0 flex-1">
      <div class="text-xs font-semibold uppercase tracking-wider text-base-content/50">
        {{ set.title }}
      </div>
      <div class="font-display text-lg font-bold mt-1">{{ statusLabel }}</div>
      <div class="text-xs text-base-content/60 mt-1 flex items-center gap-3">
        <span>{{ totalMinutes }} {{ $t('mockExam.minutes') }}</span>
        <span>{{ $t('examFormatUi.modulesCount', { count: set.modules.length }) }}</span>
      </div>
    </div>
    <NuxtLink :to="`/mock-exam/${set.id}`" class="btn btn-primary btn-sm gap-1 shrink-0">
      {{ actionLabel }}
      <ArrowRight :size="12" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { mockModuleId } from '@exam-one/exam-packs'
import type { MockExamSet } from '~/data/mockExam/goetheA2'

const props = defineProps<{ set: MockExamSet }>()
const { t } = useI18n()
const { state, doneExerciseCount } = useMockExam(props.set)

const lockedCount = computed(
  () => props.set.modules.filter(module => state.value.modules[mockModuleId(module)]!.locked).length
)
const statusLabel = computed(() => {
  if (state.value.finished) return t('mockExam.completed')
  if (state.value.startedAt || lockedCount.value > 0 || doneExerciseCount.value > 0)
    return t('mockExam.inProgress')
  return t('mockExam.new')
})
const actionLabel = computed(() => {
  if (state.value.finished) return t('mockExam.viewResults')
  if (state.value.startedAt || doneExerciseCount.value > 0) return t('mockExam.resumeExam')
  return t('mockExam.startExam')
})
const totalMinutes = computed(() =>
  props.set.modules.reduce((sum, module) => sum + module.minutes, 0)
)
</script>
