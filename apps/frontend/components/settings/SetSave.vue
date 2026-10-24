<template>
  <div class="flex items-center justify-end gap-3 mt-5">
    <span v-if="saved" class="flex items-center gap-1.5 text-sm text-success">
      <CheckCircle2 :size="15" /> {{ $t('settings.saved') }}
    </span>
    <button
      type="button"
      class="btn btn-sm btn-primary rounded-field gap-2"
      :disabled="disabled || busy"
      @click="click"
    >
      <template v-if="busy">
        <span class="loading loading-spinner loading-xs" /> {{ $t('settings.saving') }}
      </template>
      <template v-else>{{ label || $t('settings.saveChanges') }}</template>
    </button>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  label?: string
  disabled?: boolean
  save?: () => void | Promise<void>
}>()

const busy = ref(false)
const saved = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

async function click() {
  busy.value = true
  saved.value = false
  try {
    await props.save?.()
    saved.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      saved.value = false
    }, 2200)
  } catch {
    saved.value = false
  } finally {
    busy.value = false
  }
}
</script>
