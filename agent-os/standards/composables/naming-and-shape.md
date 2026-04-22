# Composable Naming & Return Shape

## Naming

- File + export: `use<Feature><What>.ts` → `useReadingGeneration`, `useWritingReview`, `useWritingMode`
- One composable per file; file name matches the exported function exactly (camelCase)
- Prefix `use*` only for composables; don't prefix utilities or pure helpers
- Scope by feature area; don't create cross-cutting mega-composables (split `useReading*` and `useWriting*`)

## Shape

Return a single object with named members. Group with two section comments only: `// State` and `// Methods`.

```ts
export const useReadingGeneration = () => {
  const state = ref<GenerationState>({ ... })

  const generate = async (...) => { ... }
  const retry = async () => { ... }
  const clear = () => { ... }

  return {
    // State
    isGenerating: computed(() => state.value.isGenerating),
    error: computed(() => state.value.error),

    // Methods
    generate,
    retry,
    clear,
  }
}
```

## Exposing state

- **Module-scoped (singleton) state** (`ref` declared outside the factory): expose as `readonly(...)` so callers cannot mutate shared state directly — mutations go through named methods.
- **Per-caller state** (`ref` declared inside the factory): may be exposed writable; each caller has its own copy.

```ts
// Singleton — readonly outside
const theme = useState<Theme>('theme', () => 'light')
return { theme: readonly(theme), setTheme }

// Per-caller — writable is fine
const currentMode = ref<WritingMode>('quick')
return { currentMode, changeMode }
```

## Return types

- Prefer inferring — do not annotate the return object type unless it's exported to another package
- Export domain interfaces (`QuizProgress`, `ModelAnswerRecord`) from the composable file via `export interface ...` so components can type props

## Rules

- Return `computed` refs for derived state (not raw `ref` when the value is derived)
- Do not return reactive objects (`reactive({...})`) from the public surface — return individual refs/computeds
- Timers, listeners, subscriptions: clean up in `onUnmounted`
