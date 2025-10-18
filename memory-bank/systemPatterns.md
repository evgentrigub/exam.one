# System Patterns: Exam.one

## Architecture Overview

### High-Level Structure
```
Nuxt 3 SPA (Client-Side Rendering)
├── Pages (route-driven, auto-imported)
├── Components (atomic design hierarchy)
├── Composables (reusable logic, state management)
├── Stores (Pinia for global state)
├── Data (embedded fixtures: texts, topics, prompts)
├── Utils (helpers, types, analysis functions)
├── Server API (optional AI features via OpenAI)
└── Layouts (consistent navigation structure)
```

### Data Flow Pattern
```
User Interaction
    ↓
Vue Component (UI)
    ↓
Composable/Store (Business Logic)
    ↓
localStorage/IndexedDB (Persistence)
    ↓
Component Updates (Reactive State)
```

**Unidirectional flow**: Props down, events up. Shared state lives in composables (`useProgress`, `useWritingTopics`) or Pinia stores (`settingsStore`).

## Key Technical Decisions

### 1. Client-Side Data Storage
**Decision**: Use localStorage for all user progress, drafts, and session data. No backend database.  
**Rationale**: Keeps the app offline-capable, simple deployment, no server costs, privacy-preserving.  
**Trade-off**: Data lives only in browser (no cross-device sync), limited to ~5-10 MB per domain.

### 2. Embedded Content Fixtures
**Decision**: All exam texts and writing topics stored as TypeScript files (`data/german-texts.ts`, `data/writing/exerciseTopics.ts`).  
**Rationale**: Ensures offline availability, simplifies deployment, version-controlled content.  
**Trade-off**: Content changes require rebuild and redeploy; no dynamic content updates.

### 3. Nuxt 3 Auto-Imports
**Decision**: Leverage Nuxt's auto-import for components, composables, and utils.  
**Rationale**: Reduces boilerplate, faster development, cleaner code.  
**Pattern**: All files in `components/`, `composables/`, `utils/` are auto-imported by name.

### 4. Composables for Business Logic
**Decision**: Extract reusable logic into composables (`useProgress`, `useWritingTopics`, `useWritingMode`, `useWritingReview`).  
**Rationale**: Separation of concerns, testability, reusability across components.  
**Pattern**: Composables return reactive state and functions, never mutate external state directly.

### 5. Component Hierarchy (Atomic Design)
**Decision**: Organize components by feature domain and complexity level.  
**Structure**:
- `components/ui/` - Reusable atoms (Tooltip)
- `components/reading/` - Reading feature components (TextCard, QuestionCard, QuizSession, ReadingModal)
- `components/writing/` - Writing feature components (WritingTopicCard, TaskDescriptionCard, InstructionsCard, TextEditorCard, WritingSession, WritingFeedback)

**Rationale**: Clear boundaries, easy to find components, scalable structure.

## Design Patterns in Use

### Pattern: Composable for Stateful Logic
**Example**: `useProgress.ts`
```typescript
export function useProgress() {
  // Reactive state
  const progress = ref<QuizProgress[]>([])
  
  // Functions that modify state
  function saveProgress(result: QuizResult) { ... }
  function getProgress(textId: string) { ... }
  
  // Computed derived state
  const completedCount = computed(() => progress.value.filter(p => p.completed).length)
  
  return { progress, saveProgress, getProgress, completedCount }
}
```

**When to use**: Any time you need stateful logic used by multiple components.

### Pattern: Feature-Based Component Composition
**Example**: Writing Session
```
WritingSession.vue (orchestrator)
├── TaskDescriptionCard.vue (context & tips)
├── InstructionsCard.vue (requirements)
└── TextEditorCard.vue (input + word count)
```

**Rationale**: Each card is self-contained, testable, and reusable. Parent coordinates data flow.

### Pattern: Modal for Focused Interactions
**Example**: `ReadingModal.vue` for text reading
- Opened from text list
- Displays full text content
- Closes with ESC or click-outside
- Transitions to quiz route on "Start Questions"

**When to use**: For focused, temporary content that doesn't need its own route.

### Pattern: Dynamic Route for Deep Linking
**Example**: `/reading/[quizId].vue`
- Shareable URL for specific quiz session
- Loads text and questions based on route param
- Enables resume functionality via URL

**When to use**: When users need to bookmark or share specific app states.

### Pattern: Local Storage Abstraction
**Example**: Progress composable wraps localStorage access
```typescript
function loadFromStorage(): QuizProgress[] {
  try {
    const data = localStorage.getItem('exam-one-progress')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load progress', error)
    return []
  }
}
```

**Rationale**: Centralizes error handling, parsing, and fallback logic. Components never directly touch localStorage.

## Component Relationships

### Reading Feature Flow
```
pages/reading/index.vue (Practice page)
    ↓ displays list
components/reading/TextCard.vue (individual text card)
    ↓ click opens modal
components/reading/ReadingModal.vue (text reading)
    ↓ "Start Questions" navigates to
pages/reading/[quizId].vue (quiz page)
    ↓ embeds
components/reading/QuizSession.vue (quiz orchestrator)
    ↓ renders
components/reading/QuestionCard.vue (individual question)
```

