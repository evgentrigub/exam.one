<template>
  <div role="radiogroup" :aria-label="label" class="grid gap-x-6 gap-y-3" :class="cols">
    <label
      v-for="option in options"
      :key="option.id"
      class="flex items-center gap-3 cursor-pointer w-fit"
      :class="option.disabled ? 'cursor-not-allowed opacity-40' : ''"
    >
      <input
        type="radio"
        class="radio radio-primary radio-sm"
        :name="name"
        :value="option.id"
        :checked="value === option.id"
        :disabled="option.disabled"
        @change="emit('update:value', option.id)"
      />
      <span class="text-sm font-medium" :class="value === option.id ? 'text-primary' : ''">
        {{ option.label }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
export interface SetRadioOption {
  id: string
  label: string
  disabled?: boolean
}

withDefaults(
  defineProps<{
    options: SetRadioOption[]
    value: string
    name: string
    label?: string
    cols?: string
  }>(),
  { cols: 'grid-cols-1 sm:grid-cols-2' }
)

const emit = defineEmits<{
  'update:value': [id: string]
}>()
</script>
