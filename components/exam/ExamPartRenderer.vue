<script setup lang="ts">
import type { ExamPart1, ExamPart2, ExamPart3, ExamPart4 } from '~/types/exam'
import ExamPart1Component from './ExamPart1.vue'
import ExamPart2Component from './ExamPart2.vue'
import ExamPart3Component from './ExamPart3.vue'
import ExamPart4Component from './ExamPart4.vue'

type ExamPart = ExamPart1 | ExamPart2 | ExamPart3 | ExamPart4

defineProps<{
  part: ExamPart
}>()
</script>

<template>
  <div>
    <ExamPart1Component v-if="part.type === 'MATCHING_SITUATION_TO_AD'" :part="part" />
    <ExamPart2Component v-else-if="part.type === 'MULTIPLE_CHOICE'" :part="part" />
    <ExamPart3Component v-else-if="part.type === 'MATCHING_OPINION_TO_WEBSITE'" :part="part" />
    <ExamPart4Component v-else-if="part.type === 'TRUE_FALSE'" :part="part" />
  </div>
</template> 