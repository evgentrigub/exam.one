# 🎨 daisyUI Migration Plan

**Status**: ✅ **Installed & Configured**  
**Date**: October 18, 2025  
**Goal**: Standardize on daisyUI components to prevent component zoo and speed up development

---

## 📊 Progress Overview

**Total Components to Migrate**: 24  
**Completed**: 4/24 (17%) + 3 Phase 2 tasks ✅  
**In Progress**: 2/24  
**Not Started**: 18/24

### 🎯 Recently Completed
- ✅ `pages/index.vue` - Hero buttons & feature cards
- ✅ `components/reading/TextCard.vue` - Card, badges, button
- ✅ `components/writing/WritingTopicCard.vue` - Card, badges, buttons
- ✅ **`components/Navbar.vue` - navbar, dropdown, modal, buttons, forms** 🎉  

---

## ✅ Installation Complete

- [x] Installed daisyUI v5.3.7
- [x] Configured `tailwind.config.js` with daisyUI plugin
- [x] Customized theme colors (Goethe brand teal)
- [x] Updated architecture rules

### Theme Configuration
- **Primary**: #00897B (Goethe brand teal)
- **Secondary**: #546E7A (Soft neutral)
- **Accent**: #26A69A (Teal accent)
- Dark mode theme configured with lighter teal variations

---

## 🎯 Migration Strategy

### Phase 1: Core UI Primitives (Priority: HIGH 🔴)
Replace custom implementations with daisyUI equivalents to establish foundation.

### Phase 2: Layout Components (Priority: MEDIUM 🟡)
Refactor navigation, modals, and layout structures.

### Phase 3: Feature Components (Priority: LOW 🟢)
Update feature-specific components (reading, writing) to use daisyUI.

### Phase 4: Cleanup & Optimization
Remove redundant custom styles, consolidate utilities.

---

## 📋 Detailed Migration Checklist

### Phase 1: Core UI Primitives 🔴

#### 1.1 Buttons (8 instances)
**Status**: ⏳ Not Started  
**Priority**: HIGH  
**Effort**: 2 hours

**Current State**:
- Custom Tailwind classes scattered across components
- Inconsistent hover states and sizing
- Manual focus ring management

**Target daisyUI Component**: `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`

**Files to Update**:
- ✅ `pages/index.vue` - Hero CTA buttons (lines 13-31) **DONE**
- ⏳ `pages/dashboard.vue` - Quick action cards (lines 361-408)
- ✅ `components/Navbar.vue` - Modal buttons (lines 225-240)
- ✅ `components/reading/QuestionCard.vue` - Navigation buttons (lines 100-130)
- ✅ `components/reading/TextCard.vue` - Start reading button (line 75)
- ✅ `components/writing/WritingTopicCard.vue` - Action buttons (lines 92-131)
- ✅ `pages/writing/index.vue` - Topic actions
- ✅ `pages/reading/index.vue` - Text actions

**Example Migration**:
```vue
<!-- BEFORE -->
<button class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
  Start Practice
</button>

<!-- AFTER -->
<button class="btn btn-primary">
  Start Practice
</button>
```

---

#### 1.2 Cards (12 instances)
**Status**: ⏳ Not Started  
**Priority**: HIGH  
**Effort**: 3 hours

**Current State**:
- Custom `.bg-white .rounded-xl .shadow-md` patterns
- Manual hover shadow transitions
- Inconsistent padding/spacing

**Target daisyUI Component**: `card`, `card-body`, `card-title`, `card-actions`

**Files to Update**:
- ⏳ `components/reading/QuestionCard.vue` - Question container
- ✅ `components/reading/TextCard.vue` - Text preview card **DONE ✅**
- ✅ `components/writing/WritingTopicCard.vue` - Topic card **DONE ✅**
- ⏳ `components/writing/InstructionsCard.vue`
- ⏳ `components/writing/TaskDescriptionCard.vue`
- ⏳ `components/writing/TextEditorCard.vue`
- ⏳ `components/writing/ModelAnswerCard.vue`
- ⏳ `components/writing/TopicGeneratorCard.vue`
- ✅ `pages/index.vue` - Feature cards (lines 40-78) **DONE**
- ⏳ `pages/dashboard.vue` - Stat cards (lines 105-147, 165-208)
- ✅ `pages/dashboard.vue` - Resume session card (lines 289-309)
- ✅ `pages/dashboard.vue` - Recent activity card (lines 314-351)

