<template>
  <div class="rounded-field border border-base-300 overflow-hidden">
    <label class="flex items-center gap-2 border-b border-base-300 px-3 py-2">
      <Search :size="15" class="opacity-50 shrink-0" />
      <input
        v-model="query"
        type="search"
        class="grow bg-transparent outline-none min-w-0 text-sm"
        :placeholder="$t('settings.aiModelSearch')"
        :aria-label="$t('settings.aiModelSearch')"
        :disabled="loading || !!error"
      />
      <span v-if="!loading && !error" class="text-xs text-base-content/45 shrink-0">{{ filtered.length }}</span>
    </label>

    <div v-if="loading" class="flex items-center gap-2 px-3 py-6 text-sm text-base-content/60">
      <span class="loading loading-spinner loading-xs" /> {{ $t('settings.aiModelsLoading') }}
    </div>

    <div v-else-if="error" class="flex flex-wrap items-center gap-3 px-3 py-4 text-sm">
      <span class="flex items-center gap-1.5 text-error"><AlertCircle :size="14" /> {{ error }}</span>
      <button type="button" class="btn btn-xs btn-outline rounded-field" @click="emit('retry')">
        {{ $t('settings.aiModelsRetry') }}
      </button>
    </div>

    <p v-else-if="!filtered.length" class="px-3 py-6 text-sm text-base-content/55">
      {{ $t('settings.aiModelsEmpty') }}
    </p>

    <ul
      v-else
      role="listbox"
      :aria-label="$t('settings.aiModel')"
      class="max-h-64 overflow-y-auto py-1"
    >
      <li v-for="model in visible" :key="model.id" role="none">
        <button
          type="button"
          role="option"
          :aria-selected="model.id === modelValue"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-base-200 focus-visible:bg-base-200 focus-visible:outline-none"
          :class="model.id === modelValue ? 'bg-primary/5' : ''"
          @click="emit('update:modelValue', model.id)"
        >
          <span class="min-w-0 flex-1">
            <span
              class="block truncate text-sm"
              :class="model.id === modelValue ? 'font-medium text-primary' : ''"
            >{{ model.name }}</span>
            <span v-if="model.name !== model.id" class="block truncate font-mono text-xs text-base-content/50">{{
              model.id
            }}</span>
          </span>
          <span v-if="model.contextLength" class="text-xs text-base-content/45 shrink-0">
            {{ $t('settings.aiContext', { n: Math.round(model.contextLength / 1000) }) }}
          </span>
          <span v-if="model.free" class="badge badge-sm badge-success badge-soft shrink-0">
            {{ $t('settings.aiFree') }}
          </span>
          <Check v-if="model.id === modelValue" :size="15" class="text-primary shrink-0" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { LlmModelOption } from '@exam-one/contracts'
import { AlertCircle, Check, Search } from 'lucide-vue-next'

/** Long catalogues (OpenRouter has hundreds) are capped; searching narrows them down. */
const MAX_VISIBLE = 200

const props = defineProps<{
  models: LlmModelOption[]
  modelValue: string
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
  retry: []
}>()

const query = ref('')

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.models
  return props.models.filter(
    model => model.id.toLowerCase().includes(needle) || model.name.toLowerCase().includes(needle)
  )
})

const visible = computed(() => filtered.value.slice(0, MAX_VISIBLE))
</script>
