<template>
  <div class="grid gap-2" :class="cols">
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      :aria-pressed="value === option.id"
      :disabled="option.disabled"
      :title="option.disabled ? $t('settings.availableSoon') : undefined"
      class="rounded-field border px-3 py-3 text-left transition-colors"
      :class="optionClass(option)"
      @click="select(option)"
    >
      <div class="flex items-center gap-2">
        <component
          :is="option.icon"
          v-if="option.icon"
          :size="15"
          :class="
            option.disabled ? 'opacity-30' : value === option.id ? 'text-primary' : 'opacity-55'
          "
        />
        <span
          class="text-sm font-medium"
          :class="
            option.disabled ? 'text-base-content/40' : value === option.id ? 'text-primary' : ''
          "
        >
          {{ option.label }}
        </span>
        <Check
          v-if="value === option.id && !option.disabled"
          :size="14"
          class="ml-auto text-primary"
        />
      </div>
      <div
        v-if="option.disabled || option.desc"
        class="text-xs mt-1"
        :class="option.disabled ? 'text-base-content/40' : 'text-base-content/55'"
      >
        {{ option.disabled ? $t('settings.availableSoon') : option.desc }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Check } from 'lucide-vue-next'

export interface SetChoiceOption {
  id: string
  label: string
  desc?: string
  icon?: Component
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: SetChoiceOption[]
    value: string
    cols?: string
    locked?: boolean
  }>(),
  { cols: 'grid-cols-2 sm:grid-cols-3' }
)

const emit = defineEmits<{
  'update:value': [id: string]
}>()

function optionClass(option: SetChoiceOption): string {
  if (option.disabled) return 'border-base-300 bg-base-200/40 cursor-not-allowed'
  if (props.locked) {
    return props.value === option.id
      ? 'border-primary bg-primary/5 cursor-default'
      : 'border-base-300 bg-base-200/40 cursor-default'
  }
  if (props.value === option.id) return 'border-primary bg-primary/5'
  return 'border-base-300 hover:bg-base-200'
}

function select(option: SetChoiceOption) {
  if (option.disabled || props.locked) return
  emit('update:value', option.id)
}
</script>
