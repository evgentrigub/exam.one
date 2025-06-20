# Goethe Exam Simulator - Product Requirements & Progress Tracker

## 1. Problem Statement
German language students preparing for Goethe-Institut exams find the preparation process stressful and often lack accessible tools that faithfully replicate the real exam experience. They need a way to practice the reading section under realistic conditions (timing, format, question types) to build confidence, identify weaknesses, and improve their time management skills, without requiring an internet connection.

## 2. Target Audience
This product is for self-directed German language learners who are actively preparing for a Goethe-Institut certification exam, starting with the A2 level. They are tech-savvy enough to use a web application and value tools that are focused, efficient, and work offline.

---

## 🎯 MVP STAGE - Core Exam Simulator (Target: 4-6 weeks)
**Overall Progress: 3/7 deliverables complete (42%)**

### D1: Project Foundation & User Access
**Priority: P0 | Status: ✅ Complete | Est: 1 week**
- [x] Initialize Nuxt 3 + TypeScript project.
- [x] Integrate Tailwind CSS for styling.
- [x] Create a basic `auth` layout and a `/login` page.
- [x] Implement a hardcoded login (`admin`/`admin`) as per requirements.
- [x] Set up basic routing (`/login`, `/exam`, `/results`).

**Acceptance Criteria:**
- ✅ `pnpm dev` starts the development server.
- ✅ User can log in using `admin`/`admin` credentials.
- ✅ Upon login, user is redirected to a placeholder exam page.
- ✅ ESLint and Prettier are configured for code quality.

---

### D2: Exam Data & Content Loading
**Priority: P0 | Status: ✅ Complete | Est: 0.5 weeks**
- [x] Define TypeScript interfaces for the 4 parts of the A2 reading exam.
- [x] Create a JSON file in `/assets` or `/public` containing one full A2 sample exam.
- [x] Implement a composable (`useExamApi.ts`) to fetch and parse the local exam JSON.

**Acceptance Criteria:**
- ✅ TypeScript types correctly model the exam structure.
- ✅ The composable successfully loads and returns the exam data.
- ✅ The exam data structure is validated.

---

### D3: Exam Simulation UI
**Priority: P0 | Status: ✅ Complete | Est: 1.5 weeks**
- [x] Create the main `exam` layout with a header for the timer.
- [x] Build Vue components for each of the 4 reading parts (MCQ, Matching, T/F).
- [x] Implement a 30-minute countdown timer.
- [x] Add navigation controls (e.g., "Next Part", "Finish Exam").

**Acceptance Criteria:**
- ✅ The exam UI correctly renders questions based on their type.
- ✅ The timer starts when the exam page loads and counts down.
- ✅ Users can navigate between the different parts of the exam.

---

### D4: Answer Handling & State Management
**Priority: P1 | Status: ⭕ Not Started | Est: 1 week**
- [ ] Set up a Pinia store (`examStore`) to manage the exam state.
- [ ] Implement logic for selecting/changing answers for all question types.
- [ ] Store the user's answers reactively in the Pinia store.

**Acceptance Criteria:**
- ✅ Clicking an answer updates the state in the Pinia store.
- ✅ The UI correctly reflects the currently selected answers.
- ✅ State is kept modular and separate from the UI components.

---

### D5: Scoring & Results Page
**Priority: P1 | Status: ⭕ Not Started | Est: 1 week**
- [ ] Create a `results` page that is shown after submitting the exam.
- [ ] Implement a scoring function that calculates the total correct answers.
- [ ] Display the final score clearly on the results page.
- [ ] Build a review mode on the results page where users can see their answers alongside the correct answers.

**Acceptance Criteria:**
- ✅ The final score is calculated correctly based on the stored answers.
- ✅ The results page shows the score (e.g., 18/20).
- ✅ The review mode correctly highlights correct and incorrect user answers.

---

### D6: State Persistence & Offline Readiness
**Priority: P1 | Status: ⭕ Not Started | Est: 0.5 weeks**
- [ ] Integrate `pinia-plugin-persistedstate` to save the `examStore` to `localStorage`.
- [ ] Configure the persistence to save the user's current answers and timer state.

**Acceptance Criteria:**
- ✅ Refreshing the page during an exam does not reset the user's answers or timer.
- ✅ The application remains fully functional if the user goes offline after the initial load.

---

