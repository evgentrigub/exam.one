# Tech Context: Exam.one

## Technology Stack

### Core Framework
- **Nuxt 3** (v3.17.5) - Vue meta-framework with auto-imports, file-based routing, SSR/SSG capabilities
  - Configured for client-side rendering (SPA mode)
  - Auto-imports components, composables, and utils
  - File-based routing in `pages/` directory

### Frontend
- **Vue 3** (v3.5.16) - Composition API with `<script setup>`
- **TypeScript** (v5.8.3) - Strict mode enabled, full type checking
- **Tailwind CSS** (v4.1.10) - Utility-first CSS framework
  - Beta version 7.0.0-beta.0 for Nuxt integration
  - JIT mode for optimal bundle size
  - Custom theme configuration

### State Management
- **Pinia** (v3.0.3) - Vue store with Composition API style
- **pinia-plugin-persistedstate** (v4.3.0) - Automatic localStorage persistence
- Composables for feature-specific state (`useProgress`, `useWritingTopics`)

### Utilities
- **VueUse** (v13.4.0) - Collection of Vue Composition API utilities
  - Core utilities for common reactive patterns
  - Auto-imported via `@vueuse/nuxt` module

### Internationalization
- **@nuxtjs/i18n** (v9.5.5) - i18n module for Nuxt
- **vue-i18n** (v11.1.6) - Vue i18n runtime
- Locales: English (en), German (de)
- Strategy: `no_prefix` (detect locale, no URL prefix)

### Server/API (Optional Features)
- **OpenAI** (v5.12.2) - AI-powered review and feedback
  - Server-side only, never exposed to client
  - Requires `OPENAI_API_KEY` environment variable
  - Gracefully degrades when key not present

### Development Tools

#### Linting & Formatting
- **ESLint** (v9.29.0) - JavaScript/TypeScript linter
  - `@eslint/js` - Core ESLint rules
  - `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` - TypeScript support
  - `eslint-plugin-vue` (v10.2.0) - Vue-specific rules
  - `@nuxt/eslint-config` - Nuxt-recommended rules
  - `eslint-config-prettier` - Disables conflicting rules
- **Prettier** (v3.5.3) - Code formatter
  - 2-space indent, single quotes, trailing commas, semicolons

#### Type Checking
- **vue-tsc** (v2.2.10) - TypeScript compiler for Vue
- **@nuxt/typescript-build** (v3.0.2) - TypeScript build support
- Strict mode enabled in `tsconfig.json`
- Type checking runs on build via `nuxt typecheck`

#### Git Hooks
- **Husky** (v9.1.7) - Git hooks manager
- **lint-staged** (v16.1.2) - Run linters on staged files
- Pre-commit hook: runs ESLint and Prettier on changed files

## Development Setup

### Prerequisites
- **Node.js**: ≥ 18.x LTS (project tested with Node 18+)
- **pnpm**: v10.12.1 (specified in `packageManager` field)
  - Install globally: `npm install -g pnpm@10.12.1`
  - Or use Corepack: `corepack enable`

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd exame-one

# Install dependencies
pnpm install

# Prepare Nuxt (generates types and auto-import definitions)
pnpm postinstall

# Set up git hooks
pnpm prepare
```

### Development Commands
```bash
# Start dev server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Generate static site (SSG)
pnpm generate

# Run linter
pnpm lint

# Fix linter errors automatically
pnpm lint:fix

# Format code with Prettier
pnpm format

# Type check without building
pnpm type-check
```

### Environment Variables
```bash
# Optional: Enable AI features (server-side only)
OPENAI_API_KEY=sk-...

# Accessed via useRuntimeConfig() in server endpoints
# Never exposed to client
```

## Build Configuration

### Nuxt Config (`nuxt.config.ts`)
- **CompatibilityDate**: 2025-05-15
- **DevTools**: Enabled in development
- **Modules**: tailwindcss, pinia, vueuse, i18n
- **TypeScript**: Strict mode, type checking enabled
- **Build Optimization**: Manual chunk splitting (vendor, pinia)

### Vite Config (via Nuxt)
```javascript
vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          pinia: ['pinia']
        }
      }
    }
  }
}
```

**Target Bundle Sizes**:
- Total gzipped: ~600 KB (achieved, excellent)
- Main app chunk: ~41 KB gzipped
- Vendor chunk: ~150 KB gzipped
- Build time: < 6 seconds

### Tailwind Config (`tailwind.config.js`)
- JIT mode (Just-In-Time compilation)
- Custom theme colors defined via CSS variables
- Content paths: components, pages, layouts, app.vue
- Responsive breakpoints: sm, md, lg, xl, 2xl
- Dark mode: class-based

### TypeScript Config (`tsconfig.json`)
```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Technical Constraints

### Browser Support
- **Primary**: Chrome, Firefox, Safari (latest 2 versions)
- **Mobile**: iOS Safari, Chrome Android (latest)
- **No IE11 support** (Vue 3 requires modern browsers)

### Performance Targets
- **Initial Load**: < 2 seconds (4G connection)
- **Time to Interactive (TTI)**: < 3 seconds
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Bundle Size**: < 250 KB gzipped (main app)
- **Animation FPS**: 60fps (use CSS transforms, avoid layout thrashing)

### Storage Constraints
- **localStorage**: ~5-10 MB limit (browser-dependent)
- **Data Format**: JSON strings for progress, drafts, settings
- **Fallback**: If localStorage full, gracefully degrade (no new progress saved)

