export function validateEmail(value: string): string {
  if (!value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
  return ''
}

export function validatePassword(value: string): string {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  return ''
}

export function validateRequired(value: string, field = 'This field'): string {
  if (!value || !value.trim()) return `${field} is required`
  return ''
}

/** Password strength 0..3 */
export function passwordStrength(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/[0-9]|[^A-Za-z0-9]/.test(value)) score++
  return score
}
