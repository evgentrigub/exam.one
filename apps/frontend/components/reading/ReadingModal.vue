<template>
  <div
    class="modal modal-open"
    role="dialog"
    aria-modal="true"
    @keydown.esc.prevent.stop="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="modal-backdrop" @click="$emit('close')" />

    <!-- Panel -->
    <div class="modal-box w-11/12 max-w-5xl p-0 bg-base-100 border border-base-300/70 ring-soft">
      <!-- Header -->
      <div
        class="px-5 sm:px-7 py-5 border-b border-base-300/70 flex items-start justify-between gap-4"
      >
        <div class="flex items-start gap-3 min-w-0">
          <button
            class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70 shrink-0"
            aria-label="Back to reading selection"
            @click="$emit('close')"
          >
            <ArrowLeft :size="14" />
          </button>
          <div class="min-w-0">
            <div
              class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50 flex-wrap"
            >
              <BookOpen :size="11" />
              Reading preview · {{ getTextTypeLabel(text.textType) }}
            </div>
            <h2 class="font-display text-[28px] font-bold leading-tight mt-1 text-base-content">
              {{ text.title }}
            </h2>
            <p class="text-sm text-base-content/60 mt-1">
              {{ text.wordCount }} words · ~{{ text.estimatedReadingTime }} min read
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span class="level-pip">{{ text.difficulty }}</span>
          <span v-if="text.testingPart" class="level-pip">Teil {{ text.testingPart }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 sm:p-7">
        <div class="bg-base-100 border border-base-300/70 rounded-box p-5 sm:p-6">
          <div class="flex items-center gap-2 text-base-content/70 mb-4">
            <component :is="textTypeIcon" :size="14" />
            <div class="text-sm font-semibold">Text</div>
          </div>
          <div
            class="h-[52vh] overflow-y-auto pr-1 leading-[1.75] text-[15px] text-base-content/85 whitespace-pre-line"
          >
            {{ text.content }}
          </div>
        </div>

        <!-- Start Questions Button -->
        <div class="modal-action mt-6 pt-5 border-t border-base-300/70">
          <div
            class="rounded-box bg-primary/10 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-11 h-11 bg-primary text-primary-content rounded-full grid place-items-center shrink-0"
              >
                <HelpCircle :size="20" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-base-content">Ready for the questions?</h3>
                <p class="text-sm text-base-content/70">
                  Answer {{ text.questions?.length || 0 }} multiple-choice questions after reading.
                </p>
              </div>
            </div>
            <button
              class="btn btn-primary btn-sm gap-1.5 shrink-0"
              @click="$emit('start-quiz', text.id)"
            >
              Start questions
              <ArrowRight :size="13" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  FileText,
  HelpCircle,
  Mail,
  Megaphone,
  Newspaper,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ReadingExercise } from '~/utils/exercises/reading'

interface Props {
  text: ReadingExercise
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  'start-quiz': [textId: string]
}>()

const textTypeIcon = computed<Component>(() => getTextTypeIcon(props.text.textType))

function getTextTypeLabel(type: string) {
  const labels: Record<string, string> = {
    email: 'Personal email',
    notice: 'Information notice',
    article: 'Article',
    advertisement: 'Advertisement',
    instructions: 'Instructions',
    announcement: 'Announcement',
  }
  return labels[type] || type
}

function getTextTypeIcon(type: string): Component {
  const icons: Record<string, Component> = {
    email: Mail,
    notice: Bell,
    article: Newspaper,
    advertisement: Megaphone,
    instructions: FileText,
    announcement: Bell,
  }
  return icons[type] || BookOpen
}
</script>
