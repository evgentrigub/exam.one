<template>
  <div class="form-control">
    <label class="label pb-1 flex items-center gap-1.5" :for="id">
      <span class="label-text text-sm font-medium">{{ label }}</span>
    </label>
    <label
      class="input input-bordered flex items-center gap-2 w-full rounded-field"
      :class="error ? 'border-error focus-within:border-error' : ''"
    >
      <component :is="icon" :size="18" class="opacity-60 shrink-0" />
      <input
        :id="id"
        class="grow bg-transparent outline-none min-w-0"
        :type="type ?? 'text'"
        :value="modelValue"
        :placeholder="placeholder ?? ''"
        :autocomplete="autocomplete ?? 'off'"
        @input="onInput"
        @blur="$emit('blur')"
      />
      <slot name="trailing" />
    </label>
    <div v-if="error" class="flex items-center gap-1.5 mt-1.5 text-error">
      <AlertCircle :size="13" />
      <span class="text-xs">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

defineProps<{
  id: string
  label: string
  icon: Component
  modelValue: string
  type?: string
  placeholder?: string
  autocomplete?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
