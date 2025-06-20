<template>
  <div class="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-center text-gray-800 mb-4">
      Goethe Exam Simulator
    </h1>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          required
        >
      </div>
      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          required
        >
      </div>
      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      >
        Log In
      </button>
      <p v-if="error" class="mt-2 text-center text-sm text-red-600">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const router = useRouter()

function handleLogin() {
  if (username.value === 'admin' && password.value === 'admin') {
    error.value = null
    router.push('/exam')
  }
  else {
    error.value = 'Invalid username or password.'
  }
}
</script> 