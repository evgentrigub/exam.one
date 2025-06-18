<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Welcome, {{ auth.user }}</h1>
    <button
      @click="logout"
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}

// @ts-ignore
definePageMeta({ middleware: 'auth' })
</script>

<style scoped></style> 