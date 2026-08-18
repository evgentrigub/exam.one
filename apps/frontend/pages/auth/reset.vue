<template>
  <AuthPageHeader
    :title="$t('auth.resetTitle')"
    :subtitle="$t('auth.resetSubtitle')"
    back-to="/auth/login"
    :back-label="$t('auth.backToSignIn')"
  >
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div v-if="formError" class="alert alert-error text-sm">
        <AlertCircle :size="16" />
        <span>{{ formError }}</span>
      </div>

      <div>
        <AuthPasswordField
          id="reset_password"
          v-model="password"
          :label="$t('auth.newPassword')"
          autocomplete="new-password"
          :placeholder="$t('auth.passwordMin')"
          :error="errors.password"
          @blur="errors.password = validatePassword(password)"
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
      />

      <button type="submit" class="btn btn-primary w-full rounded-field gap-2" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <template v-else>{{ $t('auth.updatePassword') }}</template>
      </button>
    </form>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import { passwordStrength, validatePassword } from '~/utils/authValidation'

definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'Reset password — Exam.one' })

const { t } = useI18n()
const route = useRoute()
const { resetPassword } = useAuth()

const token = computed(() => String(route.query['token'] || ''))
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const formError = ref('')
const errors = reactive({ password: '', confirm: '' })
const strength = computed(() => passwordStrength(password.value))

async function submit() {
  errors.password = validatePassword(password.value)
  errors.confirm = !confirm.value
    ? t('auth.confirmRequired')
    : confirm.value !== password.value
      ? t('auth.passwordMismatch')
      : ''
  if (errors.password || errors.confirm || !token.value) {
    if (!token.value) formError.value = t('auth.invalidResetLink')
    return
  }

  loading.value = true
  formError.value = ''
  try {
    await resetPassword({ token: token.value, password: password.value })
    await navigateTo('/dashboard')
  } catch (error) {
    formError.value =
      error instanceof ApiClientError ? error.message : t('auth.invalidResetLink')
  } finally {
    loading.value = false
  }
}
</script>