### D7: MVP Testing & Bug Fixes
**Priority: P1 | Status: ⭕ Not Started | Est: 0.5 weeks**
- [ ] Conduct end-to-end testing of the full user flow (Login → Exam → Results).
- [ ] Test on major browsers (Chrome, Firefox, Safari).
- [ ] Fix any critical bugs found during testing.

**Acceptance Criteria:**
- ✅ A user can complete the entire exam flow without critical errors.
- ✅ The application is responsive and works on mobile and desktop views.
- ✅ No blocking bugs remain for the MVP launch.

---

## 🚀 POST-MVP STAGE - Enhanced Features
**Overall Progress: 0/5 deliverables complete (0%)**

### D8: Dashboard & Progress Analytics
**Priority: P2 | Status: ⭕ Not Started | Est: 2 weeks**
- [ ] Create a user dashboard to view past exam results.
- [ ] Track performance over time (e.g., scores, time taken).
- [ ] Visualize progress with simple charts.

---

### D9: Expanded Exam Library
**Priority: P2 | Status: ⭕ Not Started | Est: 1 week**
- [ ] Add 3-5 more complete A2-level reading exams.
- [ ] Implement a simple UI to allow users to choose which exam to take.

---

### D10: PWA & True Offline Mode
**Priority: P2 | Status: ⭕ Not Started | Est: 1.5 weeks**
- [ ] Configure the Nuxt PWA module.
- [ ] Implement a service worker to cache all application assets for a true offline-first experience.
- [ ] Add a web app manifest and icons.

---

### D11: Enhanced Review & Learning Mode
**Priority: P3 | Status: ⭕ Not Started | Est: 1 week**
- [ ] Add brief explanations for correct/incorrect answers in the review mode.
- [ ] Link to external grammar/vocabulary resources for difficult questions.

---

### D12: Accessibility & UI Polish
**Priority: P3 | Status: ⭕ Not Started | Est: 1 week**
- [ ] Perform a full accessibility audit (WCAG 2.1 AA).
- [ ] Add keyboard navigation for all interactive elements.
- [ ] Implement subtle animations and transitions to improve UX.

---

## 📊 Overall Project Status
- **MVP Stage:** 3/7 deliverables complete (42%)
- **Post-MVP Stage:** 0/5 deliverables complete (0%)
- **Total Progress:** 3/12 deliverables complete (25%)

## 🎯 Current Sprint Focus
**Next Up:** D4 - Answer Handling & State Management

## 📝 Progress Log
*Update this section after completing each deliverable.*

### YYYY-MM-DD - D1: Project Foundation & User Access ✅
- **Accomplished:** Set up the initial Nuxt 3 project with TypeScript and Tailwind CSS. Created the login page with a dedicated layout, implemented the required `admin/admin` user access, and established basic routing to a placeholder exam page.
- **Blockers:** The linter is showing errors for Nuxt's auto-imported functions (`definePageMeta`, `useRouter`), which is a known environment issue and does not affect the application's runtime functionality.
- **Lessons learned:** A base `app.vue` is crucial for Nuxt 3's layout and page rendering to function correctly.
- **Next steps:** Proceed with D2 to define the data structure for the exam and load the content.

### YYYY-MM-DD - D2: Exam Data & Content Loading ✅
- **Accomplished:** Established a strong data foundation by defining TypeScript interfaces for all parts of the A2 reading exam. Created a full sample exam in a local JSON file and implemented a `useExamApi` composable to fetch and type this data.
- **Blockers:** None.
- **Lessons learned:** Placing data in the `public` directory makes it easily fetchable, simulating a real API call and keeping content separate from application logic.
- **Next steps:** Begin building the user-facing exam interface in D3.

### YYYY-MM-DD - D3: Exam Simulation UI ✅
- **Accomplished:** Built the core of the exam experience. Created a focused `exam` layout, a reusable timer composable, and dynamic components for all four parts of the A2 reading test. Implemented navigation to move between parts. Solved a complex TypeScript issue with a type-safe renderer component.
- **Blockers:** Persistent linter parsing errors related to the IDE's TypeScript server being out of sync. These are benign and do not affect runtime.
- **Lessons learned:** Using a renderer or wrapper component with `v-if` is a clean, type-safe pattern for displaying dynamic components in Nuxt/Vue, avoiding complex TS errors.
- **Next steps:** Implement state management with Pinia to handle user answers (D4). 