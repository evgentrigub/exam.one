<template>
  <div
    class="group bg-base-100 border border-base-300/70 ring-soft rounded-box p-5 card-hov h-full min-h-[280px] flex flex-col relative"
  >
    <button
      class="btn btn-circle btn-error btn-xs absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      :title="t('reading.deleteText')"
      :aria-label="t('reading.deleteTextAria')"
      @click.stop="$emit('deleteText', text.id)"
    >
      <Trash2 :size="13" />
    </button>

    <div class="flex items-start justify-between gap-3 pr-8">
      <div
        class="w-9 h-9 rounded-selector bg-reading-soft text-reading grid place-items-center shrink-0"
      >
        <component :is="textTypeIcon" :size="16" />
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <span class="level-pip">{{ text.difficulty }}</span>
        <span v-if="text.testingPart" class="level-pip"
          >{{ t('exercisesUi.part') }} {{ text.testingPart }}</span
        >
      </div>
    </div>

    <div class="mt-4">
      <div class="text-[11px] font-medium uppercase tracking-wider text-base-content/50">
        {{ t('skill.reading') }} · {{ getTypeLabel(text.textType, t) }}
      </div>
      <h3 class="font-display text-xl font-bold leading-tight mt-1 text-base-content line-clamp-2">
        {{ text.title }}
      </h3>
    </div>

    <div class="flex flex-wrap gap-2 mt-4">
      <span
        class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
      >
        <Clock :size="11" />
        {{ text.estimatedReadingTime }} {{ t('exercisesUi.min') }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
      >
        <AlignLeft :size="11" />
        {{ text.wordCount }} {{ t('exercisesUi.words') }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
      >
        <HelpCircle :size="11" />
        {{ t('reading.questionCount', text.questions?.length || 0) }}
      </span>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <span
        v-for="topic in displayTopics"
        :key="topic"
        class="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary"
      >
        {{ topic }}
      </span>
    </div>

    <div
      v-if="textCompleted"
      class="mt-4 rounded-box bg-success/10 border border-success/20 p-3 flex items-center gap-3"
    >
      <CheckCircle :size="18" class="text-success shrink-0" />
      <div class="min-w-0 flex-1">
        <div class="text-sm font-semibold text-success">
          {{ t('reading.bestScore', { percent: scorePercentage }) }}
        </div>
        <div class="text-xs text-success/80">
          {{ t('reading.attempts', progress?.attemptCount || 1) }}
        </div>
      </div>
    </div>

    <div class="flex-1" />

    <button
      class="btn btn-sm w-full mt-5 gap-1.5"
      :class="textCompleted ? 'btn-success' : 'btn-primary'"
      @click="$emit('startReading', text.id)"
    >
      {{ textCompleted ? t('practice.textCard.readAgain') : t('practice.textCard.startReading') }}
      <ArrowRight :size="13" />
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  AlignLeft,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  Megaphone,
  Newspaper,
  Trash2,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ReadingExercise } from '~/utils/exercises/reading'
import { useProgress } from '~/composables/useProgress'
import { getTypeLabel } from '~/utils/labels'

interface Props {
  text: ReadingExercise
}

const props = defineProps<Props>()

const _emit = defineEmits<{
  startReading: [textId: string]
  deleteText: [textId: string]
}>()

const { t } = useI18n()
const { isTextCompleted, getBestScore, getTextProgress } = useProgress()
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

const textCompleted = computed(() => (isClient.value ? isTextCompleted(props.text.id) : false))
const bestScore = computed(() => (isClient.value ? getBestScore(props.text.id) : 0))
const progress = computed(() => (isClient.value ? getTextProgress(props.text.id) : null))
const scorePercentage = computed(() =>
  Math.round((bestScore.value / (props.text.questions?.length || 1)) * 100)
)
const displayTopics = computed(() =>
  props.text.topics.map(topic => (topic.length > 18 ? `${topic.slice(0, 16)}…` : topic)).slice(0, 3)
)
const textTypeIcon = computed<Component>(() => getTextTypeIcon(props.text.textType))

function getTextTypeIcon(type: string): Component {
  const icons: Record<string, Component> = {
    email: Mail,
    notice: Bell,
    article: Newspaper,
    advertisement: Megaphone,
    instructions: FileText,
    announcement: Bell,
  }
  return icons[type] || FileText
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
