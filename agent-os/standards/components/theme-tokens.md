# Theme Tokens Only

daisyUI is the primary component and color library. Use daisyUI semantic tokens everywhere. Never use raw Tailwind color utilities.

**Allowed:**
- Surfaces: `bg-base-100`, `bg-base-200`, `bg-base-300`
- Text: `text-base-content`, `text-{role}-content`
- Roles: `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`, `error`
- Tints: `bg-primary/10`, `bg-success/20`, `border-error/50`
- Opacity on content: `opacity-70`, `text-base-content/60`

**Forbidden:**
- `bg-blue-500`, `text-gray-700`, `border-red-400`, any raw Tailwind color scale
- Raw hex or rgb in class/style attributes
- Hard-coded light/dark fallbacks — tokens already adapt

**Why:** the app ships multiple daisyUI themes. Semantic tokens re-skin automatically; raw colors do not.

```vue
<!-- Good -->
<div class="bg-base-100 text-base-content border border-base-300">
  <span class="badge badge-success">Done</span>
</div>

<!-- Bad -->
<div class="bg-white text-gray-800 border-gray-200">
  <span class="bg-green-500 text-white">Done</span>
</div>
```

Prefer daisyUI components (`btn`, `card`, `badge`, `alert`, `progress`, `stats`, `modal`, `menu`, `tabs`, `dropdown`, `join`, `textarea-*`) over hand-rolled equivalents.