**Example Migration**:
```vue
<!-- BEFORE -->
<div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
  <h3 class="text-xl font-bold mb-4">Card Title</h3>
  <p class="text-gray-600">Content here</p>
</div>

<!-- AFTER -->
<div class="card bg-base-100 shadow-md hover:shadow-lg">
  <div class="card-body">
    <h3 class="card-title">Card Title</h3>
    <p>Content here</p>
  </div>
</div>
```

---

#### 1.3 Progress Bars (4 instances)
**Status**: ⏳ Not Started  
**Priority**: MEDIUM  
**Effort**: 1 hour

**Current State**:
- Custom gray background with colored fill
- Manual width percentage calculation

**Target daisyUI Component**: `progress`

**Files to Update**:
- ✅ `components/reading/QuestionCard.vue` - Quiz progress (lines 10-15, 24-35)
- ✅ `pages/dashboard.vue` - Reading progress (lines 54-59)
- ✅ `pages/dashboard.vue` - Writing progress (lines 83-88)

**Example Migration**:
```vue
<!-- BEFORE -->
<div class="w-full bg-gray-200 rounded-full h-2">
  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${progress}%` }"></div>
</div>

<!-- AFTER -->
<progress class="progress progress-primary" :value="progress" max="100"></progress>
```

---

### Phase 2: Layout Components 🟡

#### 2.1 Navbar Component
**Status**: ✅ **COMPLETE**  
**Priority**: HIGH  
**Effort**: 2 hours → **DONE in 1.5 hours**

**Current State**: `components/Navbar.vue` (334 lines)
- Custom navigation with dropdown
- Custom modal for language settings
- Manual dropdown state management

**Target daisyUI Components**:
- `navbar`, `navbar-start`, `navbar-center`, `navbar-end`
- `dropdown`, `dropdown-content`
- `modal`, `modal-box`, `modal-action`

**Migration Tasks**:
1. Replace navbar wrapper with `navbar` component
2. Convert Practice dropdown to daisyUI `dropdown`
3. Convert Language Settings modal to daisyUI `modal`
4. Replace select dropdowns with daisyUI `select`
5. Simplify button styles using `btn` variants

**Example Migration**:
```vue
<!-- BEFORE: Custom Dropdown -->
<div ref="dropdownRef" class="relative">
  <button @click="toggleDropdown">Practice</button>
  <Transition>
    <div v-show="isOpen" class="absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
      <!-- items -->
    </div>
  </Transition>
</div>

<!-- AFTER: daisyUI Dropdown -->
<div class="dropdown">
  <label tabindex="0" class="btn btn-ghost">Practice</label>
  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
    <li><a>Reading</a></li>
    <li><a>Writing</a></li>
  </ul>
</div>
```

---

#### 2.2 Modal Components
**Status**: ✅ **COMPLETE** (via Navbar)  
**Priority**: MEDIUM  
**Effort**: 1.5 hours → **DONE**

**Current State**:
- Custom modal in `Navbar.vue` (lines 103-243)
- Custom backdrop with blur
- Manual open/close state

**Target daisyUI Component**: `modal`, `modal-box`, `modal-action`

**Files to Update**:
- ✅ `components/Navbar.vue` - Language settings modal
- ✅ `components/reading/ReadingModal.vue` (if exists)

**Example Migration**:
```vue
<!-- BEFORE -->
<div v-if="isOpen" class="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center" @click.self="close">
  <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
    <h2>Modal Title</h2>
    <!-- content -->
  </div>
</div>

<!-- AFTER -->
<input type="checkbox" v-model="isOpen" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h2 class="font-bold text-lg">Modal Title</h2>
    <!-- content -->
    <div class="modal-action">
      <label class="btn" @click="isOpen = false">Close</label>
    </div>
  </div>
</div>
```

---

#### 2.3 Form Elements (3 instances)
**Status**: ✅ **COMPLETE** (via Navbar)  
**Priority**: MEDIUM  
**Effort**: 1 hour → **DONE**

**Current State**:
- Custom select styling in Navbar (lines 149-161, 175-193, 207-220)
- Manual focus states
- Inconsistent sizing

**Target daisyUI Component**: `select`, `input`, `textarea`, `form-control`

**Files to Update**:
- ✅ `components/Navbar.vue` - Language selectors
- ✅ `components/writing/TextEditorCard.vue` - Text input areas

**Example Migration**:
```vue
<!-- BEFORE -->
<select class="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500">
  <option>Option 1</option>
</select>

