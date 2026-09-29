<template>
  <SetCard>
    <SetHead :title="$t('auth.changePasswordTitle')" :desc="$t('auth.changePasswordDesc')" />

    <div v-if="error" class="alert border border-error/25 bg-error/10 rounded-box mb-4">
      <span class="text-sm">{{ error }}</span>
    </div>

    <form class="grid md:grid-cols-2 gap-4" @submit.prevent="onChange">
      <div class="md:col-span-2">
        <AuthPasswordField
          id="sec_cur"
          v-model="current"
          :label="$t('auth.currentPassword')"
          autocomplete="current-password"
          :placeholder="$t('auth.passwordPlaceholder')"
          :error="errors.current"
        />
      </div>
      <div>
        <AuthPasswordField
          id="sec_new"
          v-model="next"
          :label="$t('auth.newPassword')"
          autocomplete="new-password"
          :placeholder="$t('auth.passwordMin')"
          :error="errors.next"
          @blur="errors.next = next ? validatePassword(next, t) : ''"
        />
        <AuthStrength v-if="next && !errors.next" :score="strength" />
      </div>
      <AuthPasswordField
        id="sec_conf"
        v-model="confirm"
        :label="$t('auth.confirmPassword')"
        autocomplete="new-password"
        :placeholder="$t('auth.confirmPasswordPlaceholder')"
        :error="errors.confirm"
      />
      <div class="md:col-span-2 flex items-center justify-end gap-3 mt-1">
        <span v-if="saved" class="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 :size="15" /> {{ $t('auth.passwordUpdated') }}
        </span>
        <button type="submit" class="btn btn-sm btn-primary rounded-field gap-2" :disabled="busy">
          <template v-if="busy">
            <span class="loading loading-spinner loading-xs" /> {{ $t('settings.updating') }}
          </template>
          <template v-else>{{ $t('auth.updatePassword') }}</template>
        </button>
      </div>
    </form>
  </SetCard>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import { ApiClientError } from '~/composables/useApi'
import { passwordStrength, validatePassword } from '~/utils/authValidation'

const { t } = useI18n()
const { changePassword } = useAuth()

const current = ref('')
const next = ref('')
const confirm = ref('')
const error = ref('')
const saved = ref(false)
const busy = ref(false)
const errors = reactive({ current: '', next: '', confirm: '' })
const strength = computed(() => passwordStrength(next.value))

async function onChange() {
  error.value = ''
  saved.value = false
  errors.current = current.value ? '' : t('auth.currentPassword')
  errors.next = validatePassword(next.value, t)
  errors.confirm = !confirm.value
    ? t('auth.confirmRequired')
    : confirm.value !== next.value
      ? t('auth.passwordMismatch')
      : ''
  if (errors.current || errors.next || errors.confirm) return

  busy.value = true
  try {
    await changePassword({ currentPassword: current.value, newPassword: next.value })
    current.value = ''
    next.value = ''
    confirm.value = ''
    saved.value = true
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : t('settings.passwordFailed')
  } finally {
    busy.value = false
  }
}
</script>
