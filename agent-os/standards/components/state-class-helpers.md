# State-Driven Class Helpers

Map component state to daisyUI utility strings via named helpers in `<script setup>`. Don't inline branchy class logic in templates.

```vue
<script setup lang="ts">
const wordCountColor = computed(() => {
  if (wordCount.value < min) return 'text-error'
  if (wordCount.value > max) return 'text-error'
  return 'text-success'
})

function getOptionClass(index: number) {
  if (!isAnswered.value) return 'border-base-300 hover:border-primary'
  if (index === correctAnswer) return 'border-success bg-success/10'
  if (index === selectedAnswer.value) return 'border-error bg-error/10'
  return 'border-base-200 bg-base-200'
}
</script>

<template>
  <button :class="getOptionClass(i)">...</button>
  <span :class="wordCountColor">{{ status }}</span>
</template>
```

Rules:

- Keep the helper in `<script setup>`; return a string of daisyUI utilities (see `theme-tokens.md`)
- `computed` for stateless derivations; plain `function` when it takes arguments (index, id, …)
- Don't inline more than one ternary in a `:class` binding — promote to a helper
- **Promote to a composable** when the same tiering logic repeats across components (score → color tiers used by quiz results, dashboard, cards): extract `useScoreTier`, `useWordCountState`, etc.
- Naming: any clear name is fine; no required suffix
