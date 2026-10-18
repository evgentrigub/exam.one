<template>
  <SetCard>
    <SetHead :title="$t('settings.sttModelsTitle')" :desc="$t('settings.sttModelsShared')" />
    <p v-if="!state" class="text-sm text-base-content/60">{{ $t('settings.mediaCalculating') }}</p>
    <p v-else-if="!state.online || !state.manageable" class="alert alert-warning mb-4 text-sm">
      {{ $t('settings.sttModelsUnavailable') }}
    </p>
    <p v-if="error" role="alert" class="mb-4 text-sm text-error">{{ error }}</p>
    <div v-if="state?.manageable" class="flex flex-col gap-5">
      <div
        v-for="language in MEDIA_LANGUAGES"
        :key="language.id"
        class="rounded-field border border-base-300 p-4"
      >
        <h3 class="mb-3 flex items-center gap-2 font-medium">
          <MediaLangChip :lang="language.id" />{{ $t(language.labelKey) }}
        </h3>
        <div v-for="model in modelsForLanguage(language.id)" :key="model.id" class="mb-4 last:mb-0">
          <div class="flex flex-wrap items-center gap-2">
            <strong class="text-sm">{{ model.name }}</strong>
            <span
              v-if="model.selectedLanguages.includes(language.id)"
              class="badge badge-primary badge-sm"
              >{{ $t('settings.sttModelsSelected') }}</span
            >
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
            v-if="!model.installed && model.selectedLanguages.includes(language.id)"
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
              :disabled="busy"
              @click="cancel(model.id)"
            >
              {{ $t('settings.sttModelsCancel') }}
            </button>
            <button
              v-else-if="!model.installed && model.downloadable !== false"
              class="btn btn-primary btn-sm"
              :disabled="busy"
              @click="download(model.id)"
            >
              {{ $t('settings.sttModelsDownload') }}
            </button>
            <template v-else>
              <button
                v-if="
                  model.downloadable !== false && !model.selectedLanguages.includes(language.id)
                "
                class="btn btn-primary btn-sm"
                :disabled="busy"
                @click="prefer(language.id, model.id)"
              >
                {{ $t('settings.sttModelsUse') }}
              </button>
              <button
                class="btn btn-ghost btn-sm text-error"
                :disabled="busy"
                @click="requestRemove(model.id)"
              >
                {{ $t('settings.sttModelsRemove') }}
              </button>
            </template>
          </div>
        </div>
      </div>
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
function modelsForLanguage(lang: string) {
  return (
    state.value?.models.filter(
      model =>
        model.downloadable !== false &&
        ((model.recommendedLanguages ?? model.languages).includes(lang) ||
          model.selectedLanguages.includes(lang))
    ) ?? []
  )
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
