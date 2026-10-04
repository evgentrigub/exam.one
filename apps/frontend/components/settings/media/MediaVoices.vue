<template>
  <SetCard>
    <SetHead :title="$t('settings.voicesTitle')" :desc="$t('settings.voicesDesc')" />
    <div
      v-if="!online"
      class="mb-4 flex items-start gap-2 rounded-field bg-warning/10 px-3 py-2.5 text-sm text-base-content/75"
    >
      <TriangleAlert :size="15" class="mt-0.5 shrink-0 text-warning" />
      <span>{{ $t('settings.voicesOffline') }}</span>
    </div>
    <p v-if="error" class="mb-3 text-sm text-error">{{ error }}</p>
    <div v-if="online" class="flex flex-col gap-6">
      <div v-for="group in groups" :key="group.id">
        <div class="flex items-center gap-2 mb-2">
          <MediaLangChip :lang="group.id" />
          <span class="font-medium">{{ $t(group.labelKey) }}</span>
          <span class="text-xs text-base-content/50">
            {{
              group.installed.length
                ? $t('settings.voicesInstalled', {
                    n: group.installed.length,
                    size: fmtBytes(group.installedBytes),
                  })
                : $t('settings.voicesNone')
            }}
          </span>
        </div>
        <div
          v-if="group.installed.length === 0"
          class="mb-2 flex items-start gap-2 rounded-field bg-warning/10 px-3 py-2.5 text-sm text-base-content/75"
        >
          <TriangleAlert :size="15" class="mt-0.5 shrink-0 text-warning" />
          <span>{{ $t('settings.voicesMissingWarning', { lang: $t(group.labelKey) }) }}</span>
        </div>
        <div class="rounded-field border border-base-300 divide-y divide-base-300">
          <MediaVoiceRow
            v-for="voice in group.voices"
            :key="voice.id"
            :voice="voice"
            :busy="busy.has(voice.id)"
            @download="download(voice.id)"
            @cancel="cancel(voice.id)"
            @remove="remove(voice.id)"
            @set-default="setDefault(voice.lang, voice.id)"
          />
        </div>
      </div>
    </div>
  </SetCard>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'
import { MEDIA_LANGUAGES } from '~/data/account/mediaLanguages'
import { useVoiceModels } from '~/composables/useVoiceModels'
import { fmtBytes } from '~/utils/fmtBytes'

const { voices, online, error, busy, load, download, cancel, remove, setDefault } = useVoiceModels()

const groups = computed(() =>
  MEDIA_LANGUAGES.map(language => {
    const list = voices.value.filter(voice => voice.lang === language.id)
    const installed = list.filter(voice => voice.installed)
    return {
      id: language.id,
      labelKey: language.labelKey,
      voices: list,
      installed,
      installedBytes: installed.reduce((sum, voice) => sum + voice.sizeBytes, 0),
    }
  })
)

onMounted(() => void load())
</script>
