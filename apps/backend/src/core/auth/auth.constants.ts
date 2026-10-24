export const ACCESS_COOKIE = 'exam_one_access'
export const REFRESH_COOKIE = 'exam_one_refresh'

export const ACCESS_TTL_SECONDS = 60 * 15
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30
export const VERIFY_CODE_TTL_MS = 1000 * 60 * 15
export const RESET_TOKEN_TTL_MS = 1000 * 60 * 60

export const BCRYPT_ROUNDS = 10
export const PASSWORD_MAX_LENGTH = 72
export const LOGIN_MAX_FAILURES = 5
export const LOGIN_LOCKOUT_MS = 1000 * 60 * 15

/** Precomputed bcrypt hash used only to equalize login timing when the user is missing. */
export const DUMMY_PASSWORD_HASH =
  '$2b$10$DnUc1l8BTrLDBWcc4UKGj.Vpx9ldoFrEKD9y4Td/qWyJ1BlJenGZW'
