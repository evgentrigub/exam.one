<template>
  <header class="h-14 shrink-0 flex items-center gap-4 px-6 bg-base-100 border-b border-base-300">
    <!-- Page title -->
    <div class="flex-1 min-w-0">
      <ClientOnly>
        <h1 class="font-display text-[17px] font-bold leading-none truncate">{{ title }}</h1>
        <p v-if="subtitle" class="text-xs text-base-content/60 truncate leading-none mt-1">
          {{ subtitle }}
        </p>
      </ClientOnly>
    </div>

    <!-- Right controls -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Language selector -->
      <div class="dropdown dropdown-end">
        <button
          tabindex="0"
          class="btn btn-sm btn-ghost gap-1.5"
          :aria-label="$t('settings.interfaceLanguage')"
        >
          <Globe :size="16" />
          <span class="text-xs font-semibold uppercase">{{ locale }}</span>
          <ChevronDown :size="12" class="opacity-50" />
        </button>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-30 w-48 p-1 mt-1 border border-base-300 shadow"
        >
          <li class="menu-title text-[10px] uppercase tracking-wider">
            {{ $t('settings.interfaceLanguage') }}
          </li>
          <li v-for="o in languages" :key="o.code">
            <a :class="locale === o.code ? 'active' : ''" @click="changeLocale(o.code)">
              <span class="font-mono text-[10px] font-semibold w-5">{{
                o.code.toUpperCase()
              }}</span>
              {{ o.label }}
              <span class="ml-auto text-primary font-bold w-3 text-center">{{
                locale === o.code ? '✓' : ''
              }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Theme selector -->
      <div class="dropdown dropdown-end">
        <button
          tabindex="0"
          class="btn btn-sm btn-ghost btn-circle"
          :aria-label="$t('shell.theme')"
        >
          <Cake v-if="theme === 'cupcake'" :size="16" />
          <Sun v-else :size="16" />
        </button>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-30 w-40 p-1 mt-1 border border-base-300 shadow"
        >
          <li class="menu-title text-[10px] uppercase tracking-wider">{{ $t('shell.theme') }}</li>
          <li v-for="t in availableThemes" :key="t.value">
            <a :class="theme === t.value ? 'active' : ''" @click="setTheme(t.value)">
              <span>{{ t.icon }}</span>
              <span class="capitalize">{{ t.label }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Profile button -->
      <div class="dropdown dropdown-end">
        <button
          tabindex="0"
          class="flex items-center gap-2 rounded-full pl-1 pr-2 h-9 hover:bg-base-200 transition-colors"
          :aria-label="$t('nav.account')"
        >
          <span
            class="w-8 h-8 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold text-xs"
          >
            {{ initials }}
          </span>
          <ChevronDown :size="14" class="opacity-50" />
        </button>
        <div
          tabindex="0"
          class="dropdown-content bg-base-100 rounded-box z-30 w-60 p-1.5 mt-1 border border-base-300 shadow"
        >
          <div class="px-3 py-2 flex items-center gap-3">
            <span
              class="w-9 h-9 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold text-xs"
            >
              {{ initials }}
            </span>
            <div class="min-w-0">
              <div class="text-sm font-semibold leading-tight truncate">{{ profile.name }}</div>
              <div class="text-[11px] text-base-content/60 truncate">{{ profile.email }}</div>
            </div>
          </div>
          <div class="px-3 pb-2">
            <span
              class="badge badge-sm"
              :class="profile.plan === 'pro' ? 'badge-primary' : 'badge-ghost'"
            >
              {{ profile.plan === 'pro' ? $t('shell.proPlan') : $t('shell.freePlan') }}
            </span>
          </div>
          <div class="h-px bg-base-300 my-1" />
          <NuxtLink
            to="/account"
            class="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm hover:bg-base-200"
          >
            <User :size="15" /> {{ $t('shell.accountSubscription') }}
          </NuxtLink>
          <NuxtLink
            to="/progress"
            class="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm hover:bg-base-200"
          >
            <TrendingUp :size="15" /> {{ $t('shell.myProgress') }}
          </NuxtLink>
          <div class="h-px bg-base-300 my-1" />
          <button
            class="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm text-base-content/70 hover:bg-base-200"
          >
            <LogOut :size="15" /> {{ $t('shell.signOut') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Globe, ChevronDown, Cake, Sun, User, TrendingUp, LogOut } from 'lucide-vue-next'

defineProps<{
  title?: string
  subtitle?: string
}>()

const { theme, setTheme, availableThemes } = useTheme()
const { profile, initials } = useAccountProfile()
const { locale, setLocale } = useI18n()

const languages: { code: 'en' | 'de'; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

function changeLocale(code: 'en' | 'de') {
  if (code !== locale.value) setLocale(code)
}
</script>
