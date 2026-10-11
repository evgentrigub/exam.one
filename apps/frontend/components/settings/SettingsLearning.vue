<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.learningTitle')" :desc="$t('settings.learningDesc')" />

      <div v-if="error" class="alert border border-error/25 bg-error/10 rounded-box mb-4">
        <span class="text-sm">{{ error }}</span>
      </div>

      <div class="flex flex-col gap-5">
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.examBoard') }}</span>
          </span>
          <SetRadio
            v-model:value="examBoard"
            name="exam_board"
            :label="$t('settings.examBoard')"
            :options="boardOptions"
          />
        </div>
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.targetLevel') }}</span>
          </span>
          <SetChoice
            v-model:value="selectedPackId"
            cols="grid-cols-2 sm:grid-cols-5"
            :options="levelOptions"
          />
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label pb-1.5 block" for="exam_date">
              <span class="label-text text-sm font-medium">{{ $t('settings.examDate') }}</span>
            </label>
            <label class="input input-bordered flex items-center gap-2 w-full rounded-field">
              <Calendar :size="17" class="opacity-60 shrink-0" />
              <input
                id="exam_date"
                v-model="examDate"
                type="date"
                class="grow bg-transparent outline-none min-w-0"
              />
            </label>
          </div>
          <div>
            <span class="label pb-1.5 block">
              <span class="label-text text-sm font-medium">{{ $t('settings.timeRemaining') }}</span>
            </span>
            <div
              class="input input-bordered flex items-center gap-2 w-full rounded-field bg-primary/5 border-primary/20"
            >
              <Hourglass :size="17" class="text-primary shrink-0" />
              <span class="grow font-semibold text-primary">{{ remainingLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <SetSave :save="onSave" />
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Hourglass } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { listLivePacks } from '@exam-one/exam-packs'
import { useSettingsStore } from '~/stores/settings'
import type { SetChoiceOption } from '~/components/settings/SetChoice.vue'
import type { SetRadioOption } from '~/components/settings/SetRadio.vue'
import { ApiClientError } from '~/composables/useApi'

const { t, te } = useI18n()
const { profile, saveProfile } = useAccountProfile()
const settingsStore = useSettingsStore()
const { packId } = storeToRefs(settingsStore)

const livePacks = listLivePacks()
const examBoard = ref(livePacks.find(pack => pack.packId === packId.value)?.board ?? livePacks[0]?.board ?? '')
const selectedPackId = ref(packId.value)
const examDate = ref(profile.value.examTargetDate)
const error = ref('')

watch(
  () => packId.value,
  value => {
    selectedPackId.value = value
  }
)
watch(
  () => profile.value.examTargetDate,
  value => {
    examDate.value = value
  }
)

const remainingLabel = computed(() => {
  if (!examDate.value) return '—'
  const target = new Date(examDate.value)
  if (Number.isNaN(target.getTime())) return '—'
  const days = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
  return t('settings.daysCount', { n: days })
})

const boardOptions = computed<SetRadioOption[]>(() =>
  [...new Set(livePacks.map(pack => pack.board))].map(board => ({
    id: board,
    label: te(`settings.boards.${board}`) ? t(`settings.boards.${board}`) : board,
  }))
)
watch(examBoard, board => {
  if (!livePacks.some(pack => pack.packId === selectedPackId.value && pack.board === board)) selectedPackId.value = livePacks.find(pack => pack.board === board)?.packId ?? packId.value
})

const levelOptions = computed<SetChoiceOption[]>(() => {
  const liveForBoard = livePacks
    .filter(pack => pack.board === examBoard.value)
    .sort((a, b) => a.cefr.localeCompare(b.cefr))
  return [
    ...liveForBoard.map(pack => ({
      id: pack.packId,
      label: pack.cefr,
      desc: pack.title,
    })),
    { id: 'b2-soon', label: 'B2', disabled: true },
    { id: 'c1-soon', label: 'C1', desc: t('settings.levelC1Desc'), disabled: true },
  ]
})

async function onSave() {
  error.value = ''
  try {
    await saveProfile({
      name: profile.value.name,
      email: profile.value.email,
      examTargetDate: examDate.value,
    })
    await settingsStore.selectPack(selectedPackId.value)
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : t('settings.saveFailed')
    throw err
  }
}
</script>
