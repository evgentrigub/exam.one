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
          <SetChoice
            :value="examBoard"
            :options="boardOptions"
            @update:value="examBoard = $event"
          />
        </div>
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.targetLevel') }}</span>
          </span>
          <SetChoice
            v-model:value="level"
            cols="grid-cols-2 sm:grid-cols-4 max-w-xl"
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
import { useSettingsStore } from '~/stores/settings'
import type { SetChoiceOption } from '~/components/settings/SetChoice.vue'
import { ApiClientError } from '~/composables/useApi'

const { t } = useI18n()
const { profile, saveProfile } = useAccountProfile()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

const examBoard = ref('goethe')
const level = ref(examLevel.value)
const examDate = ref(profile.value.examTargetDate)
const error = ref('')

watch(
  () => examLevel.value,
  value => {
    level.value = value
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

const boardOptions = computed<SetChoiceOption[]>(() => [
  { id: 'goethe', label: t('settings.goethe'), desc: t('settings.goetheDesc') },
  { id: 'cambridge', label: t('settings.cambridge'), disabled: true },
  { id: 'ielts', label: t('settings.ielts'), disabled: true },
])

const levelOptions = computed<SetChoiceOption[]>(() => [
  { id: 'A2', label: 'A2', desc: t('settings.levelA2Desc') },
  { id: 'B1', label: 'B1', disabled: true },
  { id: 'B2', label: 'B2', disabled: true },
  { id: 'C1', label: 'C1', desc: t('settings.levelC1Desc') },
])

async function onSave() {
  error.value = ''
  try {
    await saveProfile({
      name: profile.value.name,
      email: profile.value.email,
      examTargetDate: examDate.value,
    })
    examLevel.value = level.value === 'C1' ? 'C1' : 'A2'
    await settingsStore.persist()
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : t('settings.saveFailed')
    throw err
  }
}
</script>
