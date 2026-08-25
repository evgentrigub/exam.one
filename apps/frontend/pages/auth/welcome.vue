<template>
  <AuthPageHeader :title="$t('auth.welcomeTitle')" :subtitle="$t('auth.welcomeBody')">
    <AuthDone :cta-label="$t('auth.goToDashboard')" to="/dashboard" />
  </AuthPageHeader>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: 'You’re all set — Exam.one' })
</script>
