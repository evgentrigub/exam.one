<template>
  <div class="mx-auto max-w-[980px] space-y-6 px-4 py-8 sm:px-6">
    <div v-if="!ready" class="space-y-4">
      <div class="skeleton h-12 w-64" />
      <div class="skeleton h-56 rounded-box" />
    </div>

    <div v-else-if="!canReview" class="rounded-box border border-base-300 bg-base-100 p-8 text-center">
      <Lock :size="32" class="mx-auto text-base-content/35" />
      <h1 class="mt-3 font-display text-2xl font-bold">{{ $t('mockExam.reviewUnavailable') }}</h1>
      <p class="mt-2 text-sm text-base-content/60">{{ $t('mockExam.reviewUnavailableDescription') }}</p>
      <NuxtLink to="/mock-exam" class="btn btn-primary btn-sm mt-5">{{ $t('mockExam.backToList') }}</NuxtLink>
    </div>

    <template v-else-if="moduleDefinition && moduleState">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <NuxtLink :to="`/mock-exam/${set.id}`" class="btn btn-ghost btn-sm -ml-3 gap-1">
            <ArrowLeft :size="16" />
            {{ $t('mockExam.backToResults') }}
          </NuxtLink>
          <div class="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">{{ set.title }}</div>
          <h1 class="mt-1 font-display text-3xl font-bold">{{ $t('mockExam.moduleReviewTitle', { skill: $t(`skill.${skill}`) }) }}</h1>
        </div>
        <div class="stats border border-base-300 bg-base-100 sm:ml-auto">
          <div class="stat px-5 py-3">
            <div class="stat-title text-xs">{{ $t('mockExam.moduleScore') }}</div>
            <div class="stat-value font-mono text-2xl">{{ scoreLabel }}</div>
          </div>
        </div>
      </header>

      <article v-for="definition in moduleDefinition.exercises" :key="definition.id" class="card border border-base-300 bg-base-100 ring-soft">
        <div class="card-body gap-5 p-5 sm:p-7">
          <div class="flex flex-wrap items-start gap-3 border-b border-base-300 pb-4">
            <span class="badge badge-primary badge-outline">Teil {{ definition.part }}</span>
            <div class="min-w-0 flex-1">
              <h2 class="font-display text-xl font-bold">{{ definition.title }}</h2>
              <p class="mt-1 text-xs text-base-content/50">{{ exerciseScore(definition.id) }}</p>
            </div>
          </div>

          <template v-if="skill === 'reading'">
            <template v-for="exercise in [readingExercise(definition.id)]" :key="exercise?.id ?? definition.id">
              <div v-if="exercise" class="space-y-5">
                <div class="whitespace-pre-line rounded-box bg-base-200/50 p-4 text-sm leading-6">{{ exercise.content }}</div>
                <ReviewQuestionList :questions="readingQuestions(exercise)" :answers="responseAnswers(definition.id)" />
              </div>
            </template>
          </template>

          <template v-else-if="skill === 'listening'">
            <template v-for="exercise in [listeningExercise(definition.id)]" :key="exercise?.id ?? definition.id">
              <div v-if="exercise" class="space-y-5">
                <div v-if="listeningTranscript(exercise)" class="rounded-box bg-base-200/50 p-4">
                  <div class="text-xs font-semibold uppercase tracking-wider text-base-content/45">{{ $t('mockExam.transcript') }}</div>
                  <div class="mt-2 whitespace-pre-line text-sm leading-6">{{ listeningTranscript(exercise) }}</div>
                </div>
                <ReviewQuestionList :questions="listeningQuestions(exercise)" :answers="responseAnswers(definition.id)" />
              </div>
            </template>
          </template>

          <template v-else-if="skill === 'writing'">
            <template v-for="exercise in [writingExercise(definition.id)]" :key="exercise?.id ?? definition.id">
              <div v-if="exercise" class="grid gap-5 lg:grid-cols-2">
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">{{ $t('mockExam.task') }}</h3>
                  <div class="mt-2 whitespace-pre-line rounded-box bg-base-200/50 p-4 text-sm leading-6">{{ exercise.task }}</div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">{{ $t('mockExam.yourResponse') }}</h3>
                  <div class="mt-2 min-h-32 whitespace-pre-line rounded-box border border-base-300 p-4 text-sm leading-6">
                    {{ response(definition.id)?.content || $t('mockExam.noResponse') }}
                  </div>
                  <p class="mt-2 text-xs text-base-content/50">
                    {{ $t('mockExam.wordCountResult', { count: response(definition.id)?.wordCount ?? 0 }) }}
                  </p>
                </section>
              </div>
            </template>
          </template>

          <template v-else-if="skill === 'speaking'">
            <template v-for="exercise in [speakingExercise(definition.id)]" :key="exercise?.id ?? definition.id">
              <div v-if="exercise" class="grid gap-5 lg:grid-cols-2">
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">{{ $t('mockExam.prompt') }}</h3>
                  <div class="mt-2 rounded-box bg-base-200/50 p-4">
                    <div class="font-semibold">{{ exercise.theme }}</div>
                    <ul class="mt-3 list-disc space-y-1 pl-5 text-sm">
                      <li v-for="item in speakingPrompts(exercise)" :key="item">{{ item }}</li>
                    </ul>
                  </div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">{{ $t('mockExam.transcripts') }}</h3>
                  <div class="mt-2 space-y-3 rounded-box border border-base-300 p-4 text-sm">
                    <div v-for="(text, key) in response(definition.id)?.transcripts ?? {}" :key="key">
                      <div class="text-xs font-semibold uppercase text-base-content/45">{{ key }}</div>
                      <div class="mt-1 whitespace-pre-line">{{ text || $t('mockExam.noResponse') }}</div>
                    </div>
                    <div v-if="!response(definition.id)?.transcripts">{{ $t('mockExam.noResponse') }}</div>
                  </div>
                </section>
              </div>
            </template>
          </template>
        </div>
      </article>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Lock } from 'lucide-vue-next'
