<template>
  <AuthPageHeader :title="$t('auth.loginTitle')" :subtitle="$t('auth.loginSubtitle')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div v-if="formError" class="alert alert-error text-sm">
        <AlertCircle :size="16" />
        <span>{{ formError }}</span>
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

      <AuthPasswordField
        id="login_password"
        v-model="password"
        :label="$t('auth.password')"
        autocomplete="current-password"
        :placeholder="$t('auth.passwordPlaceholder')"
        :error="errors.password"
        @blur="errors.password = validatePassword(password)"
      />

      <div class="flex justify-end">
        <NuxtLink to="/auth/forgot" class="text-sm font-semibold text-primary hover:underline">
          {{ $t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <button type="submit" class="btn btn-primary w-full rounded-field gap-2" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <template v-else>
          {{ $t('auth.signIn') }}
          <ArrowRight :size="17" />
        </template>
      </button>
    </form>

    <template #footer>
      {{ $t('auth.newHere') }}
      <NuxtLink to="/auth/register" class="font-semibold text-primary hover:underline">
        {{ $t('auth.createAccount') }}
      </NuxtLink>
    </template>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowRight, Mail } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import { validateEmail, validatePassword } from '~/utils/authValidation'

definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'Sign in — Exam.one' })

const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const formError = ref('')
const errors = reactive({ email: '', password: '' })

async function submit() {
  errors.email = validateEmail(email.value)
  errors.password = validatePassword(password.value)
  if (errors.email || errors.password) return

  loading.value = true
  formError.value = ''
  try {
    const session = await login({ email: email.value, password: password.value })
    if (session.requiresEmailVerification) {
      await navigateTo({
        path: '/auth/verify',
        query: { email: session.user.email },
      })
      return
    }
    await navigateTo('/dashboard')
  } catch (error) {
    formError.value =
      error instanceof ApiClientError ? error.message : 'That email and password don’t match.'
  } finally {
    loading.value = false
  }
}
</script>
