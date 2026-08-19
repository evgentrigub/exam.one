# Import Aliases

Always use the `~/` alias for project imports. Never use `../` or `../../` to reach across folders — not even for sibling files.

```ts
// Good
import type { ReadingExercise } from '~/utils/exercises/reading'
import { useProgress } from '~/composables/useProgress'
import QuestionCard from '~/components/reading/QuestionCard.vue'
import TaskDescriptionCard from '~/components/writing/TaskDescriptionCard.vue'

// Bad
import type { ReadingExercise } from '../../utils/exercises/reading'
import QuestionCard from './QuestionCard.vue'
```

Rules:

- Project code: use `~/` (Nuxt resolves to the project root)
- Third-party packages: bare specifier (`pinia`, `vue`, `@vueuse/core`)
- Relative `./` is reserved for co-located pairs only (`Component.vue` + `Component.test.ts`) — not in use today

**Enforce via ESLint** (`eslint.config.js`):

```js
'no-restricted-imports': ['error', {
  patterns: [
    { group: ['../*', '../../*'], message: 'Use ~/ alias instead of relative parent imports.' },
    { group: ['./*.vue'], message: 'Use ~/ alias even for sibling imports.' }
  ]
}]
```

Why: grep-ability, safe file moves, and one obvious way to do it.
