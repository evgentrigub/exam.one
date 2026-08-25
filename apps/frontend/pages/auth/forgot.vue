<template>
  <AuthPageHeader :title="headerTitle" back-to="/auth/login" :back-label="$t('auth.backToSignIn')">
    <template #subtitle>
      <i18n-t v-if="done" :keypath="sentSubtitleKey" tag="span" scope="global">
        <template #email>
          <span class="font-medium text-base-content">{{ email }}</span>
        </template>
      </i18n-t>
      <template v-else>{{ $t('auth.forgotSubtitle') }}</template>
    </template>

    <div v-if="done" class="flex flex-col gap-5">
      <div class="rounded-box bg-base-200 border border-base-300 p-5 flex items-start gap-3.5">
        <div
          class="grid size-10 place-items-center rounded-field bg-primary/10 text-primary shrink-0"
        >
          <MailCheck :size="19" />
        </div>
        <div class="text-sm text-base-content/70 text-pretty">{{ sentHint }}</div>
      </div>
      <p class="text-center text-sm text-base-content/60">
        {{ $t('auth.wrongAddress') }}
        <button
          type="button"
          class="font-semibold text-primary hover:underline"
          @click="done = false"
        >
          {{ $t('auth.tryAnother') }}
        </button>
      </p>
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

      <AuthSubmit :loading="loading">{{ $t('auth.sendReset') }}</AuthSubmit>
    </form>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { Mail, MailCheck } from 'lucide-vue-next'
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

const headerTitle = computed(() =>
  done.value
    ? emailConfigured.value
      ? t('auth.sentTitle')
      : t('auth.sentTitleNoSmtp')
    : t('auth.forgotTitle')
)

const sentSubtitleKey = computed(() =>
  emailConfigured.value ? 'auth.sentSubtitle' : 'auth.sentSubtitleNoSmtp'
)

const sentHint = computed(() =>
  emailConfigured.value ? t('auth.sentHint') : t('auth.sentHintNoSmtp')
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
