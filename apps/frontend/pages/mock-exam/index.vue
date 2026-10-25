<template>
  <div class="mx-auto max-w-[1180px] space-y-6 px-4 py-8 sm:px-6">
    <div>
      <div
        class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"
      >
        <FileCheck2 :size="16" />
        {{ $t('mockExam.fullSimulation') }}
      </div>
      <h1 class="mt-2 font-display text-3xl font-bold">{{ $t('mockExam.title') }}</h1>
      <p v-if="pack.createMockSet" class="mt-1 text-sm text-base-content/60">
        {{ $t('mockExam.listDescription', { exam: pack.title }) }}
      </p>
    </div>

    <p v-if="!pack.createMockSet" class="alert">{{ $t('mockExam.notAvailableForPack') }}</p>
    <ClientOnly v-else>
      <p v-if="generationError" class="alert alert-error mb-5 text-sm">{{ generationError }}</p>
      <div class="grid gap-5 lg:grid-cols-2">
        <MockExamSetCard v-for="set in sets" :key="set.id" :set="set" @delete="deleteSet" />

        <article class="card min-h-72 border border-dashed border-primary/40 bg-primary/5">
          <div class="card-body items-center justify-center text-center">
            <div class="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles :size="24" />
            </div>
            <h2 class="font-display text-xl font-bold">
              {{ $t('mockExam.generateSetNumber', { number: nextSetNumber }) }}
            </h2>
            <p class="max-w-sm text-sm text-base-content/60">
              {{ $t('mockExam.generateSetDescription', { exam: pack.title }) }}
            </p>
            <button
              class="btn btn-primary btn-sm mt-2"
              :disabled="isGenerating"
              @click="preflightOpen = true"
            >
              <Plus :size="16" />
              {{ $t('mockExam.generateMockSet') }}
            </button>
          </div>
        </article>
      </div>

      <MockGenerationPreflightModal
        v-if="preflightOpen"
        :set-number="nextSetNumber"
        @close="preflightOpen = false"
        @generate="generate"
      />

      <template #fallback>
        <div class="grid gap-5 lg:grid-cols-2">
          <div class="skeleton h-72 rounded-box" />
          <div class="skeleton h-72 rounded-box" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { FileCheck2, Plus, Sparkles } from 'lucide-vue-next'

const { t } = useI18n()

usePageMeta('mockExam.title', 'pageMeta.mockExamsSubtitle')
useHead({ title: () => t('mockExam.title') })

const { pack } = useActivePack()
const preflightOpen = ref(false)
const { sets, nextSetNumber, deleteSet, reload } = useMockExamSets()
const { isGenerating, startGeneration } = useBackgroundMockGeneration()
const center = useJobCenter()
const settings = useSettingsStore()
const generationError = ref<string | null>(null)
watch(
  () =>
    center.jobs.value
      .filter(
        job =>
          job.type === 'MOCK_EXAM_SET' &&
          job.packId === settings.packId &&
          job.status === 'COMPLETED'
      )
      .map(job => job.id)
      .join(','),
  () => {
    void reload()
  }
)

async function generate(): Promise<void> {
  const setNumber = nextSetNumber.value
  try {
    if (await startGeneration(setNumber)) {
      preflightOpen.value = false
      generationError.value = null
    }
  } catch (error) {
    // Close the modal so the server's reason (e.g. set exists, too many jobs) is visible.
    preflightOpen.value = false
    generationError.value = error instanceof Error ? error.message : t('generation.mockInterrupted')
  }
}
</script>