<!-- AFTER -->
<select class="select select-bordered w-full">
  <option>Option 1</option>
</select>
```

---

### Phase 3: Feature Components 🟢

#### 3.1 Reading Components
**Status**: ⏳ Not Started  
**Priority**: MEDIUM  
**Effort**: 2 hours

**Files**:
- ✅ `components/reading/QuestionCard.vue` (210 lines)
- ✅ `components/reading/TextCard.vue` (182 lines)
- ✅ `components/reading/QuizSession.vue`
- ✅ `components/reading/ReadingModal.vue`

**Migration Focus**:
- Replace card structures with `card` component
- Use `badge` for text type indicators (lines 15-24 in TextCard)
- Replace custom radio buttons with `radio` component
- Use `alert` for feedback sections (lines 74-97 in QuestionCard)
- Use `stat` component for score displays

**Specific Changes**:
1. **Question Options** → Use `radio` with custom styling
2. **Feedback Section** → Use `alert alert-success` / `alert-error`
3. **Progress Indicator** → Use `progress` or `radial-progress`
4. **Badges** → Use `badge badge-primary`, `badge-success`, etc.

---

#### 3.2 Writing Components
**Status**: ⏳ Not Started  
**Priority**: MEDIUM  
**Effort**: 3 hours

**Files**:
- ✅ `components/writing/WritingTopicCard.vue` (260 lines)
- ✅ `components/writing/InstructionsCard.vue`
- ✅ `components/writing/TaskDescriptionCard.vue`
- ✅ `components/writing/TextEditorCard.vue`
- ✅ `components/writing/ModelAnswerCard.vue`
- ✅ `components/writing/TopicGeneratorCard.vue`
- ✅ `components/writing/WritingFeedback.vue`
- ✅ `components/writing/WritingReview.vue`
- ✅ `components/writing/WritingSession.vue`

**Migration Focus**:
- All card structures → `card` component
- Action buttons → `btn` variants
- Delete buttons → `btn btn-error btn-circle` (line 4-12 in WritingTopicCard)
- Progress sections → `badge` or `progress`
- Text areas → `textarea textarea-bordered`

---

#### 3.3 Specialized Components
**Status**: ⏳ Not Started  
**Priority**: LOW  
**Effort**: 1 hour

**Files**:
- ✅ `components/ui/Tooltip.vue` (167 lines)
- ✅ `components/TextReader.vue`

**Decision**:
- **Tooltip**: Consider replacing with daisyUI `tooltip` directive OR keep custom implementation if positioning logic is complex
- **TextReader**: Update styling to match daisyUI theme

**daisyUI Tooltip Example**:
```vue
<!-- BEFORE: Custom Tooltip component -->
<Tooltip text="Click to repeat" position="top">
  <button>Action</button>
</Tooltip>

<!-- AFTER: daisyUI Tooltip -->
<button class="tooltip" data-tip="Click to repeat">Action</button>
```

---

### Phase 4: Pages & Layouts 🟢

#### 4.1 Pages
**Status**: ⏳ Not Started  
**Priority**: LOW  
**Effort**: 2 hours

**Files**:
- ✅ `pages/index.vue` (182 lines) - Hero, features, benefits
- ✅ `pages/dashboard.vue` (578 lines) - Stats overview
- ✅ `pages/reading/index.vue`
- ✅ `pages/reading/[quizId].vue`
- ✅ `pages/writing/index.vue` (386 lines)
- ✅ `pages/writing/[topicId]/exam.vue`
- ✅ `pages/writing/[topicId]/checking.vue`

**Migration Focus**:
- Hero sections → Use `hero` component
- Stat cards → Use `stats` and `stat` components
- Feature grids → Use `card` in grid layout
- Action cards → Use `card` with `card-actions`

**Example - Dashboard Stats**:
```vue
<!-- BEFORE -->
<div class="bg-white rounded-xl shadow-sm p-6 text-center">
  <div class="w-12 h-12 bg-blue-100 rounded-full...">
    <svg>...</svg>
  </div>
  <div class="text-3xl font-bold text-blue-600">75%</div>
  <div class="text-sm text-gray-600">Completion</div>
</div>

<!-- AFTER -->
<div class="stats shadow">
  <div class="stat">
    <div class="stat-figure text-primary">
      <svg>...</svg>
    </div>
    <div class="stat-title">Completion</div>
    <div class="stat-value text-primary">75%</div>
  </div>
