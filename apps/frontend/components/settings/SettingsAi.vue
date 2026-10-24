<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.aiTitle')" :desc="$t('settings.aiDesc')" />

      <div
        v-if="!settings && !loadError"
        class="flex items-center gap-2 text-sm text-base-content/60"
      >
        <span class="loading loading-spinner loading-xs" /> {{ $t('settings.aiLoading') }}
      </div>
      <p v-else-if="loadError" class="flex items-center gap-1.5 text-sm text-error" role="alert">
        <AlertCircle :size="14" /> {{ loadError }}
      </p>

      <div v-else class="flex flex-col gap-6">
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.aiProvider') }}</span>
          </span>
          <SetChoice :value="provider" :options="providerOptions" @update:value="selectProvider" />
        </div>

        <AiKeyField
          :provider="provider"
          :saved-key="savedKey"
          :hint="info.keyHint"
          @saved="onKeySaved"
          @removed="onKeyRemoved"
        />

        <div>
          <div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 pb-1.5">
            <span class="label-text text-sm font-medium">{{ $t('settings.aiModel') }}</span>
            <span v-if="model" class="font-mono text-xs text-base-content/60 truncate max-w-full">{{
              model
            }}</span>
          </div>
          <p v-if="!savedKey" class="rounded-field bg-base-200 p-3.5 text-sm text-base-content/65">
            {{ $t('settings.aiModelsNeedKey') }}
          </p>
          <template v-else>
            <SetToggle
              v-if="provider === 'openrouter'"
              :checked="freeOnly"
              :label="$t('settings.aiFreeOnly')"
              :desc="$t('settings.aiFreeOnlyDesc')"
              @update:checked="freeOnly = $event"
            />
            <AiModelPicker
              :key="`${provider}:${savedKey.updatedAt}`"
              v-model="model"
              :models="visibleModels"
              :loading="modelsLoading"
              :error="modelsError"
              @open="loadModels()"
              @retry="loadModels(true)"
            />
            <p class="text-xs text-base-content/55 mt-2">{{ $t('settings.aiModelHint') }}</p>
          </template>
        </div>

        <AiFallbackModels
          v-if="savedKey && model"
          v-model="fallbacks"
          :models="visibleModels"
          :main-model="model"
          :max="MAX_LLM_FALLBACK_MODELS"
          @open="loadModels()"
        />

        <div v-if="savedKey && info.supportsReasoningEffort">
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.aiEffort') }}</span>
          </span>
          <SetRadio
            :value="effort"
            name="ai-effort"
            :label="$t('settings.aiEffort')"
            cols="grid-cols-2 sm:grid-cols-4"
            :options="effortOptions"
            @update:value="effort = $event as LlmReasoningEffort"
          />
          <p class="text-xs text-base-content/55 mt-2">{{ $t('settings.aiEffortHint') }}</p>
        </div>

        <div
          v-if="showPrivacyNotice"
          class="alert items-start border border-warning/30 bg-warning/10 text-sm"
          role="note"
        >
          <TriangleAlert :size="18" class="text-warning shrink-0 mt-0.5" />
          <div>
            <div class="font-medium">{{ $t('settings.aiPrivacyTitle') }}</div>
            <div class="text-base-content/70 mt-0.5">{{ $t('settings.aiPrivacyBody') }}</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 border-t border-base-300 pt-4">
          <button
            type="button"
            class="btn btn-xs btn-outline rounded-field gap-1.5"
            :disabled="test === 'busy' || !settings?.provider"
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

      <p
        v-if="saveError"
        class="flex items-center justify-end gap-1.5 text-sm text-error mt-4"
        role="alert"
      >
        <AlertCircle :size="14" /> {{ saveError }}
      </p>
      <SetSave v-if="settings" :label="$t('settings.aiSave')" :disabled="!canSave" :save="save" />
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import type {
  LlmHealthData,
  LlmKeySummary,
  LlmModelOption,
  LlmProvider,
  LlmReasoningEffort,
  LlmSettingsDto,
} from '@exam-one/contracts'
import { AlertCircle, CheckCircle2, TriangleAlert } from 'lucide-vue-next'
import { aiFetch } from '~/composables/useAiApi'
import { useLlmSettings } from '~/composables/useLlmSettings'
import type { SetChoiceOption } from '~/components/settings/SetChoice.vue'
import type { SetRadioOption } from '~/components/settings/SetRadio.vue'
import {
  DEFAULT_LLM_PROVIDER,
  DEFAULT_LLM_REASONING_EFFORT,
  LLM_PROVIDER_INFO,
  LLM_REASONING_EFFORTS,
  MAX_LLM_FALLBACK_MODELS,
  isFreeModel,
  llmProviderInfo,
} from '~/data/account/llmProviders'

const { t } = useI18n()
const api = useLlmSettings()

