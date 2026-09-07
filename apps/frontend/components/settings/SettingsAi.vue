<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.aiTitle')" :desc="$t('settings.aiDesc')" />

      <div class="flex flex-col gap-5">
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.aiProvider') }}</span>
          </span>
          <SetChoice
            :value="activeProvider"
            cols="grid-cols-2 max-w-sm"
            locked
            :options="providerOptions"
          />
        </div>

        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.aiStatus') }}</span>
          </span>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="btn btn-xs btn-outline rounded-field gap-1.5"
              :disabled="test === 'busy'"
              @click="runTest"
            >
              <template v-if="test === 'busy'">
                <span class="loading loading-spinner loading-xs" /> {{ $t('settings.aiTesting') }}
              </template>
              <template v-else>{{ $t('settings.aiTest') }}</template>
            </button>
            <span v-if="statusLabel" class="flex items-center gap-1.5 text-sm" :class="statusClass">
              <CheckCircle2 v-if="health?.connected" :size="14" />
              <AlertCircle v-else :size="14" />
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.aiModel') }}</span>
          </span>
          <div
            class="select select-bordered rounded-field w-full max-w-sm pointer-events-none bg-base-200/60"
          >
            {{ health?.model || $t('settings.aiNoModel') }}
          </div>
          <p class="text-xs text-base-content/55 mt-2">{{ $t('settings.aiModelHint') }}</p>
        </div>
      </div>
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import type { LlmHealthData } from '@exam-one/contracts'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { aiFetch } from '~/composables/useAiApi'
import type { SetChoiceOption } from '~/components/settings/SetChoice.vue'

const { t } = useI18n()

const health = ref<LlmHealthData | null>(null)
const test = ref<'idle' | 'busy'>('idle')
const loadError = ref('')

const activeProvider = computed(() => health.value?.provider ?? '')

const providerOptions = computed<SetChoiceOption[]>(() => {
  const configured = health.value?.provider
  const openai: SetChoiceOption = { id: 'openai', label: 'OpenAI' }
  const openrouter: SetChoiceOption = { id: 'openrouter', label: 'OpenRouter' }
  if (configured && configured !== 'openai') {
    openai.desc = t('settings.aiInstanceConfigured')
  }
  if (configured && configured !== 'openrouter') {
    openrouter.desc = t('settings.aiInstanceConfigured')
  }
  return [openai, openrouter]
})

const statusLabel = computed(() => {
  if (loadError.value) return loadError.value
  if (!health.value) return ''
  if (health.value.connected) return t('settings.aiConnected')
  return health.value.message || t('settings.aiNotConfigured')
})

const statusClass = computed(() =>
  health.value?.connected ? 'text-success' : 'text-error'
)

async function runTest() {
  test.value = 'busy'
  loadError.value = ''
  try {
    const response = await aiFetch<LlmHealthData>('/llm/health')
    if (response.error) {
      health.value = null
      loadError.value = response.error
      return
    }
    health.value = response.data
  } catch (err) {
    health.value = null
    loadError.value = err instanceof Error ? err.message : t('settings.aiNotConnected')
  } finally {
    test.value = 'idle'
  }
}

onMounted(() => {
  void runTest()
})
</script>
