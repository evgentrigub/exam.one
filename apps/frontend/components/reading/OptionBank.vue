<template>
  <section
    class="rounded-box border border-base-300/70 bg-base-200/40 p-4 sm:p-5"
    :aria-label="t('reading.bank.title')"
  >
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 class="text-[11px] font-semibold uppercase tracking-wider text-base-content/60">
        {{ t('reading.bank.title') }}
      </h3>
      <p class="text-xs text-base-content/50">
        {{ exclusive ? t('reading.bank.onceEach') : t('reading.bank.reusable') }}
      </p>
    </div>
    <ol class="mt-3 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-x-3 gap-y-1">
      <li
        v-for="(option, index) in options"
        :key="index"
        class="flex items-start gap-2.5 rounded-field px-2.5 py-1.5 text-sm transition-opacity duration-150"
        :class="isTaken(index) ? 'opacity-45' : ''"
      >
        <span
          class="mt-px grid h-5 min-w-5 shrink-0 place-items-center rounded-full border px-1 font-mono text-[10px]"
          :class="
            usage.get(index)?.length
              ? 'border-primary bg-primary text-primary-content'
              : 'border-base-300 bg-base-100 text-base-content/70'
          "
          aria-hidden="true"
        >
          {{ optionLetter(option, index) }}
        </span>
        <span class="flex-1 leading-snug">{{ optionText(option) }}</span>
        <span
          v-if="usage.get(index)?.length"
          class="shrink-0 font-mono text-[11px] text-base-content/50"
        >
          {{ t('reading.bank.usedBy', { items: usage.get(index)!.join(', ') }) }}
        </span>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { optionLetter, optionText } from '~/utils/optionBank'

interface Props {
  options: readonly string[]
  /** Option index → question numbers answered with it. */
  usage: Map<number, number[]>
  /** Every option answers at most one question (except `repeatable` ones). */
  exclusive: boolean
  repeatable?: readonly number[]
}

const props = withDefaults(defineProps<Props>(), { repeatable: () => [] })

const { t } = useI18n()

/** Only an exclusive option that is already used fades; a repeatable `x` never does. */
function isTaken(index: number): boolean {
  return (
    props.exclusive && !props.repeatable.includes(index) && Boolean(props.usage.get(index)?.length)
  )
}
</script>
