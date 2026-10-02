/**
 * vue-i18n runtime options. Locales, detection and file loading live in nuxt.config.ts.
 *
 * Polish and Russian have three plural forms, so their messages are written as
 * `one | few | many` and picked by the rules below. Every other locale keeps the
 * default `one | other` choice.
 */

type PluralRule = (choice: number, choicesLength: number) => number

const ONE = 0
const FEW = 1
const MANY = 2
const SLAVIC_FORMS = 3

function isFew(n: number): boolean {
  const lastDigit = n % 10
  const lastTwo = n % 100
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)
}

/** Picks a form index, falling back to the last form when a message has fewer than three. */
function slavicRule(isOne: (n: number) => boolean): PluralRule {
  return (choice, choicesLength) => {
    const n = Math.abs(Math.trunc(choice))
    const form = isOne(n) ? ONE : isFew(n) ? FEW : MANY
    return choicesLength < SLAVIC_FORMS ? Math.min(form, choicesLength - 1) : form
  }
}

// Polish: 1 → one; 2–4, 22–24 … → few; 0, 5–21, 25 … → many
const polish = slavicRule(n => n === 1)

// Russian: 1, 21, 31 … (not 11) → one; 2–4, 22–24 … → few; 0, 5–20, 25 … → many
const russian = slavicRule(n => n % 10 === 1 && n % 100 !== 11)

export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
  pluralRules: {
    pl: polish,
    ru: russian,
  },
}))
