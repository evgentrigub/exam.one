<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.appearanceTitle')" :desc="$t('settings.appearanceDesc')" />
      <div class="flex flex-col gap-5">
        <div>
          <span class="label pb-1.5 block">
            <span class="label-text text-sm font-medium">{{ $t('settings.themeLabel') }}</span>
          </span>
          <SetChoice
            :value="theme"
            cols="grid-cols-2 max-w-sm"
            :options="themeOptions"
            @update:value="onTheme"
          />
        </div>
      </div>
    </SetCard>

    <SetCard>
      <SetHead :title="$t('settings.languageTitle')" :desc="$t('settings.languageDesc')" />
      <SetChoice
        :value="String(locale)"
        cols="grid-cols-1 sm:grid-cols-3"
        :options="languageOptions"
        @update:value="onLocale"
      />
      <div
        class="mt-4 flex items-start gap-2.5 rounded-field bg-base-200 p-3.5 text-sm text-base-content/70"
      >
        <Languages :size="15" class="mt-0.5 shrink-0 opacity-60" />
        <span class="text-pretty">{{ $t('settings.languageHint') }}</span>
      </div>
    </SetCard>
  </div>
</template>

<script setup lang="ts">
import { Cake, Languages, Sun } from 'lucide-vue-next'
import type { Theme } from '~/composables/useTheme'
import type { LanguageOptions } from '~/utils/types'
import type { SetChoiceOption } from '~/components/settings/SetChoice.vue'

const { theme, setTheme } = useTheme()
const { locale, setLocale, t } = useI18n()

const themeOptions = computed<SetChoiceOption[]>(() => [
  { id: 'light', label: t('settings.themeLight'), icon: Sun, desc: t('settings.themeLightDesc') },
  {
    id: 'cupcake',
    label: t('settings.themeCupcake'),
    icon: Cake,
    desc: t('settings.themeCupcakeDesc'),
  },
])

const languageOptions = computed<SetChoiceOption[]>(() => [
  { id: 'en', label: 'English', desc: t('settings.langEnDesc') },
  { id: 'de', label: 'Deutsch', desc: t('settings.langDeDesc') },
  { id: 'ru', label: 'Русский', desc: t('settings.langRuDesc'), disabled: true },
])

function onTheme(id: string) {
  setTheme(id as Theme)
}

function onLocale(id: string) {
  if (id === 'en' || id === 'de') setLocale(id as LanguageOptions)
}
</script>
