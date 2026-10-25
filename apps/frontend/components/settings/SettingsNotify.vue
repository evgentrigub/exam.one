<template>
  <div class="flex flex-col gap-5">
    <div class="alert border border-warning/25 bg-warning/10 rounded-box">
      <span class="text-sm text-pretty">{{ $t('settings.notifyBanner') }}</span>
    </div>

    <SetCard>
      <SetHead :title="$t('settings.notifyStudyTitle')" :desc="$t('settings.notifyStudyDesc')" />
      <div class="flex flex-col gap-1 divide-y divide-base-300">
        <SetToggle
          :checked="true"
          disabled
          :label="$t('settings.notifyDaily')"
          :desc="$t('settings.notifyDailyDesc')"
        />
        <SetToggle
          :checked="true"
          disabled
          :label="$t('settings.notifyStreak')"
          :desc="$t('settings.notifyStreakDesc')"
        />
        <SetToggle
          :checked="false"
          disabled
          :label="$t('settings.notifyMock')"
          :desc="$t('settings.notifyMockDesc')"
        />
      </div>
      <div class="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-base-300">
        <div>
          <label class="label pb-1.5 block" for="rem_time">
            <span class="label-text text-sm font-medium">{{ $t('settings.reminderTime') }}</span>
          </label>
          <label
            class="input input-bordered flex items-center gap-2 w-full rounded-field opacity-70"
          >
            <Clock :size="17" class="opacity-60 shrink-0" />
            <input
              id="rem_time"
              type="time"
              value="19:00"
              disabled
              class="grow bg-transparent outline-none min-w-0"
            />
          </label>
        </div>
        <div>
          <label class="label pb-1.5 block" for="quiet">
            <span class="label-text text-sm font-medium">{{ $t('settings.quietHours') }}</span>
          </label>
          <select id="quiet" class="select select-bordered rounded-field w-full" disabled>
            <option>{{ $t('settings.quietEvening') }}</option>
          </select>
        </div>
      </div>
      <SetSave :label="$t('settings.saveReminders')" disabled />
    </SetCard>

    <SetCard>
      <SetHead
        :title="$t('settings.notifyEmailTitle')"
        :desc="$t('settings.notifyEmailDesc', { email: profile.email })"
      />
      <div class="flex flex-col gap-1 divide-y divide-base-300">
        <SetToggle
          :checked="mockEmailEnabled"
          :disabled="!emailConfigured"
          :label="$t('activity.emailMock')"
          @update:checked="saveMockEmail"
        />
        <SetToggle
          :checked="true"
          disabled
          :label="$t('settings.notifyResults')"
          :desc="$t('settings.notifyResultsDesc')"
        />
        <SetToggle
          :checked="true"
          disabled
          :label="$t('settings.notifyWeekly')"
          :desc="$t('settings.notifyWeeklyDesc')"
        />
        <SetToggle
          :checked="true"
          disabled
          :label="$t('settings.notifyCountdown')"
          :desc="$t('settings.notifyCountdownDesc')"
        />
        <SetToggle
          :checked="false"
          disabled
          :label="$t('settings.notifyProduct')"
          :desc="$t('settings.notifyProductDesc')"
        />
      </div>
      <SetSave :label="$t('settings.saveEmail')" disabled />
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

const { profile } = useAccountProfile()
const emailConfigured = ref(false)
const mockEmailEnabled = ref(true)

onMounted(() => {
  const auth = useAuth()
  void Promise.all([auth.loadConfig(), auth.getSettings()])
    .then(([config, settings]) => {
      emailConfigured.value = config.emailConfigured
      mockEmailEnabled.value = settings.notifyMockReadyEmail
    })
    .catch(() => undefined)
})

async function saveMockEmail(value: boolean) {
  try {
    mockEmailEnabled.value = (
      await useAuth().updateSettings({ notifyMockReadyEmail: value })
    ).notifyMockReadyEmail
  } catch {
    mockEmailEnabled.value = !value
  }
}
</script>