import ReviewQuestionList from '~/components/mockExam/ReviewQuestionList.vue'
import { goetheA2MockExamSet1 } from '~/data/mockExam/goetheA2'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import type { ReadingExercise } from '~/utils/exercises/reading'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import type { SkillId } from '~/utils/labels'
import type { ReviewQuestion } from '~/utils/mockExam/review'

const route = useRoute()
const { t } = useI18n()
const requestedSetId = String(route.params['setId'] ?? '')
const requestedSkill = String(route.params['skill'] ?? '')
const skill = (['reading', 'listening', 'writing', 'speaking'].includes(requestedSkill) ? requestedSkill : 'reading') as SkillId
const validSkill = requestedSkill === skill
const { getSet, isInitialized: setsInitialized } = useMockExamSets()
const foundSet = computed(() => getSet(requestedSetId))
const set = computed(() => foundSet.value ?? goetheA2MockExamSet1)
const { state, isInitialized: examInitialized } = useMockExam(set)

const ready = computed(() => setsInitialized.value && examInitialized.value)
const canReview = computed(() => Boolean(foundSet.value && validSkill && state.value.finished))
const moduleDefinition = computed(() => set.value.modules.find(module => module.skill === skill))
const moduleState = computed(() => state.value.modules[skill])
const scoreLabel = computed(() => {
  const score = moduleState.value?.scoreFinal
  return `${score === null || score === undefined ? '—' : Number(score.toFixed(2))}/${moduleDefinition.value?.maxFinalPoints ?? 0}`
})

usePageMeta('Mock exam review', 'Review completed mock exam exercises')
useHead({ title: computed(() => `${t(`skill.${skill}`)} – ${t('mockExam.review')}`) })

function response(exerciseId: string) {
  return moduleState.value?.responses[exerciseId]
}

function responseAnswers(exerciseId: string): Record<string, number | undefined> {
  return response(exerciseId)?.answers ?? {}
}

function exerciseScore(exerciseId: string): string {
  const result = response(exerciseId)
  const score = result?.rawScore ?? result?.score
  const maximum = result?.total ?? moduleDefinition.value?.exercises.find(item => item.id === exerciseId)?.maxRawPoints ?? 0
  return t('mockExam.exerciseScore', { score: score ?? '—', maximum })
}

function readingExercise(id: string) {
  return set.value.content.reading.find(exercise => exercise.id === id)
}

function listeningExercise(id: string) {
  return set.value.content.listening.find(exercise => exercise.id === id)
}

function writingExercise(id: string) {
  return set.value.content.writing.find(exercise => exercise.id === id)
}

function speakingExercise(id: string) {
  return set.value.content.speaking.find(exercise => exercise.id === id)
}

function readingQuestions(exercise: ReadingExercise): ReviewQuestion[] {
  return (exercise.questions ?? []).map(question => ({
    id: question.id,
    prompt: question.question,
    options: question.options,
    correctIndex: question.correctAnswer,
    explanation: question.explanation,
  }))
}

function listeningQuestions(exercise: ListeningA2Exercise): ReviewQuestion[] {
  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    return exercise.items.map((item, index) => ({
      id: item.id ?? `${exercise.id}-item-${index}`,
      prompt: item.question,
      options: item.options,
      correctIndex: item.correctAnswer,
      explanation: item.explanation,
    }))
  }
  if (exercise.testingPart === 2) {
    return exercise.questions.map((question, index) => ({
      id: question.id ?? `${exercise.id}-question-${index}`,
      prompt: question.person,
      options: exercise.options,
      correctIndex: question.correctAnswer,
      explanation: question.explanation,
    }))
  }
  return exercise.questions.map((question, index) => ({
    id: question.id ?? `${exercise.id}-question-${index}`,
    prompt: question.statement,
    options: [t('mockExam.true'), t('mockExam.false')],
    correctIndex: question.correctAnswer ? 0 : 1,
    explanation: question.explanation,
  }))
}

function listeningTranscript(exercise: ListeningA2Exercise): string {
  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    return exercise.items.map((item, index) => `${index + 1}. ${item.transcript}`).join('\n\n')
  }
  return exercise.transcript
}

function speakingPrompts(exercise: SpeakingA2Topic): string[] {
  return exercise.testingPart === 1
    ? [...exercise.answerQuestions, ...exercise.askQuestions]
    : exercise.keywords
}
</script>
