<template>
  <div class="max-w-[1100px] mx-auto p-6 space-y-6">
    <ClientOnly>
      <!-- Profile -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-6">
        <div class="flex items-center gap-4 flex-wrap">
          <div
            class="w-16 h-16 rounded-full bg-primary/10 grid place-items-center text-primary font-display text-xl font-bold"
          >
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-display text-2xl font-bold truncate">{{ profile.name }}</h2>
            <div class="text-sm text-base-content/60 truncate">
              {{ profile.email }} · Learning German · Target {{ examLevel }}
            </div>
          </div>
          <button class="btn btn-outline btn-sm gap-1.5" @click="editing = !editing">
            <Pencil :size="13" />
            {{ editing ? 'Close' : 'Edit profile' }}
          </button>
        </div>

        <form v-if="editing" class="mt-5 grid sm:grid-cols-2 gap-4" @submit.prevent="onSaveProfile">
          <div v-if="profileError" class="sm:col-span-2 alert alert-error text-sm">
            {{ profileError }}
          </div>
          <label class="block">
            <span class="text-xs font-semibold text-base-content/60">Name</span>
            <input
              v-model="form.name"
              type="text"
              class="input input-bordered input-sm w-full mt-1"
            />
          </label>
          <label class="block">
            <span class="text-xs font-semibold text-base-content/60">Email</span>
            <input
              v-model="form.email"
              type="email"
              class="input input-bordered input-sm w-full mt-1"
            />
          </label>
          <label class="block">
            <span class="text-xs font-semibold text-base-content/60">Exam date</span>
            <input
              v-model="form.examTargetDate"
              type="date"
              class="input input-bordered input-sm w-full mt-1"
            />
          </label>
          <label class="block">
            <span class="text-xs font-semibold text-base-content/60">Interface language</span>
            <select v-model="form.locale" class="select select-bordered select-sm w-full mt-1">
              <option value="en">🇺🇸 English</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>
          </label>
          <div class="sm:col-span-2 flex justify-end gap-2">
            <button type="button" class="btn btn-ghost btn-sm" @click="editing = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="savingProfile">
              Save profile
            </button>
          </div>
        </form>

        <div class="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="tile in statTiles"
            :key="tile.label"
            class="p-3 rounded-box bg-base-200/60 border border-base-300/70"
          >
            <div class="text-[10px] uppercase tracking-wider text-base-content/50">
              {{ tile.label }}
            </div>
            <div class="font-semibold text-sm mt-0.5">{{ tile.value }}</div>
          </div>
        </div>
      </div>

      <!-- Password -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-6">
        <h3 class="font-display text-lg font-bold">{{ $t('auth.changePasswordTitle') }}</h3>
        <p class="text-sm text-base-content/60 mt-1">{{ $t('auth.changePasswordDesc') }}</p>
        <form class="mt-5 grid md:grid-cols-2 gap-4" @submit.prevent="onChangePassword">
          <div v-if="passwordError" class="md:col-span-2 alert alert-error text-sm">
            {{ passwordError }}
          </div>
          <div v-if="passwordSaved" class="md:col-span-2 text-sm text-success flex items-center gap-1.5">
            <Check :size="15" /> {{ $t('auth.passwordUpdated') }}
          </div>
          <div class="md:col-span-2">
            <AuthPasswordField
              id="acct_cur"
              v-model="pw.current"
              :label="$t('auth.currentPassword')"
              autocomplete="current-password"
              :placeholder="$t('auth.passwordPlaceholder')"
            />
          </div>
          <div>
            <AuthPasswordField
              id="acct_new"
              v-model="pw.next"
              :label="$t('auth.newPassword')"
              autocomplete="new-password"
              :placeholder="$t('auth.passwordMin')"
            />
            <AuthStrength v-if="pw.next" :score="pwStrength" />
          </div>
          <AuthPasswordField
            id="acct_conf"
            v-model="pw.confirm"
            :label="$t('auth.confirmPassword')"
            autocomplete="new-password"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
          />
          <div class="md:col-span-2 flex justify-end">
            <button type="submit" class="btn btn-sm btn-primary" :disabled="savingPassword">
              {{ $t('auth.updatePassword') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Subscription (demo) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display text-lg font-bold">Subscription</h3>
          <span class="badge" :class="demoPlan === 'pro' ? 'badge-primary' : 'badge-ghost'">
            Current: {{ currentPlan.name }}
          </span>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="p in plans"
            :key="p.id"
            class="bg-base-100 border ring-soft rounded-box p-6 flex flex-col"
            :class="
              p.id === demoPlan ? 'border-primary ring-1 ring-primary/30' : 'border-base-300'
            "
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-display text-xl font-bold">{{ p.name }}</h4>
                  <span v-if="p.id === demoPlan" class="badge badge-primary badge-sm">Active</span>
                </div>
                <p class="text-sm text-base-content/60 mt-0.5">{{ p.blurb }}</p>
              </div>
              <div class="text-right">
                <div class="font-display text-2xl font-bold leading-none">{{ p.price }}</div>
                <div class="text-[11px] text-base-content/50">{{ p.period }}</div>
              </div>
            </div>
            <ul class="mt-4 space-y-2 flex-1">
              <li v-for="f in p.features" :key="f" class="flex items-start gap-2 text-sm">
                <Check
                  :size="14"
                  class="mt-0.5 shrink-0"
                  :class="p.id === 'pro' ? 'text-primary' : 'text-success'"
                />
                <span class="text-base-content/80">{{ f }}</span>
              </li>
            </ul>
            <button
              class="btn btn-sm mt-5 w-full gap-1.5"
              :class="
                p.id === demoPlan
                  ? 'btn-disabled'
                  : p.id === 'pro'
                    ? 'btn-primary'
                    : 'btn-outline'
              "
              :disabled="p.id === demoPlan"
              @click="demoPlan = p.id"
            >
              <template v-if="p.id === demoPlan"><Check :size="13" /> Current plan</template>
              <template v-else-if="p.id === 'pro'"
                ><ArrowUpCircle :size="13" /> Upgrade to Pro</template
              >
              <template v-else><ArrowDownCircle :size="13" /> Switch to Free</template>
            </button>
          </div>
        </div>
        <p class="mt-3 text-xs text-base-content/50 flex items-center gap-1.5">
          <Info :size="12" />
          Demo only — switching plans changes the badge but not the available features in this
          build.
        </p>
      </div>

      <!-- Billing (mock) -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-6">
        <h3 class="font-display text-lg font-bold">Billing</h3>
        <div class="mt-4 divide-y divide-base-300/70">
          <div v-for="(inv, i) in invoices" :key="i" class="py-3 flex items-center gap-3 text-sm">
            <Receipt :size="15" class="text-base-content/40" />
            <div class="flex-1">
              <div class="font-medium">{{ inv.desc }}</div>
              <div class="text-xs text-base-content/55">{{ inv.date }}</div>
            </div>
            <div class="font-mono">{{ inv.amount }}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm mt-3 gap-1.5" disabled>
          <CreditCard :size="13" /> Manage payment method
        </button>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  Pencil,
  Check,
  Info,
  Receipt,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useAccountProfile, type PlanId } from '~/composables/useAccountProfile'
import { plans } from '~/data/account/plans'
import { ApiClientError } from '~/composables/useApi'
import { passwordStrength, validatePassword } from '~/utils/authValidation'

usePageMeta('pageMeta.accountTitle', 'pageMeta.accountSubtitle')
useHead({ title: 'Account — Exam.one' })

const { t } = useI18n()
const { locale, setLocale } = useI18n()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)
const { profile, initials, saveProfile } = useAccountProfile()
const { changePassword } = useAuth()

