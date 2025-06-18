import { defineStore } from 'pinia'
import { ref } from 'vue'
import bcrypt from 'bcryptjs'

const ADMIN_USERNAME = 'admin'
// bcrypt hash for the string 'admin' generated with 10 salt rounds
const ADMIN_PASSWORD_HASH = '$2a$10$gZ6cmWEAV6jEsMrBIKLabudM3xdMjfo4LzwYHlBP2XT3rFfSBGnBm'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<string | null>(null)
  const authenticated = ref(false)

  function login(username: string, password: string): boolean {
    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
      user.value = username
      authenticated.value = true
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    authenticated.value = false
  }

  return { user, authenticated, login, logout }
}, {
  persist: {
    paths: ['user', 'authenticated']
  }
}) 