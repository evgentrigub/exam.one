<template>
  <div
    v-if="card.kind === 'presentation'"
    class="rounded-box border border-primary/30 bg-primary/5 p-5"
  >
    <p class="font-semibold">{{ $t('speaking.cards.presentation.title') }}</p>
    <p class="mt-2 leading-relaxed" :lang="lang">{{ card.cue }}</p>
  </div>
  <!-- The learner's own card: a topic and a word, or an everyday thing to ask for. -->
  <figure
    v-else-if="isOwnCard"
    class="relative mx-auto w-full max-w-[16rem] rounded-box border-2 border-warning/40 bg-base-100 px-5 pb-6 pt-4 text-center shadow-sm"
  >
    <figcaption class="text-[10px] font-semibold uppercase tracking-wider text-warning">
      {{ card.kind === 'ask' ? $t('speaking.cards.wordCard') : $t('speaking.cards.requestCard') }}
    </figcaption>
    <p v-if="card.topic" class="mt-1 text-xs text-base-content/55">
      {{ $t('speaking.cards.topic') }}: {{ card.topic }}
    </p>
    <p class="mt-4 font-display text-2xl font-bold leading-tight text-base-content" :lang="lang">
      {{ card.cue }}
    </p>
  </figure>

  <!-- The partner's (or examiner's) fixed line, which the learner reacts to. -->
  <figure v-else class="flex items-start gap-3">
    <span
      class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-base-200 text-base-content/60"
      aria-hidden="true"
    >
      <UserRound :size="15" />
    </span>
    <div
      class="relative rounded-box rounded-tl-none border border-base-300 bg-base-200/60 px-4 py-3"
    >
      <p class="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
        {{
          card.speaker === 'examiner'
            ? $t('speaking.cards.examinerSays')
            : $t('speaking.cards.partnerSays')
        }}
        <span v-if="card.topic" class="normal-case tracking-normal font-normal">
          · {{ card.topic }}</span
        >
      </p>
      <blockquote class="mt-1 text-[15px] font-medium leading-snug" :lang="lang">
        {{ card.cue }}
      </blockquote>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { UserRound } from 'lucide-vue-next'
import type { SpeakingCard } from '@exam-one/exam-packs'

const props = defineProps<{ card: SpeakingCard }>()

// Card text is in the exam language, whatever the interface language is.
const { pack } = useActivePack()
const lang = computed(() => pack.value.language)
const isOwnCard = computed(() => props.card.kind === 'ask' || props.card.kind === 'request')
</script>
