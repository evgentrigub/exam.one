<template>
  <div class="max-w-[1180px] mx-auto px-8 py-8">
    <ExerciseHeader
      v-if="topic"
      skill="speaking"
      :type="topic.topicType"
      :title="topic.theme"
      :subtitle="speakingSubtitle"
      :level="topic.difficulty"
      :part="topic.testingPart"
      to="/exercises?skill=speaking"
      :back-label="$t('exercisesUi.skillPractice', { skill: $t('skill.speaking') })"
    />

    <ClientOnly>
      <SpeakingSession v-if="topic" :topic="topic" @finish="goBack" />
      <template #fallback>
        <div class="rounded-box h-72 skel" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import SpeakingSession from '~/components/speaking/SpeakingSession.vue'

usePageMeta('pageMeta.speakingExerciseTitle', 'skill.speaking')

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getTopicById } = useSpeakingExercises()

const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<SpeakingA2Topic | null>(() => getTopicById(topicId.value) || null)

const { pack, labelFor } = useActivePack()
const speakingSubtitle = computed(() => {
  if (!topic.value) return ''
  return `${pack.value.title} · ${labelFor('speaking', topic.value.testingPart)}`
})

watchEffect(() => {
  if (topic.value) usePageMeta(topic.value.theme, 'skill.speaking')
})

function goBack() {
  router.push('/exercises?skill=speaking')
}

useHead({
  title: () =>
    topic.value
      ? `${topic.value.theme} – ${t('skill.speaking')}`
      : t('pageMeta.speakingExerciseTitle'),
})
definePageMeta({ preload: false })
</script>
