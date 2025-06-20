<template>
  <header class="bg-white/80 backdrop-blur-md shadow-sm">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="text-lg font-bold text-teal-600">
            Exam Simulator
          </NuxtLink>
          <div class="hidden md:flex md:space-x-8">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">
              Home
            </NuxtLink>
            <NuxtLink to="#" class="text-gray-600 hover:text-gray-900">
              Practice
            </NuxtLink>
            <NuxtLink to="#" class="text-gray-600 hover:text-gray-900">
              Dashboard
            </NuxtLink>
          </div>
        </div>
        <div class="text-gray-600">
          <span>Language: English</span>
        </div>
      </div>
    </nav>
  </header>
</template> 