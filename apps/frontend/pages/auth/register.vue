<template>
  <AuthPageHeader :title="$t('auth.registerTitle')" :subtitle="$t('auth.registerSubtitle')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div v-if="formError" class="alert alert-error text-sm">
        <AlertCircle :size="16" />
        <span>{{ formError }}</span>
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

      <label class="flex items-start gap-2 cursor-pointer text-sm">
        <input v-model="agree" type="checkbox" class="checkbox checkbox-sm mt-0.5" />
        <span class="text-base-content/70">{{ $t('auth.agreeTerms') }}</span>
      </label>

      <button
        type="submit"
        class="btn btn-primary w-full rounded-field gap-2"
        :disabled="loading || !canSubmit"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <template v-else>
          {{ $t('auth.createAccount') }}
          <ArrowRight :size="17" />
        </template>
      </button>
    </form>

    <template #footer>
      {{ $t('auth.alreadyHaveAccount') }}
      <NuxtLink to="/auth/login" class="font-semibold text-primary hover:underline">
        {{ $t('auth.signIn') }}
      </NuxtLink>
    </template>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowRight, Mail, User } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import {
  passwordStrength,
  validateEmail,
  validatePassword,
  validateRequired,
} from '~/utils/authValidation'

definePageMeta({ layout: 'auth', auth: false })
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
    formError.value =
      error instanceof ApiClientError ? error.message : 'Could not create your account.'
  } finally {
    loading.value = false
  }
}
</script>
