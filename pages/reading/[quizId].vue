<template>
  <div class="max-w-[1240px] mx-auto p-6">

    <!-- Page header -->
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <NuxtLink to="/exercises?skill=reading" class="btn btn-ghost btn-sm gap-1.5">
        <ArrowLeft :size="14" />
        Back
      </NuxtLink>
      <h1 class="text-lg font-semibold truncate">{{ text?.title }}</h1>
      <span class="level-pip">{{ text?.difficulty }}</span>
      <span class="level-pip capitalize">{{ text?.textType }}</span>
    </div>

    <!-- 2-col layout -->
    <div class="grid lg:grid-cols-2 gap-5 items-start">

      <!-- Left: text card (sticky) -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden lg:sticky lg:top-4">
        <div class="p-4 border-b border-base-300 flex items-center gap-2 flex-wrap">
          <span class="level-pip flex items-center gap-1">
            <Clock :size="11" />
            {{ text?.estimatedReadingTime }} min
          </span>
          <span class="level-pip flex items-center gap-1">
            <AlignLeft :size="11" />
            {{ text?.wordCount }} words
          </span>
          <span class="level-pip capitalize">{{ text?.textType }}</span>
        </div>
        <div class="p-5 overflow-y-auto max-h-[calc(100vh-220px)]">
          <p class="text-sm leading-relaxed whitespace-pre-line">{{ text?.content }}</p>
        </div>
      </div>

      <!-- Right: Quiz session -->
      <QuizSession v-if="text" :text="text" @finish="goBack" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Clock, AlignLeft } from 'lucide-vue-next'
import type { GermanText } from '~/utils/types'
import { useReadingTexts } from '~/composables/useReadingTexts'
import QuizSession from '~/components/reading/QuizSession.vue'

usePageMeta('Reading Exercise', 'Reading')

const route = useRoute()
const router = useRouter()
const { getTexts } = useReadingTexts()

const quizId = computed(() => String(route.params['quizId'] || ''))
const text = computed<GermanText | null>(() => getTexts().find(t => t.id === quizId.value) || null)

watchEffect(() => {
  if (text.value) {
    usePageMeta(text.value.title, 'Reading')
  }
})

if (!text.value) {
  navigateTo('/exercises?skill=reading', { replace: true })
}

function goBack() {
  router.push('/exercises?skill=reading')
}

useHead({ title: computed(() => text.value ? `${text.value.title} – Quiz` : 'Reading Quiz') })

definePageMeta({ preload: false })
</script>
