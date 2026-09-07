<template><PackExerciseSession :key="`${pack.packId}:${skill}:${exerciseId}`" :pack-id="pack.packId" :skill="skill" :exercise-id="exerciseId" /></template>
<script setup lang="ts">
import type { SkillId } from '@exam-one/exam-packs'
const route = useRoute()
const { pack } = useActivePack()
const skill = computed(() => String(route.params['skill']) as SkillId)
const exerciseId = computed(() => String(route.params['exerciseId']))
</script>
