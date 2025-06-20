<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-gray-800">
    <TheHeader />
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
    <TheFooter />
  </div>
</template> 