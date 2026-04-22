<template>
  <div class="app-shell flex">
    <AppSidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <AppTopbar :title="pageTitle" :subtitle="pageSubtitle" />
      <main class="flex-1 overflow-y-auto bg-base-200">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const pageTitle = useState<string>('pageTitle', () => 'Exam.one')
const pageSubtitle = useState<string>('pageSubtitle', () => '')
</script>
