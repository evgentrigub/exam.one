<template>
  <main class="mx-auto max-w-[1180px] space-y-5 p-6">
    <NuxtLink to="/exercises" class="btn btn-ghost btn-sm">Back to exercises</NuxtLink>
    <p v-if="error" role="alert" class="alert alert-error">{{ error }}</p>
    <template v-if="view && rules">
      <header>
        <h1 class="font-display text-3xl">{{ view.title }}</h1>
        <p>{{ pack.title }} · {{ timeRemaining }} remaining</p>
      </header>
      <section class="card border border-base-300 bg-base-100 p-6 space-y-4">
        <p class="whitespace-pre-wrap">{{ view.text }}</p>
        <button
          v-if="
            skill === 'listening' &&
            !submitted &&
            !view.audio &&
            !view.questions?.some(question => question.audio)
          "
          class="btn btn-outline btn-sm"
          :disabled="busy"
          @click="generateAudio"
        >
          Generate audio
        </button>
        <PackAudio
          v-if="view.audio"
          :src="view.audio"
          :limit="submitted ? undefined : rules.replays"
          :used="plays['shared'] ?? 0"
          @played="played('shared')"
        />
        <div v-for="question in view.questions ?? []" :key="question.id" class="space-y-2">
          <h2 class="font-semibold">{{ question.text }}</h2>
          <PackAudio
            v-if="question.audio"
            :src="question.audio"
            :limit="submitted ? undefined : rules.replays"
            :used="plays[question.id] ?? 0"
            @played="played(question.id)"
          />
          <label
            v-for="(option, index) in question.options"
            :key="index"
            class="flex items-center gap-3"
          >
            <input
              v-model="answers[question.id]"
              type="radio"
              class="radio radio-primary"
              :name="question.id"
              :value="index"
              :disabled="submitted || optionUsed(question.id, index)"
            />{{ option }}
          </label>
          <p v-if="submitted" class="text-sm">
            Correct answer: {{ question.options[question.correctAnswer] }}.
            {{ question.explanation }}
          </p>
        </div>
        <label v-for="field in view.fields ?? []" :key="field.id" class="block space-y-2">
          <span
            >{{ field.label }} · {{ field.minWords ?? 0 }}–{{ field.maxWords ?? '∞' }} words</span
          >
          <p>{{ field.prompt }}</p>
          <textarea
            v-model="answers[field.id]"
            class="textarea textarea-bordered w-full"
            rows="6"
            :disabled="submitted"
          />
        </label>
        <section
          v-for="(segment, segmentIndex) in view.segments ?? []"
          :key="segment.id"
          class="space-y-2"
        >
          <h2 class="font-semibold">{{ segment.label }}</h2>
          <p class="whitespace-pre-wrap">{{ segment.prompt }}</p>
          <button
            class="btn btn-outline btn-sm"
            :disabled="
              submitted ||
              segmentIndex !== activeSegment ||
              (!!recording && recording !== segment.id)
            "
            @click="recordSegment(segment.id)"
          >
            {{ recording === segment.id ? 'Stop recording' : 'Record' }}
          </button>
          <textarea
            v-model="answers[segment.id]"
            class="textarea textarea-bordered w-full"
            rows="4"
            :disabled="submitted"
            placeholder="Enter or edit your transcript"
          />
          <audio v-if="recordings[segment.id]" :src="recordings[segment.id]" controls />
          <button
            v-if="segmentIndex === activeSegment && segmentIndex < (view.segments?.length ?? 0) - 1"
            class="btn btn-ghost btn-sm"
            :disabled="!!recording"
            @click="nextSegment"
          >
            Next segment
          </button>
        </section>
        <button
          v-if="!submitted"
          class="btn btn-primary"
          :disabled="busy || !!recording"
          @click="submit"
        >
          {{ busy ? 'Saving…' : 'Submit' }}
        </button>
        <p v-if="submitted" class="alert">Attempt saved. {{ scoreText }}</p>
        <div v-if="review" class="space-y-2">
          <p>{{ review.summary }}</p>
          <p v-for="criterion in review.criteria" :key="criterion.id">
            {{ criterion.label }}: {{ criterion.points }}/{{ criterion.maxPoints }} —
            {{ criterion.comment }}
          </p>
        </div>
      </section>
    </template>
  </main>
