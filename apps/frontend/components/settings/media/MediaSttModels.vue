<template>
  <SetCard>
    <SetHead :title="$t('settings.sttModelsTitle')" :desc="$t('settings.sttModelsShared')" />
    <p v-if="!state" class="text-sm text-base-content/60">{{ $t('settings.mediaCalculating') }}</p>
    <p v-else-if="!state.online || !state.manageable" class="alert alert-warning mb-4 text-sm">
      {{ $t('settings.sttModelsUnavailable') }}
    </p>
    <p v-if="error" role="alert" class="mb-4 text-sm text-error">{{ error }}</p>
    <div v-if="state?.manageable" class="flex flex-col gap-5">
      <section
        v-for="model in modelCards"
        :key="model.id"
        :aria-labelledby="`stt-model-${model.id}`"
        class="rounded-field border border-base-300 p-4"
      >
        <h3 :id="`stt-model-${model.id}`" class="mb-3 flex items-center gap-2 font-medium">
          <MediaLangChip
            v-if="model.cardLanguages.length === 1"
            :lang="model.cardLanguages[0]!.id"
          />
          {{ model.cardTitle }}
        </h3>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <strong class="text-sm">{{ model.name }}</strong>
            <span v-if="model.selectedCardLanguages.length" class="badge badge-primary badge-sm">{{
              model.selectionLabel
            }}</span>
            <span v-if="model.languages.length > 1" class="badge badge-ghost badge-sm">{{
              $t('settings.sttModelsMultilingual')
            }}</span>
          </div>
          <p class="my-2 text-xs text-base-content/60">
            {{ $t('settings.sttModelsDownloadSize', { size: fmtBytes(model.downloadBytes) }) }}
            · {{ $t('settings.sttModelsDiskSize', { size: fmtBytes(model.installedBytes) }) }} ·
            {{ model.license }}
          </p>
          <p
            v-if="!model.installed && model.selectedCardLanguages.length"
            class="mb-2 text-sm text-warning"
          >
            {{ $t('settings.sttModelsMissing') }}
          </p>
          <p v-if="model.progress?.error" class="mb-2 text-sm text-error">
            {{ model.progress.error }}
          </p>
          <div v-if="model.progress?.state === 'downloading'" class="mb-2">
            <progress
              class="progress progress-primary w-full"
              :value="model.progress.percent"
              max="100"
              :aria-label="$t('settings.sttModelsDownload')"
            />
            <span class="text-xs">{{ model.progress.percent }}%</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-if="model.progress?.state === 'downloading'"
              class="btn btn-sm"
              :disabled="busy || selecting"
              @click="cancel(model.id)"
            >
              {{ $t('settings.sttModelsCancel') }}
            </button>
            <button
              v-else-if="!model.installed && model.downloadable !== false"
              class="btn btn-primary btn-sm"
              :disabled="busy || selecting"
              @click="download(model.id)"
            >
              {{ $t('settings.sttModelsDownload') }}
            </button>
            <template v-else>
              <button
                v-if="model.unselectedLanguages.length"
                class="btn btn-primary btn-sm"
                :disabled="busy || selecting"
                @click="preferLanguages(model.unselectedLanguages, model.id)"
              >
                {{
                  $t(
                    model.cardLanguages.length > 1
                      ? 'settings.sttModelsUseLanguages'
                      : 'settings.sttModelsUse'
                  )
                }}
              </button>
              <button
                class="btn btn-ghost btn-sm text-error"
                :disabled="busy || selecting"
                @click="requestRemove(model.id)"
              >
                {{ $t('settings.sttModelsRemove') }}
              </button>
            </template>
          </div>
        </div>
      </section>
      <p class="text-xs text-base-content/60">{{ $t('settings.sttModelsFootprint') }}</p>
    </div>
    <dialog ref="confirmation" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">{{ $t('settings.sttModelsRemove') }}</h3>
        <p class="py-4">{{ $t('settings.sttModelsRemoveWarning') }}</p>
        <div class="modal-action">
          <button class="btn" @click="confirmation?.close()">
            {{ $t('settings.sttModelsCancel') }}
          </button>
          <button class="btn btn-error" @click="confirmRemove">
            {{ $t('settings.sttModelsRemove') }}
          </button>
        </div>
      </div>
    </dialog>
  </SetCard>
</template>

<script setup lang="ts">
import { MEDIA_LANGUAGES } from '~/data/account/mediaLanguages'
import { useSttModels } from '~/composables/useSttModels'
import { fmtBytes } from '~/utils/fmtBytes'

const { state, error, busy, load, download, cancel, remove, prefer } = useSttModels()
const { t } = useI18n()
const selecting = ref(false)
const modelCards = computed(() =>
  (state.value?.models ?? [])
    .filter(model => model.downloadable !== false)
    .map(model => {
      const cardLanguages = MEDIA_LANGUAGES.filter(
        language =>
          (model.recommendedLanguages ?? model.languages).includes(language.id) ||
          model.selectedLanguages.includes(language.id)
      )
      const selectedCardLanguages = cardLanguages.filter(language =>
        model.selectedLanguages.includes(language.id)
      )
      const languageNames = cardLanguages.map(language => t(language.labelKey)).join(', ')
      return {
        ...model,
        cardLanguages,
        selectedCardLanguages,
        unselectedLanguages: cardLanguages
          .filter(language => !model.selectedLanguages.includes(language.id))
          .map(language => language.id),
        cardTitle:
          cardLanguages.length === 1
            ? languageNames
            : t('settings.sttModelsLanguages', { languages: languageNames }),
        selectionLabel:
          selectedCardLanguages.length === cardLanguages.length
            ? t('settings.sttModelsSelected')
            : t('settings.sttModelsSelectedFor', {
                languages: selectedCardLanguages.map(language => t(language.labelKey)).join(', '),
              }),
      }
    })
    .filter(model => model.cardLanguages.length)
)
async function preferLanguages(languages: string[], modelId: string): Promise<void> {
  selecting.value = true
  try {
    for (const language of languages) await prefer(language, modelId)
  } finally {
    selecting.value = false
  }
}
const confirmation = ref<HTMLDialogElement | null>(null)
const pendingRemoval = ref('')
function requestRemove(id: string): void {
  pendingRemoval.value = id
  confirmation.value?.showModal()
}
async function confirmRemove(): Promise<void> {
  confirmation.value?.close()
  await remove(pendingRemoval.value)
}
onMounted(() => void load())
</script>
