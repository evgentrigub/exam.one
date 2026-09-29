import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    typescript: true,
  },
  dirs: {
    src: ['./components', './composables', './pages', './utils', './data'],
  },
})
  .append({
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'vue/multi-word-component-names': 'off', // Disable for Nuxt pages
      'vue/html-self-closing': 'off',
      // UI copy must go through i18n (i18n/locales/*.json); brand wordmark is exempt.
      'vue/no-bare-strings-in-template': [
        'error',
        {
          allowlist: [
            // Brand wordmark / logo marks
            'Exam',
            '.one',
            'EX',
            'E',
            // Punctuation, units and separators
            '—',
            '·',
            '/',
            '%',
            '(',
            ')',
            ',',
            '.',
            ':',
            '×',
            'x',
            '~',
            '+',
            '-',
            '•',
            '→',
            '←',
            '…',
            '#',
            '!',
            '?',
            '&',
            '|',
            // Nav emoji, decorative numbers
            '📝',
            '📚',
            '✍️',
            '📊',
            '/^[\\d.,%]+$/',
          ],
          attributes: {
            '/.+/': [
              'title',
              'aria-label',
              'aria-placeholder',
              'aria-roledescription',
              'aria-valuetext',
              'placeholder',
              'alt',
            ],
            input: ['placeholder'],
            img: ['alt'],
          },
        },
      ],
    },
  })
  .append({
    // Dev-only component showcase, not shipped UI copy.
    files: ['pages/tooltip-demo.vue'],
    rules: {
      'vue/no-bare-strings-in-template': 'off',
    },
  })