</template>
<script setup lang="ts">
import type {
  AttemptDto,
  DraftDto,
  ExerciseDto,
  GenerateListeningAudioData,
} from '@exam-one/contracts'
import {
  getLivePack,
  objectiveScore,
  type SkillId,
  type ExerciseView,
  type PartRuntime,
  type CriterionReview,
} from '@exam-one/exam-packs'
function nextSegment() {
  activeSegment.value++
  void saveDraft()
}
const props = defineProps<{ packId: string; skill: SkillId; exerciseId: string }>()
const pack = getLivePack(props.packId)
const requestPackId = props.packId
const { apiFetch, aiFetch } = usePackRequest(requestPackId)
const view = ref<ExerciseView | null>(null)
const rules = ref<PartRuntime | null>(null)
const answers = ref<Record<string, string | number>>({})
const payload = ref<Record<string, unknown>>({})
const submitted = ref(false)
const busy = ref(false)
const error = ref('')
const scoreText = ref('')
const review = ref<CriterionReview | null>(null)
const recording = ref('')
const recordings = ref<Record<string, string>>({})
const activeSegment = ref(0)
const plays = ref<Record<string, number>>({})
const startedAt = ref(Date.now())
const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | undefined
const timeRemaining = computed(() => {
  const seconds = Math.max(
    0,
    Math.ceil(((rules.value?.minutes ?? 0) * 60_000 - (now.value - startedAt.value)) / 1000)
  )
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
})
function played(id: string) {
  plays.value[id] = (plays.value[id] ?? 0) + 1
  void saveDraft()
}
function optionUsed(id: string, option: number) {
  return (
    view.value?.format === 'matching' &&
    rules.value?.reuseOptions === false &&
    Object.entries(answers.value).some(([key, value]) => key !== id && value === option)
  )
}
let recorder: MediaRecorder | undefined
let stream: MediaStream | undefined
let disposed = false
let loaded = false
let saveChain = Promise.resolve()
const draftPath = `/drafts/${props.skill.toUpperCase()}/${encodeURIComponent(props.exerciseId)}`
function saveDraft() {
  if (!loaded || submitted.value) return saveChain
  const copy = {
    answers: { ...answers.value },
    plays: { ...plays.value },
    startedAt: startedAt.value,
    activeSegment: activeSegment.value,
  }
  saveChain = saveChain
    .then(async () => {
      await apiFetch(draftPath, { packId: requestPackId, method: 'PUT', body: { payload: copy } })
    })
    .catch(e => {
      if (!disposed) error.value = String(e)
    })
  return saveChain
}
watch(
  answers,
  () => {
    void saveDraft()
  },
  { deep: true }
)
onBeforeUnmount(() => {
  void saveDraft()
  disposed = true
  if (recorder?.state === 'recording') recorder.stop()
  stream?.getTracks().forEach(t => t.stop())
  clearInterval(clock)
  Object.values(recordings.value).forEach(url => URL.revokeObjectURL(url))
})
async function recordSegment(id: string) {
  if (recording.value === id) {
    recorder?.stop()
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    recorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []
    recorder.ondataavailable = e => {
      chunks.push(e.data)
    }
    recorder.onstop = async () => {
      recording.value = ''
      stream?.getTracks().forEach(t => t.stop())
      if (disposed) return
      const form = new FormData()
      const blob = new Blob(chunks, { type: recorder?.mimeType ?? 'audio/webm' })
      if (recordings.value[id]) URL.revokeObjectURL(recordings.value[id])
      recordings.value[id] = URL.createObjectURL(blob)
      form.append('file', blob, 'recording.webm')
      try {
        const response = await aiFetch<{ transcript: string }>('/stt/transcribe', {
          packId: requestPackId,
          method: 'POST',
          body: form,
        })
        if (disposed) return
        if (response.data) answers.value[id] = response.data.transcript
        else error.value = response.error ?? 'Enter your transcript manually.'
      } catch (e) {
        if (!disposed) error.value = String(e)
      }
    }
    recorder.start()
    recording.value = id
  } catch (e) {
    error.value = String(e)
  }
}
async function generateAudio() {
  busy.value = true
  try {
    const response = await aiFetch<GenerateListeningAudioData>('/tts/generate-listening-audio', {
      packId: requestPackId,
      method: 'POST',
      body: { exercise: payload.value },
    })
    if (!response.data) throw new Error(response.error ?? 'Audio generation unavailable')
    const row = await apiFetch<ExerciseDto>(
      `/exercises/${encodeURIComponent(props.exerciseId)}/audio`,
      { packId: requestPackId, method: 'PUT', body: { audio: response.data.audio } }
    )
    if (disposed) return
    payload.value = row.payload as Record<string, unknown>
    const part = pack.structure
      .find(module => module.id === props.skill)
      ?.parts.find(part => part.n === payload.value['testingPart'])
    if (part?.adapter) view.value = part.adapter.project(payload.value)
  } catch (e) {
    if (!disposed) error.value = String(e)
  } finally {
    if (!disposed) busy.value = false
  }
}
async function submit() {
  if (!view.value || !rules.value) return
  busy.value = true
  error.value = ''
  try {
    await saveDraft()
    let result: { score?: number; maxScore?: number; percentage?: number; review?: unknown } = {}
    if (view.value.questions) result = objectiveScore(view.value, rules.value, answers.value)
    else {
      const response = await aiFetch<CriterionReview>(
        props.skill === 'speaking' ? '/llm/review-speaking' : '/llm/review',
        {
          packId: requestPackId,
          method: 'POST',
          body: {
            topic: payload.value,
            answers: answers.value,
            prompt: 'pack default',
            ...(props.skill === 'writing' ? { userContent: JSON.stringify(answers.value) } : {}),
          },
        }
      )
      if (response.data) {
        if (!disposed) review.value = response.data
        const factor = rules.value.multiplier ?? 1
        result = {
          score: response.data.totalPoints * factor,
          maxScore: response.data.maxPoints * factor,
          percentage: Math.round((response.data.totalPoints / response.data.maxPoints) * 100),
          review: response.data,
        }
      } else if (!disposed)
        error.value = response.error ?? 'AI review unavailable; your attempt will still be saved.'
    }
    const saved = await apiFetch<AttemptDto>('/attempts', {
      packId: requestPackId,
      method: 'POST',
      body: {
        skill: props.skill.toUpperCase(),
        exerciseExternalId: props.exerciseId,
        answers: answers.value,
        result,
      },
    })
    await apiFetch(draftPath, { packId: requestPackId, method: 'DELETE' })
    if (!disposed) {
      submitted.value = true
      scoreText.value =
        saved.result?.score != null ? `${saved.result.score}/${saved.result.maxScore}` : ''
    }
  } catch (e) {
    if (!disposed) error.value = String(e)
  } finally {
    if (!disposed) busy.value = false
  }
}
onMounted(async () => {
  try {
    const rows = await apiFetch<ExerciseDto[]>('/exercises', {
      packId: requestPackId,
      query: { skill: props.skill.toUpperCase() },
    })
    const row = rows.find(r => r.externalId === props.exerciseId)
    if (!row) throw new Error('Exercise not found in this pack')
    if (disposed) return
    payload.value = row.payload as Record<string, unknown>
    const part = pack.structure
      .find(m => m.id === props.skill)
      ?.parts.find(p => p.n === payload.value['testingPart'])
    if (!part?.adapter || !part.runtime) throw new Error('Unsupported exercise format')
    view.value = part.adapter.project(row.payload)
    rules.value = part.runtime
    const draft = await apiFetch<DraftDto | null>(draftPath, { packId: requestPackId })
    if (disposed) return
    const saved = draft?.payload as
      | {
          answers?: Record<string, string | number>
          plays?: Record<string, number>
          startedAt?: number
          activeSegment?: number
        }
      | undefined
    answers.value = saved?.answers ?? {}
    plays.value = saved?.plays ?? {}
    startedAt.value = saved?.startedAt ?? Date.now()
    activeSegment.value = saved?.activeSegment ?? 0
    clock = setInterval(() => {
      if (!submitted.value) now.value = Date.now()
    }, 1000)
    loaded = true
  } catch (e) {
    if (!disposed) error.value = String(e)
  }
})
</script>
