<template>
  <teleport to="body">
    <transition name="fade" appear>
      <div v-if="modelValue && text" class="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <!-- Modal -->
        <div class="absolute inset-0 flex items-start justify-center overflow-y-auto p-4 md:p-8" @keydown.esc="close">
          <div class="w-full max-w-4xl mt-8 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <button 
                  @click="close"
                  class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  {{ $t('practice.reading.backToSelection') }}
                </button>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{{ text.textType }}</span>
                  <span>A2 • {{ text.wordCount }} Wörter</span>
                </div>
              </div>
            </div>

            <!-- Text Content -->
            <div class="p-8">
              <div class="flex items-center mb-6">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">{{ text.title }}</h2>
              </div>
              
              <div class="prose prose-lg max-w-none h-[55vh] md:h-[550px] overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div class="whitespace-pre-line text-gray-800 leading-relaxed font-medium">{{ text.content }}</div>
              </div>

              <!-- Start Questions Button -->
              <div class="mt-8 pt-6 border-t border-gray-200">
                <div class="bg-blue-50 rounded-xl p-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">Ready for the questions?</h3>
                        <p class="text-gray-600">Test your text comprehension with {{ text.questions?.length || 4 }} multiple-choice questions.</p>
                      </div>
                    </div>
                    <button 
                      @click="goToQuiz"
                      class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                    >
                      {{ $t('practice.reading.startQuestions') }}
                      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import type { GermanText } from '~/utils/types'

interface Props {
  modelValue: boolean
  text: GermanText | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()

function close() {
  emit('update:modelValue', false)
}

function goToQuiz() {
  if (!props.text) return
  emit('update:modelValue', false)
  router.push(`/reading/${props.text.id}`)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 150ms ease-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
