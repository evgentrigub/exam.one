<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.promptsTitle')" :desc="$t('settings.promptsDesc')" />

      <div v-if="error" class="alert border border-error/25 bg-error/10 rounded-box mb-4">
        <span class="text-sm">{{ error }}</span>
      </div>

      <div class="flex flex-col gap-5">
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.promptsSkill') }}</span>
          </span>
          <SetChoice
            :value="skill"
            cols="grid-cols-2 sm:grid-cols-4"
            :options="skillOptions"
            @update:value="onSkill"
          />
        </div>

        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.promptsPart') }}</span>
          </span>
          <SetChoice :value="String(part)" :options="partOptions" @update:value="onPart" />
        </div>

        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.promptsKind') }}</span>
          </span>
          <SetChoice :value="kind" :options="kindOptions" @update:value="onKind" />
        </div>

        <div>
          <div class="flex items-center justify-between gap-3 mb-1.5">
            <span class="label-text text-sm font-medium">{{ $t('settings.promptsBody') }}</span>
            <span
              class="badge badge-sm rounded-field"
              :class="hasOverride ? 'badge-primary' : 'badge-ghost'"
            >
              {{ hasOverride ? $t('settings.promptsCustom') : $t('settings.promptsDefault') }}
            </span>
          </div>
          <textarea
            v-model="body"
            class="textarea textarea-bordered w-full min-h-[320px] font-mono text-xs leading-relaxed rounded-field"
            :aria-label="$t('settings.promptsBody')"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 mt-5">
        <span v-if="saved" class="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 :size="15" /> {{ $t('settings.saved') }}
        </span>
        <button
          type="button"
          class="btn btn-sm btn-ghost rounded-field"
          :disabled="restoreBusy || saveBusy || (!hasOverride && !dirty)"
          @click="onRestore"
        >
          <template v-if="restoreBusy">
            <span class="loading loading-spinner loading-xs" />
          </template>
          {{ $t('settings.promptsRestore') }}
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary rounded-field gap-2"
          :disabled="!dirty || !body.trim() || saveBusy"
          @click="onSave"
        >
          <template v-if="saveBusy">
            <span class="loading loading-spinner loading-xs" /> {{ $t('settings.saving') }}
          </template>
          <template v-else>{{ $t('settings.promptsSave') }}</template>
        </button>
      </div>
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import type { SetChoiceOption } from '~/components/settings/SetChoice.vue'
import {
  PROMPT_MATRIX,
  PROMPT_SKILLS,
  clampPromptSlot,
  type PromptKindId,
  type PromptSkillId,
} from '~/data/prompts/a2Catalog'

const { t } = useI18n()
const {
  hydrate,
  findOverride,
  editorBody,
  saveOverride,
  restoreDefault,
} = usePromptOverrides()

const skill = ref<PromptSkillId>('reading')
const part = ref(1)
const kind = ref<PromptKindId>('generator')
const body = ref('')
const error = ref('')
const restoreBusy = ref(false)
const saveBusy = ref(false)
const saved = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | undefined

const slot = computed(() => clampPromptSlot(skill.value, part.value, kind.value))
const hasOverride = computed(() => Boolean(findOverride(slot.value)))
const savedBody = computed(() => editorBody(slot.value))
const dirty = computed(() => body.value !== savedBody.value)

const skillOptions = computed<SetChoiceOption[]>(() =>
  PROMPT_SKILLS.map(id => ({ id, label: t(`skill.${id}`) }))
)

const partOptions = computed<SetChoiceOption[]>(() =>
  PROMPT_MATRIX[skill.value].parts.map(n => ({
    id: String(n),
    label: t('settings.promptsPartN', { n }),
  }))
)

const kindOptions = computed<SetChoiceOption[]>(() =>
  PROMPT_MATRIX[skill.value].kinds.map(id => ({
    id,
    label: t(`settings.promptsKind_${id}`),
  }))
)

function loadBody() {
  body.value = editorBody(slot.value)
}

function onSkill(id: string) {
  const next = clampPromptSlot(id as PromptSkillId, part.value, kind.value)
  skill.value = next.skill
  part.value = next.part
  kind.value = next.kind
  loadBody()
}

function onPart(id: string) {
  const next = clampPromptSlot(skill.value, Number(id), kind.value)
  part.value = next.part
  kind.value = next.kind
  loadBody()
}

function onKind(id: string) {
  kind.value = id as PromptKindId
  loadBody()
}

async function onSave() {
  error.value = ''
  saveBusy.value = true
  saved.value = false
  try {
    await saveOverride(slot.value, body.value)
    loadBody()
    saved.value = true
    if (savedTimer) clearTimeout(savedTimer)
    savedTimer = setTimeout(() => {
      saved.value = false
    }, 2200)
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : t('settings.promptsError')
  } finally {
    saveBusy.value = false
  }
}

async function onRestore() {
  error.value = ''
  restoreBusy.value = true
  try {
    await restoreDefault(slot.value)
    loadBody()
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : t('settings.promptsError')
  } finally {
    restoreBusy.value = false
  }
}

onMounted(async () => {
  await hydrate()
  loadBody()
})

onBeforeUnmount(() => {
  if (savedTimer) clearTimeout(savedTimer)
})
</script>
