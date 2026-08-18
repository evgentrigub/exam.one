<template>
  <AuthPageHeader :title="$t('auth.verifyTitle')" :subtitle="subtitle">
    <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <div>
        <div class="flex gap-2 justify-between">
          <input
            v-for="(_, i) in digits"
            :key="i"
            :ref="el => setRef(el, i)"
            :value="digits[i]"
            inputmode="numeric"
            maxlength="6"
            class="w-full h-14 text-center font-mono text-xl font-semibold rounded-field bg-base-100 border outline-none transition-colors"
            :class="error ? 'border-error' : 'border-base-300 focus:border-primary'"
            :aria-label="`Digit ${i + 1}`"
            @input="onInput(i, $event)"
            @keydown="onKey(i, $event)"
          />
        </div>
        <div v-if="error" class="flex items-center gap-1.5 mt-2 text-error">
          <AlertCircle :size="13" />
          <span class="text-xs">{{ error }}</span>
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full rounded-field gap-2"
        :disabled="loading || code.length !== 6"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <template v-else>{{ $t('auth.confirmEmail') }}</template>
      </button>

      <div class="text-center text-sm text-base-content/60">
        <button
          v-if="resent <= 0"
          type="button"
          class="font-semibold text-primary hover:underline"
          @click="resend"
        >
          {{ $t('auth.resendCode') }}
        </button>
        <span v-else>{{ $t('auth.resendWait', { seconds: resent }) }}</span>
      </div>

      <button
        type="button"
        class="text-sm text-base-content/50 hover:text-base-content"
        @click="navigateTo('/dashboard')"
      >
        {{ $t('auth.verifyLater') }}
      </button>
    </form>
  </AuthPageHeader>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'

definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'Confirm email — Exam.one' })

const { t } = useI18n()
const route = useRoute()
const { verifyEmail, resendVerification } = useAuth()

const email = computed(() => String(route.query['email'] || ''))
const subtitle = computed(() => t('auth.verifySubtitle', { email: email.value || '…' }))

const digits = ref(['', '', '', '', '', ''])
const refs = ref<(HTMLInputElement | null)[]>([])
const error = ref('')
const loading = ref(false)
const resent = ref(0)
const code = computed(() => digits.value.join(''))

function setRef(el: Element | ComponentPublicInstance | null, i: number) {
  refs.value[i] = el as HTMLInputElement | null
}

let resentTimer: ReturnType<typeof setInterval> | null = null

onBeforeUnmount(() => {
  if (resentTimer) clearInterval(resentTimer)
})

watch(resent, value => {
  if (resentTimer) {
    clearInterval(resentTimer)
    resentTimer = null
  }
  if (value <= 0) return
  resentTimer = setInterval(() => {
    resent.value -= 1
    if (resent.value <= 0 && resentTimer) {
      clearInterval(resentTimer)
      resentTimer = null
    }
  }, 1000)
})

function onInput(i: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '')
  if (!raw) {
    digits.value[i] = ''
    return
  }
  error.value = ''
  const chars = raw.split('')
  const next = [...digits.value]
  for (let k = 0; k < chars.length && i + k < 6; k++) {
    next[i + k] = chars[k]!
  }
  digits.value = next
  const target = Math.min(i + chars.length, 5)
  refs.value[target]?.focus()
}

function onKey(i: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[i] && i > 0) refs.value[i - 1]?.focus()
  if (event.key === 'ArrowLeft' && i > 0) refs.value[i - 1]?.focus()
  if (event.key === 'ArrowRight' && i < 5) refs.value[i + 1]?.focus()
}

async function submit() {
  if (code.value.length !== 6) {
    error.value = t('auth.enterAllDigits')
    return
  }
  if (!email.value) {
    error.value = t('auth.emailRequired')
    return
  }
  loading.value = true
  error.value = ''
  try {
    await verifyEmail({ email: email.value, code: code.value })
    await navigateTo('/dashboard')
  } catch (err) {
    error.value =
      err instanceof ApiClientError ? err.message : t('auth.invalidCode')
  } finally {
    loading.value = false
  }
}

async function resend() {
  if (!email.value) return
  await resendVerification(email.value)
  resent.value = 30
}
</script>