### Accessibility Requirements
- **WCAG 2.2 AA** compliance minimum
- **Color Contrast**: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- **Keyboard Navigation**: All interactive elements focusable and operable
- **Screen Reader**: Proper ARIA labels, roles, and live regions
- **Focus Management**: Visible focus indicators, logical tab order

### Security Constraints
- **CSP**: Content Security Policy enforced via Nitro route rules
  - `script-src 'self' 'unsafe-inline'`
  - `style-src 'self' 'unsafe-inline'`
  - Note: 'unsafe-inline' required for Nuxt/Vite; tighten for production if possible
- **No eval()**: Never use `eval()` or `new Function()` with user input
- **XSS Prevention**: Vue's auto-escaping + manual sanitization if using v-html
- **API Key Security**: Never expose OpenAI key to client (server-side only)

## Dependencies Management

### Versioning Strategy
- **Lock File**: `pnpm-lock.yaml` (committed to version control)
- **Exact Versions**: Use exact versions in `package.json` for deterministic builds
- **Update Cadence**: Monthly security updates, quarterly feature updates
- **Breaking Changes**: Test thoroughly before merging major version bumps

### Dependency Audit
```bash
# Check for vulnerabilities
pnpm audit

# Production only
pnpm audit --prod

# Auto-fix (use caution)
pnpm audit --fix
```

### Minimize Dependencies
- **Rule**: Max 12 third-party production dependencies
- **Current Count**: 9 production dependencies (within limit ✅)
- **Prefer Native**: Use browser/Vue native APIs when possible before adding libraries

## Deployment

### Build Output
```bash
# SPA build (client-only)
pnpm build

# Outputs to .output/public/ (Nitro default)
# Deploy .output/public/ to static host (Netlify, Vercel, Cloudflare Pages)
```

### Static Site Generation (SSG)
```bash
# Pre-render all routes
pnpm generate

# Outputs to .output/public/
# Fully static, no Node.js server required
```

### Hosting Options
1. **Netlify**: Zero-config deployment from Git
2. **Vercel**: Nuxt 3 optimized, auto-deploy on push
3. **Cloudflare Pages**: Fast global CDN, free tier generous
4. **GitHub Pages**: Free for public repos, requires manual build

### Environment-Specific Configs
- **Development**: `nuxt dev` (HMR, devtools, verbose logging)
- **Production**: `nuxt build` (minified, optimized, no devtools)
- **Preview**: `nuxt preview` (test production build locally)

## Tool Usage Patterns

### VS Code Extensions (Recommended)
- **Volar** - Vue language support (replaces Vetur)
- **ESLint** - Real-time linting in editor
- **Prettier** - Auto-format on save
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes

### Git Workflow
- **Branch Naming**: `feature/<slug>`, `bug/<slug>`, `chore/<slug>`
- **Commit Format**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Pre-Commit**: Husky runs lint-staged (ESLint + Prettier on changed files)

### Debugging
- **Vue DevTools**: Browser extension for inspecting components and Pinia stores
- **Nuxt DevTools**: Built-in panel for routes, components, modules, analytics
- **Console Logging**: Use `console.log()` liberally in development, strip in production

## Known Technical Debt

### 1. Hybrid Offline/Online Architecture
**Issue**: Project rules mandate 100% offline operation, but optional AI features (review, model answers, topic generation) require OpenAI API (network access).

**Current State**: Core features (reading practice, writing practice, progress tracking) work fully offline. AI features gracefully degrade when API key not present.

**Future Resolution Options**:
- **Option A**: Remove AI features entirely for pure offline compliance
- **Option B**: Implement client-side AI (WASM models, limited capability)
- **Option C**: Accept hybrid model, clarify in docs that AI features are optional enhancements

### 2. Tailwind v4 Beta
**Issue**: Using Tailwind CSS v4.1.10 (beta) which may have instability or breaking changes.

**Risk**: Low (Tailwind is mature, v4 beta stable enough for production).

**Mitigation**: Pin exact version, test thoroughly before updating.

### 3. No Automated Testing Yet
**Issue**: No unit, component, or E2E tests implemented despite being in rules.

**Impact**: Regression risk on refactors, harder to onboard contributors.

**Plan**: Add Vitest for unit/component tests (Stage 13+).

### 4. CSP 'unsafe-inline'
**Issue**: CSP allows 'unsafe-inline' for scripts and styles, which reduces security.

**Reason**: Nuxt/Vite dev mode requires inline scripts; tightening CSP breaks HMR.

**Future**: Investigate nonce-based CSP for production builds to remove 'unsafe-inline'.

## Performance Monitoring

### Current Metrics (From Stage 7)
- **Bundle Size**: ~600 KB total, ~41 KB main chunk (gzipped) ✅
- **Build Time**: < 6 seconds ✅
- **Load Time**: < 2 seconds on 4G ✅
- **No Blocking Issues**: Zero identified in Stage 7 testing ✅

### Tools for Monitoring
- **Vite Build Analyzer**: Run `pnpm build` to see chunk sizes
- **Lighthouse**: Run in Chrome DevTools for performance, accessibility, SEO audits
- **WebPageTest**: Test load times from different locations and connection speeds

### Optimization Checklist
- ✅ Manual chunk splitting (vendor, pinia)
- ✅ Auto-import to reduce boilerplate
- ✅ Lazy-load routes (Nuxt default)
- ⏳ Lazy-load heavy components (future: async image gallery, charts)
- ⏳ Service Worker for offline caching (PWA enhancement, post-MVP)
- ⏳ Image optimization (nuxt/image module, future)

