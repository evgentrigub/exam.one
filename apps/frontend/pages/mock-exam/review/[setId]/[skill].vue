<template>
  <div class="mx-auto max-w-[980px] space-y-6 px-4 py-8 sm:px-6">
    <div v-if="!ready" class="space-y-4">
      <div class="skeleton h-12 w-64" />
      <div class="skeleton h-56 rounded-box" />
    </div>

    <div
      v-else-if="!canReview"
      class="rounded-box border border-base-300 bg-base-100 p-8 text-center"
    >
      <Lock :size="32" class="mx-auto text-base-content/35" />
      <h1 class="mt-3 font-display text-2xl font-bold">{{ $t('mockExam.reviewUnavailable') }}</h1>
      <p class="mt-2 text-sm text-base-content/60">
        {{ $t('mockExam.reviewUnavailableDescription') }}
      </p>
      <NuxtLink to="/mock-exam" class="btn btn-primary btn-sm mt-5">{{
        $t('mockExam.backToList')
      }}</NuxtLink>
    </div>

    <template v-else-if="moduleDefinition && moduleState">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <NuxtLink :to="`/mock-exam/${set.id}`" class="btn btn-ghost btn-sm -ml-3 gap-1">
            <ArrowLeft :size="16" />
            {{ $t('mockExam.backToResults') }}
          </NuxtLink>
          <div class="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {{ set.title }}
          </div>
          <h1 class="mt-1 font-display text-3xl font-bold">
            {{ $t('mockExam.moduleReviewTitle', { skill: $t(`skill.${skill}`) }) }}
          </h1>
        </div>
        <div class="stats border border-base-300 bg-base-100 sm:ml-auto">
          <div class="stat px-5 py-3">
            <div class="stat-title text-xs">{{ $t('mockExam.moduleScore') }}</div>
            <div class="stat-value font-mono text-2xl">{{ scoreLabel }}</div>
          </div>
        </div>
      </header>

      <article
        v-for="definition in moduleDefinition.exercises"
        :key="definition.id"
        class="card border border-base-300 bg-base-100 ring-soft"
      >
        <div class="card-body gap-5 p-5 sm:p-7">
          <div class="flex flex-wrap items-start gap-3 border-b border-base-300 pb-4">
            <span class="badge badge-primary badge-outline">{{ labelFor(skill, definition.part) }}</span>
            <div class="min-w-0 flex-1">
              <h2 class="font-display text-xl font-bold">{{ definition.title }}</h2>
              <p class="mt-1 text-xs text-base-content/50">{{ exerciseScore(definition.id) }}</p>
            </div>
          </div>

          <template v-if="skill === 'reading'">
            <template
              v-for="exercise in [readingExercise(definition.id)]"
              :key="exercise?.id ?? definition.id"
            >
              <div v-if="exercise" class="space-y-5">
                <div class="rounded-box bg-base-200/50 p-4 text-sm leading-6">
                  <GapFillText
                    v-if="isGapFill('reading', exercise.testingPart)"
                    :content="exercise.content"
                    :questions="exercise.questions ?? []"
                    :answers="responseAnswers(definition.id)"
                    revealed
                  />
                  <div v-else class="whitespace-pre-line">{{ exercise.content }}</div>
                </div>
                <ReviewQuestionList
                  :questions="readingQuestions(exercise)"
                  :answers="responseAnswers(definition.id)"
                />
              </div>
            </template>
          </template>

          <template v-else-if="skill === 'listening'">
            <template
              v-for="exercise in [listeningExercise(definition.id)]"
              :key="exercise?.id ?? definition.id"
            >
              <div v-if="exercise" class="space-y-5">
                <div v-if="listeningTranscript(exercise)" class="rounded-box bg-base-200/50 p-4">
                  <div class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    {{ $t('mockExam.transcript') }}
                  </div>
                  <div class="mt-2 whitespace-pre-line text-sm leading-6">
                    {{ listeningTranscript(exercise) }}
                  </div>
                </div>
                <div
                  v-if="listeningNotes(exercise)"
                  class="rounded-box border border-base-300 p-4 text-sm leading-6"
                >
                  <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    {{ $t('gapFill.notes') }}
                  </div>
                  <GapFillText
                    :content="listeningNotes(exercise)"
                    :questions="notesQuestions(exercise)"
                    :answers="responseAnswers(definition.id)"
                    revealed
                  />
                </div>
                <ReviewQuestionList
                  :questions="listeningQuestions(exercise)"
                  :answers="responseAnswers(definition.id)"
                />
              </div>
            </template>
          </template>

          <template v-else-if="skill === 'writing'">
            <template
              v-for="exercise in [writingExercise(definition.id)]"
              :key="exercise?.id ?? definition.id"
            >
              <div v-if="exercise" class="grid gap-5 lg:grid-cols-2">
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    {{ $t('mockExam.task') }}
                  </h3>
                  <div
                    class="mt-2 whitespace-pre-line rounded-box bg-base-200/50 p-4 text-sm leading-6"
                  >
                    {{ exercise.task }}
                  </div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    {{ $t('mockExam.yourResponse') }}
                  </h3>
                  <div
                    class="mt-2 min-h-32 whitespace-pre-line rounded-box border border-base-300 p-4 text-sm leading-6"
                  >
                    {{ writingResponseText(exercise, definition.id) || $t('mockExam.noResponse') }}
                  </div>
                  <p v-if="!isFormFillTopic(exercise)" class="mt-2 text-xs text-base-content/50">
                    {{
                      $t('mockExam.wordCountResult', {
                        count: response(definition.id)?.wordCount ?? 0,
                      })
                    }}
                  </p>
                </section>
                <section class="border-t border-base-300 pt-5 lg:col-span-2">
                  <div class="mb-4 flex items-center gap-2">
                    <Sparkles :size="17" class="text-primary" />
                    <h3 class="text-sm font-semibold">{{ $t('mockExam.detailedAiReview') }}</h3>
                  </div>
                  <FormFillReviewDetails
                    v-if="response(definition.id)?.writingReview && isFormFillTopic(exercise)"
                    :review="response(definition.id)!.writingReview!"
                    :entries="formEntries(exercise, definition.id)"
                    :teil="definition.part"
                  />
                  <WritingReviewDetails
                    v-else-if="response(definition.id)?.writingReview"
                    :review="response(definition.id)!.writingReview!"
                    :teil="definition.part"
                  />
                  <div
                    v-else-if="isDeterministicWritingZero(definition.id, definition.part)"
                    class="alert alert-info items-start"
                  >
                    <Info :size="19" class="mt-0.5 shrink-0" />
                    <div>
                      <div class="font-semibold">{{ $t('mockExam.minimumWordRuleTitle') }}</div>
                      <p class="mt-1 text-sm">
                        {{
                          $t('mockExam.minimumWordRuleDescription', {
                            count: response(definition.id)?.wordCount ?? 0,
                            minimum: writingMinimumWords(definition.part),
                          })
                        }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-else
                    class="alert items-start"
                    :class="missingReviewAlertClass(definition.id)"
                  >
                    <CircleAlert :size="19" class="mt-0.5 shrink-0" />
                    <div>
                      <div class="font-semibold">{{ missingReviewTitle(definition.id) }}</div>
                      <p v-if="response(definition.id)?.error" class="mt-1 text-sm">
                        {{ response(definition.id)?.error }}
                      </p>
                      <p class="mt-1 text-sm">{{ missingReviewDescription(definition.id) }}</p>
                    </div>
                  </div>
                </section>
              </div>
            </template>
          </template>

          <template v-else-if="skill === 'speaking'">
            <template
              v-for="exercise in [speakingExercise(definition.id)]"
              :key="exercise?.id ?? definition.id"
            >
              <div v-if="exercise" class="grid gap-5 lg:grid-cols-2">
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    {{ $t('mockExam.prompt') }}
                  </h3>
                  <div class="mt-2 rounded-box bg-base-200/50 p-4">
                    <div class="font-semibold">{{ exercise.theme }}</div>
                    <ul class="mt-3 list-disc space-y-1 pl-5 text-sm">
                      <li v-for="item in speakingPrompts(exercise)" :key="item">{{ item }}</li>
                    </ul>
                  </div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    {{ $t('mockExam.transcripts') }}
                  </h3>
                  <div class="mt-2 space-y-3 rounded-box border border-base-300 p-4 text-sm">
                    <div
                      v-for="(text, key) in response(definition.id)?.transcripts ?? {}"
                      :key="key"
                    >
                      <div class="text-xs font-semibold uppercase text-base-content/45">
                        {{ segmentLabel(definition.part, String(key)) }}
                      </div>
                      <div class="mt-1 whitespace-pre-line">
                        {{ text || $t('mockExam.noResponse') }}
                      </div>
                    </div>
                    <div v-if="!response(definition.id)?.transcripts">
                      {{ $t('mockExam.noResponse') }}
                    </div>
                  </div>
                </section>
                <section class="border-t border-base-300 pt-5 lg:col-span-2">
                  <div class="mb-4 flex items-center gap-2">
                    <Sparkles :size="17" class="text-primary" />
                    <h3 class="text-sm font-semibold">{{ $t('mockExam.detailedAiReview') }}</h3>
                  </div>
                  <SpeakingReviewDetails
                    v-if="response(definition.id)?.speakingReview"
                    :review="response(definition.id)!.speakingReview!"
                  />
                  <div
                    v-else
                    class="alert items-start"
                    :class="missingReviewAlertClass(definition.id)"
                  >
                    <CircleAlert :size="19" class="mt-0.5 shrink-0" />
                    <div>
                      <div class="font-semibold">{{ missingReviewTitle(definition.id) }}</div>
                      <p v-if="response(definition.id)?.error" class="mt-1 text-sm">
                        {{ response(definition.id)?.error }}
                      </p>
                      <p class="mt-1 text-sm">{{ missingReviewDescription(definition.id) }}</p>
                    </div>
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
import type { GapQuestion, ObjectiveAnswers } from '~/utils/gapFill'
import { ArrowLeft, CircleAlert, Info, Lock, Sparkles } from 'lucide-vue-next'
import ReviewQuestionList from '~/components/mockExam/ReviewQuestionList.vue'
import GapFillText from '~/components/gapFill/GapFillText.vue'
import SpeakingReviewDetails from '~/components/speaking/SpeakingReviewDetails.vue'
import WritingReviewDetails from '~/components/writing/WritingReviewDetails.vue'
import FormFillReviewDetails from '~/components/writing/FormFillReviewDetails.vue'
import { scaleScore, type MockExamSet } from '@exam-one/exam-packs'
import { createUnavailableMockSet } from '~/utils/mockExam/unavailableSet'
import { writingZeroThreshold } from '~/utils/mockExam/writingRules'
import type { WritingExercise } from '~/utils/types'
import {
  blankRows,
  displayWritingContent,
  isFormFillTopic,
  parseFormValues,
} from '~/utils/writing/formFill'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import {
  isSharedChoiceListening,
  isSharedMatchingListening,
  isStatementListening,
  usesItemAudio,
  type NotesListening,
  type SharedChoiceListening,
} from '~/utils/listening/audioUrls'
import type { ReadingExercise } from '~/utils/exercises/reading'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import type { SkillId } from '~/utils/labels'
import type { ReviewQuestion } from '~/utils/mockExam/review'

const route = useRoute()
const { t } = useI18n()
const requestedSetId = String(route.params['setId'] ?? '')
const requestedSkill = String(route.params['skill'] ?? '')
const skill = (
  ['reading', 'listening', 'writing', 'speaking'].includes(requestedSkill)
    ? requestedSkill
    : 'reading'
) as SkillId
const validSkill = requestedSkill === skill
const { getSet, isInitialized: setsInitialized } = useMockExamSets()
const { pack, labelFor } = useActivePack()
const foundSet = computed(() => getSet(requestedSetId))
const set = computed(
  (): MockExamSet => foundSet.value ?? pack.value.bundledMockSet ?? createUnavailableMockSet(t)
)
const { state, isInitialized: examInitialized } = useMockExam(set)

const ready = computed(() => setsInitialized.value && examInitialized.value)
const canReview = computed(() => Boolean(foundSet.value && validSkill && state.value.finished))
const moduleDefinition = computed(() => set.value.modules.find(module => module.skill === skill))
const moduleState = computed(() => state.value.modules[skill])
const scoreLabel = computed(() => {
  const score = moduleState.value?.scoreFinal
  const scale = set.value.rules?.scale
  const definition = moduleDefinition.value
  // A scale converts raw marks: show the skill's scale score with its raw marks.
  if (scale && definition && typeof score === 'number' && moduleState.value?.grading !== 'pending') {
    const value = scaleScore(scale, skill, score, definition.maxRawPoints)
    const shown = value < scale.min ? t('mockExam.scale.below', { min: scale.min }) : Math.round(value)
    return `${shown} · ${t('mockExam.scale.raw', { score: Number(score.toFixed(2)), max: definition.maxRawPoints })}`
  }
  return `${score === null || score === undefined ? '—' : Number(score.toFixed(2))}/${moduleDefinition.value?.maxFinalPoints ?? 0}`
})

usePageMeta('pageMeta.mockExamReviewTitle', 'pageMeta.mockExamReviewSubtitle')
useHead({ title: () => `${t(`skill.${skill}`)} – ${t('mockExam.review')}` })

function response(exerciseId: string) {
  return moduleState.value?.responses[exerciseId]
}

function responseAnswers(exerciseId: string): ObjectiveAnswers {
  return response(exerciseId)?.answers ?? {}
}

function exerciseScore(exerciseId: string): string {
  const result = response(exerciseId)
  const score = result?.rawScore ?? result?.score
  const maximum =
    result?.total ??
    moduleDefinition.value?.exercises.find(item => item.id === exerciseId)?.maxRawPoints ??
    0
  return t('mockExam.exerciseScore', { score: score ?? '—', maximum })
}

function writingMinimumWords(part: number): number {
  return writingZeroThreshold(pack.value, part) ?? 0
}

function isDeterministicWritingZero(exerciseId: string, part: number): boolean {
  const result = response(exerciseId)
  const threshold = writingZeroThreshold(pack.value, part)
  return threshold !== undefined && result?.rawScore === 0 && (result.wordCount ?? 0) < threshold
}

/** A form is stored as its entries; show them as readable "Label: entry" lines. */
function writingResponseText(exercise: WritingExercise, exerciseId: string): string {
  const content = response(exerciseId)?.content
  return content ? displayWritingContent(exercise, content) : ''
}

function formEntries(exercise: WritingExercise, exerciseId: string) {
  const values = parseFormValues(response(exerciseId)?.content)
  return blankRows(exercise).map(row => ({
    id: row.field,
    label: row.label,
    answer: values[row.field] ?? '',
  }))
}

/** A transcript heading: the part's own segment label, or the stored key. */
function segmentLabel(part: number, key: string): string {
  return (
    pack.value.structure
      .find(module => module.id === 'speaking')
      ?.parts.find(item => item.n === part)
      ?.runtime?.segments?.find(segment => segment.id === key)?.label ?? key
  )
}

function missingReviewTitle(exerciseId: string): string {
  const result = response(exerciseId)
  if (result?.error) return t('mockExam.aiReviewUnavailable')
  if (result?.grading === 'pending') return t('mockExam.aiReviewPending')
  return t('mockExam.detailedReviewNotStored')
}

function missingReviewDescription(exerciseId: string): string {
  const result = response(exerciseId)
  if (result?.error) return t('mockExam.aiReviewFailedDescription')
  if (result?.grading === 'pending') return t('mockExam.aiReviewInProgressDescription')
  return t('mockExam.detailedReviewNotStoredDescription')
}

function missingReviewAlertClass(exerciseId: string): string {
  return response(exerciseId)?.error ? 'alert-warning' : 'bg-base-200/60'
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

/** Whether a part of this pack is answered by typing into gaps. */
function isGapFill(module: SkillId, part: number | undefined): boolean {
  return (
    pack.value.structure.find(item => item.id === module)?.parts.find(item => item.n === part)
      ?.itemFormat === 'gap-fill'
  )
}

function readingQuestions(exercise: ReadingExercise): ReviewQuestion[] {
  return (exercise.questions ?? []).map(question => ({
    id: question.id,
    prompt: question.question,
    options: question.options ?? [],
    correctIndex: question.correctAnswer ?? -1,
    ...(question.accepted ? { accepted: question.accepted } : {}),
    explanation: question.explanation,
  }))
}

/** The notes' gaps, in the shape the gapped text reads. */
function notesQuestions(exercise: ListeningA2Exercise): GapQuestion[] {
  return listeningQuestions(exercise).map(question => ({
    id: question.id,
    question: question.prompt,
    accepted: question.accepted ?? [],
  }))
}

/** The page of notes a gap-fill listening part completes, or an empty string. */
function listeningNotes(exercise: ListeningA2Exercise): string {
  if (!isGapFill('listening', exercise.testingPart)) return ''
  return (exercise as unknown as NotesListening).content ?? ''
}

function listeningQuestions(exercise: ListeningA2Exercise): ReviewQuestion[] {
  // The part's format picks the interaction; the payload shape only picks the audio source.
  if (isGapFill('listening', exercise.testingPart)) {
    const notes = exercise as unknown as NotesListening
    return (notes.questions ?? []).map((question, index) => ({
      id: question.id ?? `${exercise.id}-q${index}`,
      prompt: question.question,
      options: [],
      correctIndex: -1,
      accepted: question.accepted ?? [],
      explanation: question.explanation ?? '',
    }))
  }
  if (isSharedChoiceListening(exercise)) {
    const shared = exercise as unknown as SharedChoiceListening
    return shared.questions.map((question, index) => ({
      id: question.id ?? `${shared.id}-q${index}`,
      prompt: question.question,
      options: question.options,
      correctIndex: question.correctAnswer,
      explanation: question.explanation ?? '',
    }))
  }
  if (usesItemAudio(exercise)) {
    return exercise.items.map((item, index) => ({
      id: item.id ?? `${exercise.id}-item-${index}`,
      prompt: item.question,
      options: item.options,
      correctIndex: item.correctAnswer,
      explanation: item.explanation,
    }))
  }
  if (isSharedMatchingListening(exercise)) {
    return exercise.questions.map((question, index) => ({
      id: question.id ?? `${exercise.id}-question-${index}`,
      prompt: question.person,
      options: exercise.options,
      correctIndex: question.correctAnswer,
      explanation: question.explanation,
    }))
  }
  if (!isStatementListening(exercise)) return []
  return exercise.questions.map((question, index) => ({
    id: question.id ?? `${exercise.id}-question-${index}`,
    prompt: question.statement,
    options: [t('mockExam.true'), t('mockExam.false')],
    correctIndex: question.correctAnswer ? 0 : 1,
    explanation: question.explanation,
  }))
}

function listeningTranscript(exercise: ListeningA2Exercise): string {
  if (usesItemAudio(exercise)) {
    return exercise.items.map((item, index) => `${index + 1}. ${item.transcript}`).join('\n\n')
  }
  return exercise.transcript
}

function speakingPrompts(exercise: SpeakingA2Topic): string[] {
  if ('answerQuestions' in exercise) return [...exercise.answerQuestions, ...exercise.askQuestions]
  return 'keywords' in exercise
    ? exercise.keywords
    : exercise.cards.map(card => (card.topic ? `${card.topic} · ${card.cue}` : card.cue))
}
</script>
