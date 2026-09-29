<template>
  <AuthPageHeader :title="headerTitle" :subtitle="headerSubtitle">
    <AuthDone v-if="done" :cta-label="$t('auth.goToDashboard')" to="/dashboard" />

    <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div v-if="formError" class="alert border border-error/25 bg-error/10 rounded-box">
        <AlertTriangle :size="17" class="text-error shrink-0" />
        <span class="text-sm">{{ formError }}</span>
      </div>

      <div>
        <AuthPasswordField
          id="reset_password"
          v-model="password"
          :label="$t('auth.newPassword')"
          autocomplete="new-password"
          :placeholder="$t('auth.passwordMin')"
          :error="errors.password"
          @blur="errors.password = validatePassword(password, t)"
        />
        <AuthStrength v-if="password && !errors.password" :score="strength" />
      </div>

      <AuthPasswordField
        id="reset_confirm"
        v-model="confirm"
        :label="$t('auth.confirmPassword')"
        autocomplete="new-password"
        :placeholder="$t('auth.confirmPasswordPlaceholder')"
        :error="errors.confirm"
        @blur="errors.confirm = confirmError(confirm)"
      />

      <AuthSubmit :loading="loading" :icon="Check">{{ $t('auth.updatePassword') }}</AuthSubmit>
      <p class="text-center text-sm text-base-content/60">
        <NuxtLink to="/auth/login" class="font-semibold text-primary hover:underline">
          {{ $t('auth.backToSignIn') }}
        </NuxtLink>
      </p>
    </form>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { AlertTriangle, Check } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import { passwordStrength, validatePassword } from '~/utils/authValidation'

definePageMeta({ layout: 'auth', auth: false })

const { t } = useI18n()
useHead({ title: () => `${t('pageMeta.resetPasswordTitle')} — Exam.one` })
const route = useRoute()
const { resetPassword } = useAuth()

const token = computed(() => String(route.query['token'] || ''))
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const done = ref(false)
const formError = ref('')
const errors = reactive({ password: '', confirm: '' })
const strength = computed(() => passwordStrength(password.value))

const headerTitle = computed(() => (done.value ? t('auth.passwordUpdated') : t('auth.resetTitle')))
const headerSubtitle = computed(() =>
  done.value ? t('auth.resetDoneBody') : t('auth.resetSubtitle')
)

function confirmError(value: string): string {
  if (!value) return t('auth.confirmRequired')
  if (value !== password.value) return t('auth.passwordMismatch')
  return ''
}

async function submit() {
  errors.password = validatePassword(password.value, t)
  errors.confirm = confirmError(confirm.value)
  if (errors.password || errors.confirm || !token.value) {
    if (!token.value) formError.value = t('auth.invalidResetLink')
    return
  }

  loading.value = true
  formError.value = ''
  try {
    await resetPassword({ token: token.value, password: password.value })
    done.value = true
  } catch (error) {
    formError.value = error instanceof ApiClientError ? error.message : t('auth.invalidResetLink')
  } finally {
    loading.value = false
  }
}
</script>
