# Goethe Exam Simulator - Product Requirements & Progress Tracker

## 1. Problem Statement
German language students preparing for Goethe-Institut exams find the preparation process stressful and often lack accessible tools that faithfully replicate the real exam experience. They need a way to practice the reading section under realistic conditions (timing, format, question types) to build confidence, identify weaknesses, and improve their time management skills, without requiring an internet connection.

## 2. Target Audience
This product is for self-directed German language learners who are actively preparing for a Goethe-Institut certification exam, starting with the A2 level. They are tech-savvy enough to use a web application and value tools that are focused, efficient, and work offline.

---

## 🎯 MVP STAGE - Core Exam Simulator (Target: 4-6 weeks)
**Overall Progress: 0/7 deliverables complete (0%)**

### D1: Project Foundation & User Access
**Priority: P0 | Status: ⭕ Not Started | Est: 1 week**
- [ ] Initialize Nuxt 3 + TypeScript project.
- [ ] Integrate Tailwind CSS for styling.
- [ ] Create a basic `auth` layout and a `/login` page.
- [ ] Implement a hardcoded login (`admin`/`admin`) as per requirements.
- [ ] Set up basic routing (`/login`, `/exam`, `/results`).

**Acceptance Criteria:**
- ✅ `pnpm dev` starts the development server.
- ✅ User can log in using `admin`/`admin` credentials.
- ✅ Upon login, user is redirected to a placeholder exam page.
- ✅ ESLint and Prettier are configured for code quality.

---

### D2: Exam Data & Content Loading
**Priority: P0 | Status: ⭕ Not Started | Est: 0.5 weeks**
- [ ] Define TypeScript interfaces for the 4 parts of the A2 reading exam.
- [ ] Create a JSON file in `/assets` or `/public` containing one full A2 sample exam.
- [ ] Implement a composable (`useExamApi.ts`) to fetch and parse the local exam JSON.

**Acceptance Criteria:**
- ✅ TypeScript types correctly model the exam structure.
- ✅ The composable successfully loads and returns the exam data.
- ✅ The exam data structure is validated.

---

### D3: Exam Simulation UI
**Priority: P0 | Status: ⭕ Not Started | Est: 1.5 weeks**
- [ ] Create the main `exam` layout with a header for the timer.
- [ ] Build Vue components for each of the 4 reading parts (MCQ, Matching, T/F).
- [ ] Implement a 30-minute countdown timer.
- [ ] Add navigation controls (e.g., "Next Part", "Finish Exam").

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
- **MVP Stage:** 0/7 deliverables complete (0%)
- **Post-MVP Stage:** 0/5 deliverables complete (0%)
- **Total Progress:** 0/12 deliverables complete (0%)

## 🎯 Current Sprint Focus
**Next Up:** D1 - Project Foundation & User Access

## 📝 Progress Log
*Update this section after completing each deliverable.*

### YYYY-MM-DD - D1: Project Foundation & User Access
- **Accomplished:**
- **Blockers:**
- **Lessons learned:**
- **Next steps:** 