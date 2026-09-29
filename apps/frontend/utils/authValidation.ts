type TranslateFn = (key: string, ...args: unknown[]) => string

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 72

/** Returns a localized error message, or `''` when the email is valid. */
export function validateEmail(value: string, t: TranslateFn): string {
  if (!value) return t('auth.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('auth.validation.emailInvalid')
  return ''
}

/** Returns a localized error message, or `''` when the password is valid. */
export function validatePassword(value: string, t: TranslateFn): string {
  if (!value) return t('auth.validation.passwordRequired')
  if (value.length < PASSWORD_MIN_LENGTH) {
    return t('auth.validation.passwordTooShort', { min: PASSWORD_MIN_LENGTH })
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return t('auth.validation.passwordTooLong', { max: PASSWORD_MAX_LENGTH })
  }
  return ''
}

/** Returns a localized "required" message for `field` (already localized), or `''`. */
export function validateRequired(value: string, t: TranslateFn, field?: string): string {
  if (value && value.trim()) return ''
  return field
    ? t('auth.validation.fieldRequired', { field })
    : t('auth.validation.required')
}

/** Password strength 0..3 */
export function passwordStrength(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= PASSWORD_MIN_LENGTH) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/[0-9]|[^A-Za-z0-9]/.test(value)) score++
  return score
}
