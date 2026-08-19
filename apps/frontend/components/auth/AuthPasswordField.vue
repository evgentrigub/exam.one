<template>
  <AuthField
    :id="id"
    :label="label"
    :icon="resolvedIcon"
    :model-value="modelValue"
    :type="show ? 'text' : 'password'"
    :placeholder="placeholder ?? ''"
    :autocomplete="autocomplete ?? 'off'"
    :error="error ?? ''"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  >
    <template #trailing>
      <button
        type="button"
        class="btn btn-xs btn-ghost btn-circle shrink-0"
        :aria-label="show ? $t('auth.hidePassword') : $t('auth.showPassword')"
        @click="show = !show"
      >
        <EyeOff v-if="show" :size="15" />
        <Eye v-else :size="15" />
      </button>
    </template>
  </AuthField>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Eye, EyeOff, KeyRound } from 'lucide-vue-next'

const props = defineProps<{
  id: string
  label: string
  icon?: Component
  modelValue: string
  placeholder?: string
  autocomplete?: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const resolvedIcon = computed(() => props.icon ?? KeyRound)
const show = ref(false)
</script>