</div>
```

---

#### 4.2 Layouts
**Status**: ⏳ Not Started  
**Priority**: LOW  
**Effort**: 0.5 hours

**Files**:
- ✅ `layouts/default.vue` (12 lines) - Already minimal

**Migration Focus**:
- Update background colors to use daisyUI theme tokens
- Ensure consistent spacing with daisyUI utilities

---

## 🧪 Testing Strategy

For each migrated component:

1. **Visual Regression**
   - Screenshot before migration
   - Compare with after migration
   - Ensure design consistency

2. **Functionality**
   - Test all interactive elements
   - Verify state management still works
   - Check accessibility (keyboard navigation, ARIA)

3. **Responsive Design**
   - Test on mobile (320px)
   - Test on tablet (768px)
   - Test on desktop (1920px)

4. **Dark Mode** (Future)
   - Verify theme switching works
   - Check contrast ratios

5. **Performance**
   - Monitor bundle size change
   - Ensure no layout shifts

---

## 📦 daisyUI Components Reference

### Components We'll Use Most

| daisyUI Component | Use Case | Files Affected |
|------------------|----------|----------------|
| `btn` | All buttons | 8+ files |
| `card` | All card containers | 12+ files |
| `modal` | Modals, dialogs | Navbar, future modals |
| `dropdown` | Navigation dropdowns | Navbar |
| `progress` | Progress bars | QuestionCard, Dashboard |
| `badge` | Status indicators | TextCard, WritingTopicCard |
| `alert` | Feedback messages | QuestionCard |
| `stats` / `stat` | Dashboard metrics | Dashboard |
| `select` | Form selects | Navbar settings |
| `input` / `textarea` | Form fields | Writing components |
| `tooltip` | Tooltips | Existing Tooltip component |
| `navbar` | Navigation | Navbar |
| `hero` | Landing sections | Homepage |
| `menu` | Navigation menus | Dropdown content |

### Custom Theme Tokens Available

```css
/* Access via Tailwind */
.btn-primary     /* Goethe teal #00897B */
.btn-secondary   /* Soft neutral */
.btn-accent      /* Teal accent */
.bg-base-100     /* White (light) / #1E1E1E (dark) */
.text-primary    /* Goethe teal */
```

---

## 🚀 Migration Workflow

### For Each Component:

1. **Read** the current component file
2. **Identify** all UI patterns (buttons, cards, etc.)
3. **Map** to daisyUI equivalents using reference above
4. **Refactor** incrementally:
   - Start with wrapper elements (cards, modals)
   - Then interactive elements (buttons, forms)
   - Finally, decorative elements (badges, dividers)
5. **Test** functionality and styling
6. **Update** this document with ✅
7. **Commit** with message: `refactor: migrate [ComponentName] to daisyUI`

### Example Commit Flow:
```bash
# After migrating Navbar
git add components/Navbar.vue DAISYUI_MIGRATION_PLAN.md
git commit -m "refactor: migrate Navbar to daisyUI components"
```

---

## 📈 Estimated Timeline

- **Phase 1** (Core UI): 6 hours
- **Phase 2** (Layouts): 4.5 hours
- **Phase 3** (Features): 5 hours
- **Phase 4** (Pages): 2.5 hours
- **Testing & Polish**: 4 hours

**Total Estimated Effort**: ~22 hours (3-4 working days)

---

## 🎯 Success Criteria

- [ ] All custom button styles replaced with `btn` classes
- [ ] All card structures use `card` component
- [ ] Navigation uses daisyUI `navbar` and `dropdown`
- [ ] Modals use daisyUI `modal` component
- [ ] Form elements use daisyUI form components
- [ ] Progress indicators use daisyUI `progress`
- [ ] Theme colors (Goethe teal) applied consistently
- [ ] No visual regressions in functionality
- [ ] Bundle size remains under 250 KB gzipped
- [ ] Accessibility maintained (WCAG 2.1 AA)
- [ ] Dark mode support ready (when implemented)

---

## 🔗 Resources

- [daisyUI Documentation](https://daisyui.com/components/)
- [daisyUI Themes Guide](https://daisyui.com/docs/themes/)
- [Tailwind + daisyUI Best Practices](https://daisyui.com/docs/utilities/)

---

## 📝 Notes

- **Don't delete custom utilities**: Keep project-specific utilities like text clamping
- **Gradual migration**: Components can coexist during migration
- **Test incrementally**: Commit after each component migration
- **Document deviations**: If keeping custom implementation, note why in this doc

---

**Last Updated**: October 18, 2025  
**Next Review**: After Phase 1 completion

