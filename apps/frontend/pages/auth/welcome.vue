<template>
  <AuthPageHeader :title="$t('auth.welcomeTitle')" :subtitle="$t('auth.welcomeBody')">
    <AuthDone :cta-label="$t('auth.goToDashboard')" to="/dashboard" />
  </AuthPageHeader>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
const { t } = useI18n()
useHead({ title: () => `${t('auth.welcomeTitle')} — Exam.one` })
</script>
