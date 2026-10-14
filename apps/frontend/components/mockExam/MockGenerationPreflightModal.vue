<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-base-content/40 p-4 backdrop-blur-sm"
    @click="emit('close')"
  >
    <section
      class="card max-h-[90vh] w-full max-w-xl border border-base-300 bg-base-100 shadow-xl"
      @click.stop
    >
      <div class="card-body gap-5 overflow-y-auto p-6">
        <div class="flex items-start gap-3">
          <div
            class="grid h-11 w-11 shrink-0 place-items-center rounded-field bg-primary/10 text-primary"
          >
            <Wrench :size="24" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-xl font-bold">{{ $t('mockExam.preflightTitle') }}</h2>
            <p class="mt-1 text-sm text-base-content/60">
              {{ $t('mockExam.preflightDescription') }}
            </p>
          </div>
          <button
            class="btn btn-ghost btn-sm btn-circle"
            :aria-label="$t('mockExam.close')"
            @click="emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="check in checks"
            :key="check.id"
            class="flex items-center gap-3 rounded-box border border-base-300 p-3.5"
          >
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full"
              :class="checkIconClass(check.state)"
            >
              <span v-if="check.state === 'checking'" class="loading loading-spinner loading-sm" />
              <Check v-else-if="check.state === 'ready'" :size="20" />
              <X v-else :size="20" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="font-medium">{{ check.label }}</div>
              <div v-if="check.detail" class="truncate text-xs text-base-content/55">
                {{ check.detail }}
              </div>
            </div>
            <span class="badge badge-sm" :class="checkBadgeClass(check.state)">{{
              statusLabel(check.state)
            }}</span>
          </div>
        </div>

        <div
          v-if="preflight.checkedAt && !preflightReady"
          class="alert border border-warning/30 bg-warning/10 text-sm"
        >
          <TriangleAlert :size="20" class="text-warning" />
          <span>{{ $t('mockExam.preflightBlocked') }}</span>
          <NuxtLink
            v-if="!preflight.llmConfigured"
            to="/settings?section=ai"
            class="btn btn-xs btn-outline rounded-field"
          >
            {{ $t('mockExam.openAiSettings') }}
          </NuxtLink>
        </div>

        <div class="card-actions items-center justify-end border-t border-base-300 pt-4">
          <button
            class="btn btn-ghost btn-sm"
            :disabled="preflight.checking"
            @click="checkPreflight"
          >
            <RefreshCw :size="16" />
            {{ $t('mockExam.checkAgain') }}
          </button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="!preflightReady || preflight.checking"
            @click="emit('generate')"
          >
            <Sparkles :size="16" />
            {{ $t('mockExam.generateSetNumber', { number: setNumber }) }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Check, RefreshCw, Sparkles, TriangleAlert, Wrench, X } from 'lucide-vue-next'

type CheckState = 'checking' | 'ready' | 'failed'

defineProps<{ setNumber: number }>()
const emit = defineEmits<{ close: []; generate: [] }>()
const { t } = useI18n()
const { preflight, preflightReady, checkPreflight } = useBackgroundMockGeneration()

const checks = computed(() => [
  {
    id: 'key',
    label: t('mockExam.llmKeyCheck'),
    state: stateFor(preflight.value.llmConfigured),
    detail: preflight.value.provider
      ? `${preflight.value.provider} · ${preflight.value.model ?? ''}`
      : preflight.value.llmMessage,
  },
  {
    id: 'connection',
    label: t('mockExam.llmConnectionCheck'),
    state: stateFor(preflight.value.llmConnected),
    detail: preflight.value.llmMessage,
  },
  {
    id: 'tts',
    label: t('mockExam.ttsCheck'),
    state: stateFor(preflight.value.ttsAvailable),
    detail: preflight.value.ttsMessage,
  },
])

function stateFor(ready: boolean): CheckState {
  if (preflight.value.checking || !preflight.value.checkedAt) return 'checking'
  return ready ? 'ready' : 'failed'
}

function checkIconClass(state: CheckState): string {
  if (state === 'ready') return 'bg-success/15 text-success'
  if (state === 'failed') return 'bg-error/15 text-error'
  return 'bg-base-200 text-base-content/50'
}

function checkBadgeClass(state: CheckState): string {
  if (state === 'ready') return 'badge-success'
  if (state === 'failed') return 'badge-error'
  return 'badge-ghost'
}

function statusLabel(state: CheckState): string {
  if (state === 'ready') return t('mockExam.ready')
  if (state === 'failed') return t('mockExam.unavailable')
  return t('mockExam.checking')
}

onMounted(() => void checkPreflight())
</script>
