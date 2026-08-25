<template>
  <NuxtLayout name="auth">
    <AuthPageHeader :title="$t('auth.loginTitle')" :subtitle="$t('auth.loginSubtitle')">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <div v-if="locked" class="alert border border-warning/25 bg-warning/10 rounded-box">
          <Clock :size="17" class="text-warning shrink-0" />
          <span class="text-sm">{{ $t('auth.tooManyAttempts') }}</span>
        </div>
        <div v-else-if="formError" class="alert border border-error/25 bg-error/10 rounded-box">
          <AlertTriangle :size="17" class="text-error shrink-0" />
          <span class="text-sm">{{ formError }}</span>
        </div>

        <AuthField
          id="login_email"
          v-model="email"
          :label="$t('auth.email')"
          :icon="Mail"
          type="email"
          autocomplete="email"
          :placeholder="$t('auth.emailPlaceholder')"
          :error="errors.email"
          @blur="errors.email = validateEmail(email)"
        />

        <div>
          <AuthPasswordField
            id="login_password"
            v-model="password"
            :label="$t('auth.password')"
            autocomplete="current-password"
            :placeholder="$t('auth.passwordPlaceholder')"
            :error="errors.password"
            @blur="errors.password = validatePassword(password)"
          />
          <div class="flex items-center justify-between mt-2.5">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="remember" type="checkbox" class="checkbox checkbox-sm" />
              <span class="text-sm text-base-content/70">{{ $t('auth.keepSignedIn') }}</span>
            </label>
            <NuxtLink to="/auth/forgot" class="text-sm text-base-content/60 hover:text-primary">
              {{ $t('auth.forgotPassword') }}
            </NuxtLink>
          </div>
        </div>

        <AuthSubmit :loading="loading">{{ $t('auth.signIn') }}</AuthSubmit>
        <AuthRule :label="$t('auth.or')" />
        <AuthGoogle :label="$t('auth.continueWithGoogle')" />
      </form>
    </AuthPageHeader>

    <template #footer>
      {{ $t('auth.newHere') }}
      <NuxtLink to="/auth/register" class="font-semibold text-primary hover:underline">
        {{ $t('auth.createAccount') }}
      </NuxtLink>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { AlertTriangle, Clock, Mail } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import { validateEmail, validatePassword } from '~/utils/authValidation'

definePageMeta({ layout: false, auth: false })
useHead({ title: 'Sign in — Exam.one' })

const { t } = useI18n()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const formError = ref('')
const locked = ref(false)
const errors = reactive({ email: '', password: '' })

async function submit() {
  errors.email = validateEmail(email.value)
  errors.password = validatePassword(password.value)
  if (errors.email || errors.password) return

  loading.value = true
  formError.value = ''
  locked.value = false
  try {
    const session = await login({
      email: email.value,
      password: password.value,
      remember: remember.value,
    })
    if (session.requiresEmailVerification) {
      await navigateTo({
        path: '/auth/verify',
        query: { email: session.user.email },
      })
      return
    }
    await navigateTo('/dashboard')
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 429) {
      locked.value = true
      formError.value = ''
    } else {
      formError.value =
        error instanceof ApiClientError ? error.message : t('auth.invalidCredentials')
    }
  } finally {
    loading.value = false
  }
}
</script>
