<template>
  <NuxtLayout name="auth">
    <AuthPageHeader :title="$t('auth.registerTitle')" :subtitle="$t('auth.registerSubtitle')">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <div v-if="formError" class="alert border border-error/25 bg-error/10 rounded-box">
          <AlertTriangle :size="17" class="text-error shrink-0" />
          <span class="text-sm">{{ formError }}</span>
        </div>

        <AuthField
          id="reg_name"
          v-model="name"
          :label="$t('auth.name')"
          :icon="User"
          autocomplete="name"
          :placeholder="$t('auth.namePlaceholder')"
          :error="errors.name"
          @blur="errors.name = validateRequired(name, $t('auth.name'))"
        />

        <AuthField
          id="reg_email"
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
            id="reg_password"
            v-model="password"
            :label="$t('auth.password')"
            autocomplete="new-password"
            :placeholder="$t('auth.passwordMin')"
            :error="errors.password"
            @blur="errors.password = validatePassword(password)"
          />
          <AuthStrength v-if="password && !errors.password" :score="strength" />
        </div>

        <label class="flex items-start gap-2.5 cursor-pointer">
          <input
            v-model="agree"
            type="checkbox"
            class="checkbox checkbox-sm checkbox-primary mt-0.5"
          />
          <span class="text-sm text-base-content/70 text-pretty">{{ $t('auth.agreeTerms') }}</span>
        </label>

        <AuthSubmit :loading="loading" :disabled="!canSubmit">
          {{ $t('auth.createAccountSubmit') }}
        </AuthSubmit>
        <AuthRule :label="$t('auth.or')" />
        <AuthGoogle :label="$t('auth.signUpWithGoogle')" />
      </form>
    </AuthPageHeader>

    <template #footer>
      {{ $t('auth.alreadyHaveAccount') }}
      <NuxtLink to="/auth/login" class="font-semibold text-primary hover:underline">
        {{ $t('auth.signIn') }}
      </NuxtLink>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { AlertTriangle, Mail, User } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import {
  passwordStrength,
  validateEmail,
  validatePassword,
  validateRequired,
} from '~/utils/authValidation'

definePageMeta({ layout: false, auth: false })
useHead({ title: 'Create account — Exam.one' })

const { t } = useI18n()
const { register, loadConfig } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const agree = ref(false)
const loading = ref(false)
const formError = ref('')
const errors = reactive({ name: '', email: '', password: '' })

const strength = computed(() => passwordStrength(password.value))
const canSubmit = computed(
  () =>
    !!name.value &&
    !!email.value &&
    !!password.value &&
    agree.value &&
    !errors.name &&
    !errors.email &&
    !errors.password
)

onMounted(() => {
  void loadConfig()
})

async function submit() {
  errors.name = validateRequired(name.value, t('auth.name'))
  errors.email = validateEmail(email.value)
  errors.password = validatePassword(password.value)
  if (errors.name || errors.email || errors.password || !agree.value) return

  loading.value = true
  formError.value = ''
  try {
    const session = await register({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    if (session.requiresEmailVerification) {
      await navigateTo({ path: '/auth/verify', query: { email: session.user.email } })
      return
    }
    await navigateTo('/dashboard')
  } catch (error) {
    formError.value = error instanceof ApiClientError ? error.message : t('auth.registerFailed')
  } finally {
    loading.value = false
  }
}
</script>
