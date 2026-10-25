<template>
  <div>
    <label for="ai-key" class="label pb-1.5 block">
      <span class="label-text text-sm font-medium">{{ $t('settings.aiKey') }}</span>
    </label>

    <div
      v-if="savedKey && !replacing"
      class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-field border border-base-300 bg-base-200/50 px-3 py-2.5"
    >
      <KeyRound :size="17" class="opacity-60 shrink-0" />
      <span class="font-mono text-sm tracking-wide">••••••••{{ savedKey.last4 }}</span>
      <span class="text-xs text-base-content/55">{{ $t('settings.aiKeySaved') }}</span>
      <div class="ml-auto flex gap-1.5">
        <button type="button" class="btn btn-xs btn-ghost rounded-field" @click="startReplace">
          {{ $t('settings.aiKeyReplace') }}
        </button>
        <button
          type="button"
          class="btn btn-xs btn-ghost rounded-field text-error"
          :disabled="busy"
          @click="remove"
        >
          {{ $t('settings.aiKeyRemove') }}
        </button>
      </div>
    </div>

    <form v-else class="flex flex-col gap-2 sm:flex-row" @submit.prevent="save">
      <label class="input input-bordered flex items-center gap-2 w-full rounded-field">
        <KeyRound :size="17" class="opacity-60 shrink-0" />
        <input
          id="ai-key"
          v-model="draft"
          type="password"
          autocomplete="off"
          spellcheck="false"
          :placeholder="$t('settings.aiKeyPlaceholder')"
          class="grow bg-transparent outline-none min-w-0 font-mono text-sm"
          @input="error = ''"
        />
      </label>
      <div class="flex gap-2 shrink-0">
        <button
          type="submit"
          class="btn btn-primary rounded-field gap-1.5"
          :disabled="busy || draft.trim().length < MIN_KEY_LENGTH"
        >
          <span v-if="busy" class="loading loading-spinner loading-xs" />
          {{ busy ? $t('settings.aiKeyChecking') : $t('settings.aiKeySave') }}
        </button>
        <button
          v-if="replacing"
          type="button"
          class="btn btn-ghost rounded-field"
          @click="cancelReplace"
        >
          {{ $t('settings.aiKeyCancel') }}
        </button>
      </div>
    </form>

    <div class="flex flex-wrap items-center gap-3 mt-2">
      <span v-if="error" class="flex items-center gap-1.5 text-sm text-error" role="alert">
        <AlertCircle :size="14" /> {{ error }}
      </span>
      <span class="text-xs text-base-content/50 ml-auto">{{
        $t('settings.aiKeyFrom', { hint })
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LlmKeySummary, LlmProvider, LlmSettingsDto } from '@exam-one/contracts'
import { AlertCircle, KeyRound } from 'lucide-vue-next'
import { useLlmSettings } from '~/composables/useLlmSettings'

const MIN_KEY_LENGTH = 8

const props = defineProps<{
  provider: LlmProvider
  savedKey: LlmKeySummary | null
  hint: string
}>()

const emit = defineEmits<{
  saved: [summary: LlmKeySummary]
  removed: [provider: LlmProvider, settings: LlmSettingsDto]
}>()

const { t } = useI18n()
const api = useLlmSettings()
const draft = ref('')
const busy = ref(false)
const error = ref('')
const replacing = ref(false)

watch(
  () => props.provider,
  () => {
    draft.value = ''
    error.value = ''
    replacing.value = false
  }
)

function startReplace() {
  replacing.value = true
  error.value = ''
}

function cancelReplace() {
  replacing.value = false
  draft.value = ''
  error.value = ''
}

async function save() {
  busy.value = true
  error.value = ''
  try {
    const summary = await api.saveKey(props.provider, draft.value.trim())
    draft.value = ''
    replacing.value = false
    emit('saved', summary)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('settings.aiNotConnected')
  } finally {
    busy.value = false
  }
}

async function remove() {
  busy.value = true
  error.value = ''
  try {
    const provider = props.provider
    const settings = await api.removeKey(provider)
    emit('removed', provider, settings)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('settings.aiNotConnected')
  } finally {
    busy.value = false
  }
}
</script>
