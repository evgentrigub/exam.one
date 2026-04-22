<template>
  <header class="h-14 shrink-0 flex items-center gap-4 px-6 bg-base-100 border-b border-base-300">
    <!-- Page title -->
    <div class="flex-1 min-w-0">
      <h1 class="text-sm font-semibold text-base-content truncate">{{ title }}</h1>
      <p v-if="subtitle" class="text-xs text-base-content/50 truncate leading-none mt-0.5">{{ subtitle }}</p>
    </div>

    <!-- Right controls -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Theme switcher -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-sm btn-circle" title="Switch theme">
          <Palette :size="16" />
        </label>
        <div tabindex="0" class="dropdown-content shadow-lg bg-base-100 rounded-box mt-2 p-3 w-52 z-50">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-2 px-1">Theme</p>
          <ul class="menu p-0 gap-0.5">
            <li v-for="t in availableThemes" :key="t.value">
              <a
                class="text-sm py-1.5"
                :class="{ 'active': theme === t.value }"
                @click="setTheme(t.value)"
              >
                <span>{{ t.icon }}</span>
                <span>{{ t.label }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Settings button -->
      <button
        class="btn btn-ghost btn-sm btn-circle"
        title="Settings"
        @click="openSettings"
      >
        <Settings :size="16" />
      </button>

      <!-- Avatar -->
      <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <User :size="14" class="text-primary" />
      </div>
    </div>
  </header>

  <!-- Settings modal -->
  <input v-model="isSettingsOpen" type="checkbox" class="modal-toggle" />
  <div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box max-w-lg">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
          <Settings :size="18" class="text-primary" />
        </div>
        <h3 class="font-bold text-xl">{{ $t('settings.title') }}</h3>
      </div>

      <form class="space-y-4" @submit.prevent="saveSettings">
        <fieldset class="border border-base-300 rounded-field p-4">
          <legend class="text-xs font-semibold px-2">{{ $t('settings.interfaceLanguage') }}</legend>
          <select v-model="tempLocale" class="select select-bordered select-sm w-full">
            <option value="en">🇺🇸 English</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </fieldset>

        <fieldset class="border border-base-300 rounded-field p-4">
          <legend class="text-xs font-semibold px-2">{{ $t('settings.examLevel') }}</legend>
          <select v-model="tempLevel" class="select select-bordered select-sm w-full">
            <option value="A2">A2 — Elementary</option>
            <option value="C1">C1 — Advanced</option>
          </select>
        </fieldset>

        <div class="modal-action mt-4">
          <button type="button" class="btn btn-ghost btn-sm" @click="isSettingsOpen = false">
            {{ $t('settings.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary btn-sm">
            {{ $t('settings.save') }}
          </button>
        </div>
      </form>
    </div>
    <label class="modal-backdrop" @click="isSettingsOpen = false">Close</label>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Palette, Settings, User } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'

defineProps<{
  title?: string
  subtitle?: string
}>()

const { theme, setTheme, availableThemes } = useTheme()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)
const { locale, setLocale } = useI18n()

const isSettingsOpen = ref(false)
const tempLocale = ref<'en' | 'de'>(locale.value as 'en' | 'de')
const tempLevel = ref<'A2' | 'C1'>(examLevel.value)

function openSettings() {
  tempLocale.value = locale.value as 'en' | 'de'
  tempLevel.value = examLevel.value
  isSettingsOpen.value = true
}

function saveSettings() {
  if (tempLocale.value !== locale.value) setLocale(tempLocale.value)
  examLevel.value = tempLevel.value
  isSettingsOpen.value = false
}
</script>
