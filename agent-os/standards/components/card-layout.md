# Card Layout

Feature UI is built from daisyUI `card` components. Use this structure:

```vue
<div class="card bg-base-100 shadow h-full flex flex-col">
  <!-- Optional colored header -->
  <div class="bg-{role}/10 px-6 py-4 border-b flex-shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-{role}/20 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-{role}" ...></svg>
      </div>
      <div>
        <h2 class="card-title text-lg">Title</h2>
        <p class="text-sm text-{role}">Subtitle</p>
      </div>
    </div>
  </div>

  <div class="card-body flex-1 overflow-y-auto min-h-0">
    <!-- content -->
    <div class="card-actions justify-end mt-auto">
      <!-- buttons -->
    </div>
  </div>
</div>
```

- Card surface is always `bg-base-100` — never raw colors
- In grid/flex layouts that should stretch, use `h-full flex flex-col` on the card and `flex-1 min-h-0 overflow-y-auto` on `card-body`
- Pin bottom actions with `card-actions` + `mt-auto`
- The colored header is **optional** — use it on major section cards inside a flow (`TaskDescriptionCard`, `InstructionsCard`, `TextEditorCard`). List/grid-item cards (`TextCard`, `ReadingGeneratorCard`) usually skip it
- When used, pick any daisyUI semantic color (primary/secondary/accent/info/success/warning/error) that fits the card's role — no fixed role→color mapping
