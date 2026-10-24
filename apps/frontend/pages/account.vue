<template>
  <div class="max-w-[1180px] mx-auto px-6 py-8 lg:px-8 space-y-6">
    <ClientOnly>
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-7">
        <div class="flex items-center gap-4 flex-wrap">
          <div
            class="w-16 h-16 rounded-full bg-primary/10 grid place-items-center text-primary font-display text-xl font-bold"
          >
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-display text-2xl font-bold truncate">{{ profile.name }}</h2>
            <div class="text-sm text-base-content/60 truncate">
              {{
                $t('account.learningLine', { email: profile.email, level: pack.title })
              }}
            </div>
          </div>
          <NuxtLink
            to="/settings?section=profile"
            class="btn btn-outline btn-sm rounded-full gap-1.5"
          >
            <Pencil :size="13" />
            {{ $t('account.editProfile') }}
          </NuxtLink>
        </div>

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

      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display text-lg font-bold">{{ $t('account.subscription') }}</h3>
          <span class="badge" :class="isPro ? 'badge-primary' : 'badge-ghost'">
            {{ $t('account.current', { name: $t(currentPlan.nameKey) }) }}
          </span>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="bg-base-100 border ring-soft rounded-box p-6 flex flex-col"
            :class="
              plan.id === effectivePlan
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-base-300'
            "
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-display text-xl font-bold">{{ $t(plan.nameKey) }}</h4>
                  <span
                    v-if="plan.id === effectivePlan"
                    class="badge badge-primary badge-sm"
                  >
                    {{ $t('account.active') }}
                  </span>
                </div>
                <p class="text-sm text-base-content/60 mt-0.5">{{ $t(plan.blurbKey) }}</p>
              </div>
              <div class="text-right">
                <div class="font-display text-2xl font-bold leading-none">{{ plan.price }}</div>
                <div class="text-[11px] text-base-content/50">{{ $t(plan.periodKey) }}</div>
              </div>
            </div>
            <ul class="mt-4 space-y-2 flex-1">
              <li
                v-for="featureKey in plan.featureKeys"
                :key="featureKey"
                class="flex items-start gap-2 text-sm"
              >
                <Check
                  :size="14"
                  class="mt-0.5 shrink-0"
                  :class="plan.id === 'pro' ? 'text-primary' : 'text-success'"
                />
                <span class="text-base-content/80">{{ $t(featureKey) }}</span>
              </li>
            </ul>
            <button
              type="button"
              class="btn btn-sm mt-5 w-full rounded-full gap-1.5"
              :class="
                plan.id === effectivePlan
                  ? 'btn-disabled'
                  : plan.id === 'pro'
                    ? 'btn-primary'
                    : 'btn-outline'
              "
              :disabled="plan.id === effectivePlan"
              @click="setDemoPlan(plan.id)"
            >
              <template v-if="plan.id === effectivePlan">
                <Check :size="13" /> {{ $t('account.currentPlanBtn') }}
              </template>
              <template v-else-if="plan.id === 'pro'">
                <ArrowUpCircle :size="13" /> {{ $t('account.upgrade') }}
              </template>
              <template v-else>
                <ArrowDownCircle :size="13" /> {{ $t('account.switchFree') }}
              </template>
            </button>
          </div>
        </div>
        <p class="mt-3 text-xs text-base-content/50 flex items-center gap-1.5">
          <Info :size="12" />
          {{ $t('account.demoHint') }}
        </p>
      </div>

      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-6">
        <h3 class="font-display text-lg font-bold">{{ $t('account.billing') }}</h3>
        <div class="mt-4 divide-y divide-base-300/70">
          <div
            v-for="(invoice, index) in invoices"
            :key="index"
            class="py-3 flex items-center gap-3 text-sm"
          >
            <Receipt :size="15" class="text-base-content/40" />
            <div class="flex-1">
              <div class="font-medium">{{ invoice.desc }}</div>
              <div class="text-xs text-base-content/55">{{ invoice.date }}</div>
            </div>
            <div class="font-mono">{{ invoice.amount }}</div>
          </div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm mt-3 gap-1.5" disabled>
          <CreditCard :size="13" /> {{ $t('account.managePayment') }}
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
import { plans } from '~/data/account/plans'

usePageMeta('pageMeta.accountTitle', 'pageMeta.accountSubtitle')

const { t } = useI18n()
useHead({ title: () => `${t('pageMeta.accountTitle')} — Exam.one` })
const { pack } = useActivePack()
const { profile, initials, effectivePlan, memberSince, formatDate, setDemoPlan } =
  useAccountProfile()

const isPro = computed(() => effectivePlan.value === 'pro')
const currentPlan = computed(() => plans.find(plan => plan.id === effectivePlan.value) ?? plans[0]!)

const statTiles = computed(() => [
  { label: t('account.memberSince'), value: memberSince.value },
  { label: t('account.currentPlan'), value: t(currentPlan.value.nameKey) },
  { label: t('account.examTarget'), value: pack.value.title },
  { label: t('account.examDate'), value: formatDate(profile.value.examTargetDate) },
])

const invoices = computed(() => [
  {
    date: '12 Apr 2026',
    desc: isPro.value ? t('account.invoicePro') : t('account.invoiceFree'),
    amount: isPro.value ? '€9.90' : '€0.00',
  },
  {
    date: '12 Mar 2026',
    desc: isPro.value ? t('account.invoicePro') : t('account.invoiceFree'),
    amount: isPro.value ? '€9.90' : '€0.00',
  },
])
</script>
