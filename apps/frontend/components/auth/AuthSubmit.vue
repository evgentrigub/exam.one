<template>
  <button
    type="submit"
    class="btn btn-primary w-full rounded-field gap-2"
    :disabled="disabled || loading"
  >
    <template v-if="loading">
      <span class="loading loading-spinner loading-sm" /> {{ $t('auth.justAMoment') }}
    </template>
    <template v-else>
      <slot />
      <component :is="resolvedIcon" :size="17" />
    </template>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  loading?: boolean
  disabled?: boolean
  icon?: Component
}>()

const resolvedIcon = computed(() => props.icon ?? ArrowRight)
</script>
