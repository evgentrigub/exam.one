<template>
  <div>
    <span class="label pb-1.5 block">
      <span class="label-text text-sm font-medium">{{ $t('settings.aiFallbacks') }}</span>
    </span>

    <ol v-if="modelValue.length" class="flex flex-col gap-1.5 mb-2">
      <li
        v-for="(id, index) in modelValue"
        :key="id"
        class="flex items-center gap-2.5 rounded-field border border-base-300 px-3 py-1.5 text-sm"
      >
        <span class="text-xs font-medium text-base-content/45 w-4">{{ index + 1 }}</span>
        <span class="min-w-0 flex-1 truncate font-mono text-xs">{{ id }}</span>
        <span v-if="isFree(id)" class="badge badge-xs badge-success badge-soft">{{
          $t('settings.aiFree')
        }}</span>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square rounded-field"
          :aria-label="$t('settings.aiFallbackRemove', { model: id })"
          @click="remove(id)"
        >
          <X :size="14" />
        </button>
      </li>
    </ol>

    <select
      v-if="modelValue.length < max"
      class="select select-bordered select-sm rounded-field w-full max-w-sm"
      :aria-label="$t('settings.aiFallbackAdd')"
      @pointerdown="emit('open')"
      @keydown.enter="emit('open')"
      @keydown.space="emit('open')"
      @keydown.down="emit('open')"
      @change="add"
    >
      <option value="" selected>{{ $t('settings.aiFallbackAdd') }}</option>
      <option v-for="model in options" :key="model.id" :value="model.id">
        {{ model.name }}{{ model.free ? ` · ${$t('settings.aiFree')}` : '' }}
      </option>
    </select>
    <p class="text-xs text-base-content/55 mt-2">{{ $t('settings.aiFallbacksHint', { max }) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { LlmModelOption } from '@exam-one/contracts'
import { X } from 'lucide-vue-next'
import { isFreeModel } from '~/data/account/llmProviders'

const props = defineProps<{
  modelValue: string[]
  models: LlmModelOption[]
  /** The main model; it cannot also be a fallback. */
  mainModel: string
  max: number
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
  open: []
}>()

const options = computed(() =>
  props.models.filter(model => model.id !== props.mainModel && !props.modelValue.includes(model.id))
)

function isFree(id: string): boolean {
  return isFreeModel(id, props.models)
}

function add(event: Event) {
  const select = event.target as HTMLSelectElement
  const id = select.value
  select.value = ''
  if (!id || props.modelValue.length >= props.max) return
  emit('update:modelValue', [...props.modelValue, id])
}

function remove(id: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter(item => item !== id)
  )
}
</script>
