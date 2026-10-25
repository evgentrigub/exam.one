<template>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div
      v-if="!isInitialized"
      class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center"
    >
      <span
        class="loading loading-spinner loading-md text-primary"
        :aria-label="$t('pages.writing.loadingTopic')"
      />
      <p class="text-sm text-base-content/60 mt-3">{{ $t('pages.writing.loadingTopic') }}</p>
    </div>

    <div
      v-else-if="!topic"
      class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center"
    >
      <p class="text-sm text-base-content/60 mb-3">{{ $t('pages.writing.topicNotFound') }}</p>
      <NuxtLink to="/exercises?skill=writing" class="btn btn-primary btn-sm">{{
        $t('pages.common.backToExercises')
      }}</NuxtLink>
    </div>

    <template v-else>
      <ExerciseHeader
        skill="writing"
        :type="topic.topicType"
        :title="topic.title"
        :subtitle="`${pack.title} · ${labelFor('writing', topic.testingPart || 2)} · ${
          isFormFillTopic(topic)
            ? $t('writing.formFill.entryCount', { count: blankRows(topic).length })
            : $t('pages.writing.wordRange', { min: topic.wordCount.min, max: topic.wordCount.max })
        }`"
        :level="topic.difficulty"
        to="/exercises?skill=writing"
        :back-label="$t('exercisesUi.skillPractice', { skill: $t('skill.writing') })"
      />

      <WritingSession :topic="topic" @complete="handleWritingComplete" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { WritingExercise } from '~/utils/types'
import WritingSession from '~/components/writing/WritingSession.vue'
import { blankRows, isFormFillTopic } from '~/utils/writing/formFill'

const { t } = useI18n()
const route = useRoute()
const { getTopicById, isInitialized } = useWritingTopics()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingExercise | undefined>(() => getTopicById(topicId.value))
const { pack, labelFor } = useActivePack()

usePageMeta('pageMeta.writingExerciseTitle', 'skill.writing')
watchEffect(() => {
  if (topic.value) usePageMeta(topic.value.title, 'skill.writing')
})

useHead({
  title: () =>
    topic.value
      ? `${topic.value.title} – ${t('skill.writing')}`
      : t('pageMeta.writingExerciseTitle'),
})

function handleWritingComplete(
  _topicId: string,
  _content: string,
  _wordCount: number,
  _timeSpent: number
) {
  // Progress is saved and the AI review is requested inside WritingSession.
}
</script>