### Writing Feature Flow
```
pages/writing/index.vue (Topic selection)
    ↓ displays list
components/writing/WritingTopicCard.vue (individual topic card)
    ↓ click navigates to
pages/writing/[topicId]/exam.vue (Writing page)
    ↓ embeds
components/writing/WritingSession.vue (3-card orchestrator)
    ↓ renders
├── TaskDescriptionCard.vue
├── InstructionsCard.vue
└── TextEditorCard.vue
    ↓ on submit, shows
components/writing/WritingFeedback.vue (analysis results)
```

## Critical Implementation Paths

### Path: Saving and Loading Progress
1. User completes quiz in `QuizSession.vue`
2. Component calls `useProgress().saveProgress(result)`
3. Composable updates reactive state and writes to localStorage
4. Dashboard page reads progress via same composable
5. Next session, progress is loaded on composable initialization

### Path: Real-Time Word Count Validation
1. User types in `TextEditorCard.vue`
2. Component counts words using `text.trim().split(/\s+/).length`
3. Compares against `topic.wordCount.min` and `topic.wordCount.max`
4. Updates visual indicator color (red: under/over, green: perfect)
5. Disables submit button if word count invalid

### Path: Text Analysis Feedback
1. User submits writing in `TextEditorCard.vue`
2. Component calls `analyzeGermanText(content, topic)` from `utils/textAnalysis.ts`
3. Analysis function returns: word count, sentence count, structure analysis, vocabulary metrics, suggestions
4. Results displayed in `WritingFeedback.vue` with score breakdown
5. Feedback saved to localStorage with writing submission via `useProgress().saveWritingProgress()`

### Path: Optional AI Review (Requires Network)
1. User clicks "Get AI Review" in `WritingReview.vue` component
2. Component calls `$fetch('/api/review', { method: 'POST', body: { topic, userContent, prompt } })`
3. Server endpoint checks for `OPENAI_API_KEY` in runtime config
4. If key exists, calls OpenAI API and returns structured review
5. If no key, returns offline fallback message
6. Component displays result in `WritingFeedback.vue`

**Note**: This creates a hybrid architecture where basic features are offline, but advanced AI features require network.

## State Management Strategy

### Local Component State (Vue `ref`, `reactive`)
**Use for**: UI state that doesn't need to be shared (form inputs, modal visibility, loading states).

### Composable State (Shared Reactive State)
**Use for**: Business logic and state shared by multiple components (`useProgress`, `useWritingTopics`).

### Pinia Store (Global Application State)
**Use for**: Truly global concerns (user settings, theme, locale).  
**Current stores**: `settingsStore` (for app-wide preferences).

**Pattern**: Prefer composables over Pinia stores for feature-specific state. Reserve Pinia for cross-cutting concerns.

## Error Handling Patterns

### localStorage Failures
- Always wrap localStorage access in try-catch
- Provide sensible defaults on parse errors
- Log errors to console for debugging
- Never throw errors to user-facing components

### Missing Data
- Check for null/undefined before rendering
- Provide empty states with helpful messages
- Use optional chaining and nullish coalescing (`data?.property ?? fallback`)

### Network Failures (AI Features)
- Degrade gracefully when API key missing
- Show informative message: "AI features unavailable offline"
- Ensure core functionality works without network

## Performance Optimizations

### Code Splitting
- Auto-split by route (Nuxt default)
- Lazy-load heavy components with `defineAsyncComponent`
- Bundle chunks: vendor (Vue, Vue Router), pinia, per-route chunks

### Reactivity Optimization
- Use `computed` for derived state (automatically cached)
- Avoid deep watchers; prefer shallow reactivity (`shallowRef`, `shallowReactive`)
- Keep component props simple (primitives or shallow objects)

### Storage Access
- Read localStorage only on mount/initialization
- Write to localStorage only on significant state changes (quiz completion, draft save)
- Debounce writes for frequently updating data

## Security Considerations

### XSS Prevention
- Vue's template auto-escaping prevents most XSS
- If rendering dynamic HTML (v-html), sanitize with DOMPurify (not currently used)

### CSP (Content Security Policy)
- Enforced via `nitro.routeRules` in `nuxt.config.ts`
- Current policy: `script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`
- Note: 'unsafe-inline' needed for Nuxt/Vite dev mode; tighten for production if possible

### API Key Security
- OpenAI API key stored server-side only (`runtimeConfig.openaiApiKey`)
- Never exposed to client
- If leaked, regenerate immediately

## Testing Strategy (To Be Implemented)

### Unit Tests (Vitest)
- Test composables (useProgress, useWritingTopics)
- Test utility functions (analyzeGermanText, textAnalysis helpers)
- Target: ≥70% coverage for business logic

### Component Tests (Vue Test Utils + Vitest)
- Test key user flows (quiz session, writing submission)
- Test edge cases (empty state, invalid input)

### E2E Tests (Future: Playwright)
- Complete user journey from landing → practice → dashboard
- Cross-browser testing (Chrome, Firefox, Safari)

