<template>
  <div class="bg-base-100 shadow-sm border-b">
    <nav class="navbar container mx-auto">
      <div class="navbar-start">
        <NuxtLink to="/" class="btn btn-ghost normal-case gap-2">
          <div
            class="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"
              />
            </svg>
          </div>
          <span class="text-xl font-bold">{{ $t('home.title') }}</span>
        </NuxtLink>

        <!-- Language Settings Icon -->
        <button
          type="button"
          class="btn btn-ghost btn-circle"
          aria-label="Language settings"
          @click="openLanguageModal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      <div class="navbar-end gap-2">
        <!-- Practice Dropdown -->
        <div class="dropdown dropdown-end">
          <label
            tabindex="0"
            class="btn btn-ghost gap-1"
            :class="{ 'btn-active': ['/reading', '/writing'].includes($route.path) }"
          >
            📝 {{ $t('nav.practice') }}
            <svg
              class="h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </label>
          <ul
            tabindex="0"
            class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2"
          >
            <li>
              <NuxtLink to="/reading" :class="{ active: $route.path === '/reading' }">
                📚 {{ $t('nav.reading') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/writing" :class="{ active: $route.path === '/writing' }">
                ✍️ {{ $t('nav.writing') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Dashboard Link -->
        <NuxtLink
          to="/dashboard"
          class="btn btn-ghost"
          :class="{ 'btn-active': $route.path === '/dashboard' }"
        >
          📊 {{ $t('nav.dashboard') }}
        </NuxtLink>

        <!-- Theme Switcher -->
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost gap-1">
            <span>{{ currentThemeIcon }}</span>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </label>
          <div
            tabindex="0"
            class="dropdown-content shadow-lg bg-base-100 rounded-box mt-2 p-4 w-[400px]"
          >
            <div class="grid grid-cols-2 gap-4">
              <!-- Available Themes Column -->
              <div>
                <div class="text-xs font-semibold uppercase opacity-60 mb-2 px-2">
                  Available Themes
                </div>
                <ul class="menu p-0">
                  <li v-for="themeOption in availableThemes" :key="themeOption.value">
                    <a
                      :class="{ active: theme === themeOption.value }"
                      @click="setTheme(themeOption.value)"
                    >
                      <span>{{ themeOption.icon }}</span>
                      <span>{{ themeOption.label }}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>

  <!-- Language Settings Modal -->
  <input v-model="isLanguageModalOpen" type="checkbox" class="modal-toggle" />
  <div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 class="font-bold text-2xl">{{ $t('settings.title') }}</h3>
      </div>

      <!-- Modal Body with proper form controls -->
      <form class="space-y-6" @submit.prevent="saveLanguageSettings">
        <!-- Interface Language -->
        <fieldset class="border border-base-300 rounded-lg p-4 shadow-sm">
          <legend class="text-sm font-semibold flex items-center gap-2 px-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            {{ $t('settings.interfaceLanguage') }}
          </legend>
          <select
            v-model="tempInterfaceLanguage"
            class="select select-bordered select-primary w-full shadow"
          >
            <option value="en">🇺🇸 English (United States)</option>
            <option value="de">🇩🇪 Deutsch (Deutschland)</option>
          </select>
        </fieldset>

        <!-- Target Exam Language -->
        <fieldset class="border border-base-300 rounded-lg p-4 shadow-sm">
          <legend class="text-sm font-semibold flex items-center gap-2 px-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ $t('settings.targetLanguage') }}
          </legend>
          <span class="text-xs opacity-60 block mb-2">{{
            $t('settings.targetLanguageDescription')
          }}</span>
          <select
            v-model="tempTargetLanguage"
            class="select select-bordered select-primary w-full shadow"
          >
            <option value="de">🇩🇪 Deutsch (German)</option>
            <option value="en" disabled>🇺🇸 English - {{ $t('settings.availableSoon') }}</option>
            <option value="es" disabled>
              🇪🇸 Español (Spanish) - {{ $t('settings.availableSoon') }}
            </option>
          </select>
        </fieldset>

        <!-- Exam Level -->
        <fieldset class="border border-base-300 rounded-lg p-4 shadow-sm">
          <legend class="text-sm font-semibold flex items-center gap-2 px-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ $t('settings.examLevel') }}
          </legend>
          <span class="text-xs opacity-60 block mb-2">{{
            $t('settings.examLevelDescription')
          }}</span>
          <select
            v-model="tempExamLevel"
            class="select select-bordered select-primary w-full shadow"
          >
            <option value="A2">A2 - Elementary</option>
            <option value="C1">C1 - Advanced</option>
          </select>
        </fieldset>

        <!-- Modal Actions -->
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeLanguageModal">
            {{ $t('settings.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary">
            {{ $t('settings.save') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal backdrop -->
    <label class="modal-backdrop" @click="closeLanguageModal">Close</label>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()
const { examLevel, targetLanguage } = storeToRefs(settingsStore)
const { locale, setLocale } = useI18n()

// Theme management
const { theme, setTheme, currentThemeIcon, availableThemes } = useTheme()

// Dropdown state and functionality
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Language modal state
const isLanguageModalOpen = ref(false)
const tempInterfaceLanguage = ref<'en' | 'de'>(locale.value as 'en' | 'de')
const tempTargetLanguage = ref<'de' | 'en' | 'es'>(targetLanguage.value)
const tempExamLevel = ref<'A2' | 'C1'>(examLevel.value)

/**
 * Opens the language settings modal and initializes temp values
 */
const openLanguageModal = () => {
  tempInterfaceLanguage.value = locale.value as 'en' | 'de'
  tempTargetLanguage.value = targetLanguage.value
  tempExamLevel.value = examLevel.value
  isLanguageModalOpen.value = true
}

/**
 * Closes the language settings modal without saving
 */
const closeLanguageModal = () => {
  isLanguageModalOpen.value = false
}

/**
 * Saves language settings and closes the modal
 */
const saveLanguageSettings = async () => {
  // Update interface language
  if (tempInterfaceLanguage.value !== locale.value) {
    setLocale(tempInterfaceLanguage.value)
  }

  // Update target exam language
  targetLanguage.value = tempTargetLanguage.value

  // Update exam level
  examLevel.value = tempExamLevel.value

  await settingsStore.persist()
  closeLanguageModal()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Close modals on escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
    closeLanguageModal()
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>