const editing = ref(false)
const savingProfile = ref(false)
const profileError = ref('')
const form = reactive({
  name: '',
  email: '',
  examTargetDate: '',
  locale: locale.value as 'en' | 'de',
})

const demoPlan = ref<PlanId>(profile.value.plan)
watch(
  () => profile.value.plan,
  plan => {
    demoPlan.value = plan
  }
)

watch(editing, open => {
  if (open) {
    form.name = profile.value.name
    form.email = profile.value.email
    form.examTargetDate = profile.value.examTargetDate
    form.locale = locale.value as 'en' | 'de'
    profileError.value = ''
  }
})

const currentPlan = computed(() => plans.find(p => p.id === demoPlan.value) ?? plans[0]!)

const statTiles = computed(() => [
  { label: 'Member since', value: '—' },
  { label: 'Current plan', value: currentPlan.value.name },
  { label: 'Exam target', value: `Goethe ${examLevel.value}` },
  { label: 'Exam date', value: formatDate(profile.value.examTargetDate) },
])

const invoices = computed(() => {
  const isPro = demoPlan.value === 'pro'
  return [
    {
      date: '12 Apr 2026',
      desc: isPro ? 'Pro · monthly' : 'Free plan',
      amount: isPro ? '€9.90' : '€0.00',
    },
    {
      date: '12 Mar 2026',
      desc: isPro ? 'Pro · monthly' : 'Free plan',
      amount: isPro ? '€9.90' : '€0.00',
    },
  ]
})

const pw = reactive({ current: '', next: '', confirm: '' })
const savingPassword = ref(false)
const passwordError = ref('')
const passwordSaved = ref(false)
const pwStrength = computed(() => passwordStrength(pw.next))

async function onSaveProfile() {
  savingProfile.value = true
  profileError.value = ''
  try {
    await saveProfile({
      name: form.name.trim() || profile.value.name,
      email: form.email.trim() || profile.value.email,
      examTargetDate: form.examTargetDate,
    })
    if (form.locale !== locale.value) setLocale(form.locale)
    editing.value = false
  } catch (error) {
    profileError.value =
      error instanceof ApiClientError ? error.message : 'Could not save profile'
  } finally {
    savingProfile.value = false
  }
}

async function onChangePassword() {
  passwordError.value = ''
  passwordSaved.value = false
  const pe = validatePassword(pw.next)
  if (!pw.current) {
    passwordError.value = t('auth.currentPassword')
    return
  }
  if (pe) {
    passwordError.value = pe
    return
  }
  if (pw.confirm !== pw.next) {
    passwordError.value = t('auth.passwordMismatch')
    return
  }
  savingPassword.value = true
  try {
    await changePassword({ currentPassword: pw.current, newPassword: pw.next })
    pw.current = ''
    pw.next = ''
    pw.confirm = ''
    passwordSaved.value = true
  } catch (error) {
    passwordError.value =
      error instanceof ApiClientError ? error.message : 'Could not update password'
  } finally {
    savingPassword.value = false
  }
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
