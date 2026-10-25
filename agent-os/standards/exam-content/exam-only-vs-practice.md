# examOnly vs Practice

Each skill seed file exports three arrays:

```ts
defaultReadingTopics // practice
mockExamReadingTopics // examOnly: true
allDefaultReadingTopics // [...default, ...mock] — what db:seed upserts
```

- Practice composables filter `!examOnly`. Mock sets load those items via the set, not the practice catalog.
- Mark mock-reserved payload with `examOnly: true`. Visibility column `EXAM_ONLY` matches at the DB layer.
- Listening Set 1 clones practice seeds with a new mock id and `examOnly: true` (audio paths stay on the bundled WAVs).
- Do not show examOnly items on skill practice pages.