const settings = ref<LlmSettingsDto | null>(null)
const loadError = ref('')
const saveError = ref('')
const provider = ref<LlmProvider>(DEFAULT_LLM_PROVIDER)
const model = ref('')
const fallbacks = ref<string[]>([])
const effort = ref<LlmReasoningEffort>(DEFAULT_LLM_REASONING_EFFORT)
const freeOnly = ref(true)
const modelsByProvider = ref<Partial<Record<LlmProvider, LlmModelOption[]>>>({})
const loadingByProvider = ref<Partial<Record<LlmProvider, boolean>>>({})
const errorByProvider = ref<Partial<Record<LlmProvider, string>>>({})
const modelsLoading = computed(() => Boolean(loadingByProvider.value[provider.value]))
const modelsError = computed(() => errorByProvider.value[provider.value] ?? '')
const health = ref<LlmHealthData | null>(null)
const healthError = ref('')
const test = ref<'idle' | 'busy'>('idle')

const info = computed(() => llmProviderInfo(provider.value))
const savedKey = computed<LlmKeySummary | null>(
  () => settings.value?.keys.find(key => key.provider === provider.value) ?? null
)
const models = computed(() => modelsByProvider.value[provider.value] ?? [])
const visibleModels = computed(() =>
  provider.value === 'openrouter' && freeOnly.value
    ? models.value.filter(item => item.free)
    : models.value
)
const canSave = computed(() => Boolean(savedKey.value && model.value))

const providerOptions = computed<SetChoiceOption[]>(() =>
  LLM_PROVIDER_INFO.map(item => ({
    id: item.id,
    label: item.label,
    ...(settings.value?.keys.some(key => key.provider === item.id) && {
      desc: t('settings.aiKeyOnFile'),
    }),
  }))
)

const effortOptions = computed<SetRadioOption[]>(() =>
  LLM_REASONING_EFFORTS.map(id => ({ id, label: t(`settings.aiEffort_${id}`) }))
)

const showPrivacyNotice = computed(() => {
  if (!savedKey.value) return false
  if (info.value.freeTierMayTrain) return true
  if (provider.value !== 'openrouter') return false
  return [model.value, ...fallbacks.value].some(id => id && isFreeModel(id, models.value))
})

const statusLabel = computed(() => {
  if (healthError.value) return healthError.value
  if (!health.value) return ''
  if (health.value.connected) return t('settings.aiConnected')
  return health.value.message || t('settings.aiNotConfigured')
})

const statusClass = computed(() => (health.value?.connected ? 'text-success' : 'text-error'))

/** Shows the saved selection for the active provider, or a blank one for any other. */
function applySelection(next: LlmProvider) {
  const saved = settings.value
  const isActive = saved?.provider === next
  provider.value = next
  model.value = isActive ? (saved?.model ?? '') : ''
  fallbacks.value = isActive ? [...(saved?.fallbackModels ?? [])] : []
  effort.value = saved?.reasoningEffort ?? DEFAULT_LLM_REASONING_EFFORT
  freeOnly.value = !model.value || isFreeModel(model.value, [])
  saveError.value = ''
}

/** Loading and error state is kept per provider, so switching away mid-request leaves nothing stuck. */
async function loadModels(force = false) {
  const target = provider.value
  if (!settings.value?.keys.some(key => key.provider === target)) return
  if ((modelsByProvider.value[target] && !force) || loadingByProvider.value[target]) return
  loadingByProvider.value = { ...loadingByProvider.value, [target]: true }
  errorByProvider.value = { ...errorByProvider.value, [target]: '' }
  try {
    const data = await api.listModels(target)
    modelsByProvider.value = { ...modelsByProvider.value, [target]: data.models }
  } catch (err) {
    const message = err instanceof Error ? err.message : t('settings.aiNotConnected')
    errorByProvider.value = { ...errorByProvider.value, [target]: message }
  } finally {
    loadingByProvider.value = { ...loadingByProvider.value, [target]: false }
  }
}

function selectProvider(id: string) {
  applySelection(id as LlmProvider)
}

function onKeySaved(summary: LlmKeySummary) {
  if (!settings.value) return
  settings.value = {
    ...settings.value,
    keys: [...settings.value.keys.filter(key => key.provider !== summary.provider), summary],
  }
  modelsByProvider.value = Object.fromEntries(
    Object.entries(modelsByProvider.value).filter(([id]) => id !== summary.provider)
  )
}

function onKeyRemoved(removed: LlmProvider, updated: LlmSettingsDto) {
  modelsByProvider.value = Object.fromEntries(
    Object.entries(modelsByProvider.value).filter(([id]) => id !== removed)
  )
  settings.value = updated
  if (provider.value === removed) applySelection(removed)
  health.value = null
}

async function runTest() {
  test.value = 'busy'
  healthError.value = ''
  try {
    const response = await aiFetch<LlmHealthData>('/llm/health')
    health.value = response.data
    healthError.value = response.error ?? ''
  } catch (err) {
    health.value = null
    healthError.value = err instanceof Error ? err.message : t('settings.aiNotConnected')
  } finally {
    test.value = 'idle'
  }
}

async function save() {
  saveError.value = ''
  try {
    settings.value = await api.save({
      provider: provider.value,
      model: model.value,
      fallbackModels: fallbacks.value,
      reasoningEffort: effort.value,
    })
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : t('settings.aiNotConnected')
    throw err
  }
  void runTest()
}

onMounted(async () => {
  try {
    const loaded = await api.get()
    settings.value = loaded
    applySelection(loaded.provider ?? loaded.keys[0]?.provider ?? DEFAULT_LLM_PROVIDER)
    if (loaded.provider && loaded.model) void runTest()
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : t('settings.aiNotConnected')
  }
})
</script>
