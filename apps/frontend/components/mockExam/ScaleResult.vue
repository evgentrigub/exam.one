<template>
  <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
    <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-base-100/70">
      <Trophy :size="30" />
    </div>
    <div>
      <div class="text-xs font-semibold uppercase tracking-wider">
        {{ $t('mockExam.provisionalResult') }} · {{ $t(`mockExam.scale.names.${scale.id}`) }}
      </div>
      <h1 class="mt-1 font-display text-3xl font-bold">
        {{ result.overall ?? '—' }}<span class="text-lg opacity-60"> / {{ scale.max }}</span>
      </h1>
      <p class="mt-1 text-sm opacity-80">{{ message }}</p>
    </div>
    <div class="sm:ml-auto sm:text-right">
      <div class="font-display text-2xl font-bold">{{ bandLabel }}</div>
      <div class="text-xs opacity-70">
        {{ $t('mockExam.scale.passFrom', { pass: scale.pass }) }}
      </div>
    </div>
  </div>
  <p class="mt-4 text-xs opacity-70">
    {{ $t(scale.estimated ? 'mockExam.scale.originalEstimate' : 'mockExam.scale.estimate') }}
  </p>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import type { MockScaleResult, MockScaleRules } from '@exam-one/exam-packs'

const props = defineProps<{ scale: MockScaleRules; result: MockScaleResult }>()
const { t } = useI18n()

const bandLabel = computed(() => {
  if (props.result.overall === null) return '—'
  const band = props.scale.bands.find(item => item.id === props.result.band)
  return t(band?.labelKey ?? `mockExam.scale.bands.${props.result.band ?? 'none'}`)
})

const message = computed(() => {
  if (props.result.overall === null) return t('mockExam.scale.pending')
  return props.result.passed
    ? t('mockExam.scale.passMessage', { pass: props.scale.pass })
    : t('mockExam.scale.belowMessage', { pass: props.scale.pass })
})
</script>
