<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.planTitle')" />
      <div class="rounded-box bg-base-200 border border-base-300 p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="font-display text-2xl font-bold">{{ $t(currentPlan.nameKey) }}</span>
              <span
                class="badge badge-sm"
                :class="isPro ? 'badge-primary' : 'badge-ghost'"
              >
                {{ $t('settings.planActive') }}
              </span>
            </div>
            <p class="text-sm text-base-content/65 mt-1">{{ $t(currentPlan.blurbKey) }}</p>
          </div>
          <div class="text-right">
            <div class="font-display text-2xl font-bold leading-none">{{ currentPlan.price }}</div>
            <div class="text-xs text-base-content/55 mt-1">{{ $t(currentPlan.periodKey) }}</div>
          </div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 mt-4">
        <div class="rounded-field bg-base-100 border border-base-300 p-3.5">
          <div class="text-[11px] uppercase tracking-wider text-base-content/50">
            {{ $t('settings.planMemberSince') }}
          </div>
          <div class="font-semibold text-sm mt-1">{{ memberSince }}</div>
        </div>
        <div class="rounded-field bg-base-100 border border-base-300 p-3.5">
          <div class="text-[11px] uppercase tracking-wider text-base-content/50">
            {{ $t('settings.planMockExams') }}
          </div>
          <div class="font-semibold text-sm mt-1">{{ $t('settings.planMockExamsValue') }}</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-base-300">
        <template v-if="isPro">
          <button
            type="button"
            class="btn btn-sm btn-outline rounded-field gap-1.5"
            disabled
            :title="$t('settings.planDemo')"
          >
            {{ $t('settings.planManage') }}
            <ExternalLink :size="14" />
          </button>
          <button
            type="button"
            class="btn btn-sm btn-ghost rounded-field text-base-content/60"
            @click="setDemoPlan('free')"
          >
            {{ $t('settings.planCancel') }}
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="btn btn-sm btn-primary rounded-field gap-1.5"
            @click="setDemoPlan('pro')"
          >
            <ArrowUpCircle :size="14" /> {{ $t('settings.planUpgrade') }}
          </button>
          <span class="text-sm text-base-content/60">{{ $t('settings.planUpgradeHint') }}</span>
        </template>
      </div>
      <p class="mt-3 text-xs text-base-content/50 flex items-center gap-1.5">
        <Info :size="12" /> {{ $t('settings.planDemo') }}
      </p>
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpCircle, ExternalLink, Info } from 'lucide-vue-next'
import { plans } from '~/data/account/plans'

const { effectivePlan, memberSince, setDemoPlan } = useAccountProfile()

const currentPlan = computed(() => plans.find(plan => plan.id === effectivePlan.value) ?? plans[0]!)
const isPro = computed(() => effectivePlan.value === 'pro')
</script>
