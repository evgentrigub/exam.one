<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <h1 class="text-xl font-semibold text-gray-800">
            A2 Reading Exam
          </h1>
          <div>
            <!-- Timer will go here -->
            <slot name="timer" />
          </div>
        </div>
      </div>
    </header>
    <main class="py-8">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template> 