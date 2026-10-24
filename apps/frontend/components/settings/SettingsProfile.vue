<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.profileTitle')" :desc="$t('settings.profileDesc')" />

      <div v-if="error" class="alert border border-error/25 bg-error/10 rounded-box mb-4">
        <span class="text-sm">{{ error }}</span>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <AuthField
          id="set_name"
          v-model="name"
          :label="$t('settings.fullName')"
          :icon="User"
          autocomplete="name"
          :error="errors.name"
          @blur="errors.name = validateRequired(name, t, t('settings.fullName'))"
        />
        <AuthField
          id="set_email"
          v-model="email"
          :label="$t('auth.email')"
          :icon="Mail"
          type="email"
          autocomplete="email"
          :error="errors.email"
          @blur="errors.email = validateEmail(email, t)"
        >
          <template #labelSuffix>
            <BadgeCheck
              v-if="profile.emailVerified"
              :size="14"
              class="text-success"
              :aria-label="$t('settings.emailConfirmed')"
            />
          </template>
        </AuthField>
      </div>

      <SetSave :save="onSave" />
    </SetCard>

    <SettingsSecurity />
    <SettingsConnected />
  </div>
</template>

<script setup lang="ts">
import { BadgeCheck, Mail, User } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import { validateEmail, validateRequired } from '~/utils/authValidation'

const { t } = useI18n()
const { profile, saveProfile } = useAccountProfile()

const name = ref(profile.value.name)
const email = ref(profile.value.email)
const error = ref('')
const errors = reactive({ name: '', email: '' })

watch(
  () => [profile.value.name, profile.value.email],
  () => {
    name.value = profile.value.name
    email.value = profile.value.email
  }
)

async function onSave() {
  error.value = ''
  errors.name = validateRequired(name.value, t, t('settings.fullName'))
  errors.email = validateEmail(email.value, t)
  if (errors.name || errors.email) throw new Error('invalid')

  try {
    await saveProfile({
      name: name.value.trim(),
      email: email.value.trim(),
      examTargetDate: profile.value.examTargetDate,
    })
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : t('settings.saveFailed')
    throw err
  }
}
</script>
