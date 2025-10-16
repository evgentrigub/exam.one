<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Brand and Language Selector -->
        <div class="flex items-center space-x-3">
          <NuxtLink 
            to="/" 
            class="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <!-- {{ $t('nav.home') }} -->
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">{{ $t('home.title') }}</span>
          </NuxtLink>
          <!-- Language Settings Icon -->
          <button
            type="button"
            class="ml-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Language settings"
            @click="openLanguageModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-6">
          <div ref="dropdownRef" class="relative">
            <button
              type="button"
              :aria-expanded="isDropdownOpen"
              aria-haspopup="true"
              class="inline-flex items-center gap-x-1.5 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': ['/reading', '/writing'].includes($route.path) }"
              @click="toggleDropdown"
            >
              📝 {{ $t('nav.practice') }}
              <svg 
                class="h-4 w-4 transition-transform duration-200" 
                :class="{ 'rotate-180': isDropdownOpen }" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-show="isDropdownOpen"
                class="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
              >
                <div class="py-1" role="none">
                  <NuxtLink
                    to="/reading"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    :class="{ 'bg-gray-100 text-gray-900': $route.path === '/reading' }"
                    role="menuitem"
                    @click="closeDropdown"
                  >
                    📚 {{ $t('nav.reading') }}
                  </NuxtLink>
                  <NuxtLink
                    to="/writing"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    :class="{ 'bg-gray-100 text-gray-900': $route.path === '/writing' }"
                    role="menuitem"
                    @click="closeDropdown"
                  >
                    ✍️ {{ $t('nav.writing') }}
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>
          <NuxtLink
            to="/dashboard"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/dashboard' }"
          >
            📊 {{ $t('nav.dashboard') }}
          </NuxtLink>
        </div>

      </div>
    </div>

    <!-- Language Settings Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLanguageModalOpen"
        class="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
        style="background-color: rgba(255, 255, 255, 0.1);"
        @click.self="closeLanguageModal"
      >
        <div
          class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">
              {{ $t('settings.title') }}
            </h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeLanguageModal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="space-y-5">
            <!-- Interface Language Selector -->
            <div>
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                </svg>
                {{ $t('settings.interfaceLanguage') }}
              </label>
              <div class="relative">
                <select
                  v-model="tempInterfaceLanguage"
                  class="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
                >
                  <option value="en">🇺🇸 English (United States)</option>
                  <option value="de">🇩🇪 Deutsch (Deutschland)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Target Exam Language Selector -->
            <div>
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ $t('settings.targetLanguage') }}
              </label>
              <p class="text-xs text-gray-500 mb-2">
                {{ $t('settings.targetLanguageDescription') }}
              </p>
              <div class="relative">
                <select
                  v-model="tempTargetLanguage"
                  class="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
                >
                  <option value="de">🇩🇪 Deutsch (German)</option>
                  <option value="en" disabled class="text-gray-400">
                    🇺🇸 English - {{ $t('settings.availableSoon') }}
                  </option>
                  <option value="es" disabled class="text-gray-400">
                    🇪🇸 Español (Spanish) - {{ $t('settings.availableSoon') }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Exam Level Selector -->
            <div>
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ $t('settings.examLevel') }}
              </label>
              <p class="text-xs text-gray-500 mb-2">
                {{ $t('settings.examLevelDescription') }}
              </p>
              <div class="relative">
                <select
                  v-model="tempExamLevel"
                  class="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
                >
                  <option value="A2">A2 - Elementary</option>
                  <option value="C1">C1 - Advanced</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 mt-6">
            <button
              type="button"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="closeLanguageModal"
            >
              {{ $t('settings.cancel') }}
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              @click="saveLanguageSettings"
            >
              {{ $t('settings.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()
const { examLevel, targetLanguage } = storeToRefs(settingsStore)
const { locale } = useI18n()
const { $i18n } = useNuxtApp()

// Dropdown state and functionality
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

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
const saveLanguageSettings = () => {
  // Update interface language
  if (tempInterfaceLanguage.value !== locale.value) {
    $i18n.setLocale(tempInterfaceLanguage.value)
  }
  
  // Update target exam language
  targetLanguage.value = tempTargetLanguage.value
  
  // Update exam level
  examLevel.value = tempExamLevel.value
  
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