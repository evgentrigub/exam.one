<template>
  <AuthPageHeader
    :title="$t('auth.forgotTitle')"
    :subtitle="$t('auth.forgotSubtitle')"
    back-to="/auth/login"
    :back-label="$t('auth.backToSignIn')"
  >
    <div v-if="done" class="flex flex-col gap-4">
      <div class="alert text-sm" :class="emailConfigured ? 'alert-success' : 'alert-info'">
        <Info :size="16" />
        <span class="text-pretty">{{ doneMessage }}</span>
      </div>
      <NuxtLink to="/auth/login" class="btn btn-primary w-full rounded-field">
        {{ $t('auth.backToSignIn') }}
      </NuxtLink>
    </div>

    <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <AuthField
        id="forgot_email"
        v-model="email"
        :label="$t('auth.email')"
        :icon="Mail"
        type="email"
        autocomplete="email"
        :placeholder="$t('auth.emailPlaceholder')"
        :error="error"
        @blur="error = validateEmail(email)"
      />

      <button type="submit" class="btn btn-primary w-full rounded-field gap-2" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <template v-else>{{ $t('auth.sendReset') }}</template>
      </button>
    </form>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { Info, Mail } from 'lucide-vue-next'
import { validateEmail } from '~/utils/authValidation'

definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'Forgot password — Exam.one' })

const { t } = useI18n()
const { forgotPassword, loadConfig, authConfig } = useAuth()

const email = ref('')
const error = ref('')
const loading = ref(false)
const done = ref(false)

const emailConfigured = computed(() => authConfig.value?.emailConfigured === true)

const doneMessage = computed(() =>
  emailConfigured.value ? t('auth.forgotSentSmtp') : t('auth.forgotSentNoSmtp')
)

onMounted(() => {
  void loadConfig()
})

async function submit() {
  error.value = validateEmail(email.value)
  if (error.value) return
  loading.value = true
  try {
    await forgotPassword(email.value)
    done.value = true
  } finally {
    loading.value = false
  }
}
</script>
