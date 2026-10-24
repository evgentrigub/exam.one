<template>
  <label
    class="flex items-start gap-3 py-2.5"
    :class="disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
  >
    <input
      type="checkbox"
      class="toggle toggle-sm mt-0.5 shrink-0"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
    />
    <div class="min-w-0">
      <div class="text-sm font-medium leading-tight">{{ label }}</div>
      <div v-if="desc" class="text-xs text-base-content/60 mt-0.5 text-pretty">{{ desc }}</div>
    </div>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  checked: boolean
  label: string
  desc?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

function onChange(event: Event) {
  emit('update:checked', (event.target as HTMLInputElement).checked)
}
</script>
