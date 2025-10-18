# Project Brief: Exam.one

## Vision
Deliver a polished German language exam preparation platform that learners can use to practice reading and writing exercises modeled after authentic Goethe Institut certification formats (A2-C1 levels). The experience should feel exam-authentic while being delightful and encouraging.

## Core Problem
German language learners preparing for Goethe Institut certification struggle with effective practice. Current study materials are either:
- Too generic and don't match actual exam formats
- Boring and repetitive, feeling like a chore
- Lacking structured feedback and progress tracking
- Missing identification of specific improvement areas

## Target Users
German language learners at A2-C1 levels preparing for Goethe Institut certification exams. These users:
- Have German skills and grammar knowledge
- Need targeted practice to build confidence
- Want to master the specific exam format
- Seek structured feedback on their performance

## Core Features

### 1. Reading Practice 📚
- Display authentic A2-level German texts (emails, notices, articles, advertisements, instructions)
- Multiple-choice comprehension questions (3-5 per text)
- Instant feedback with explanations
- Progress tracking and analytics
- Filtering and sorting capabilities
- Resume functionality for incomplete sessions

### 2. Writing Practice ✍️
- Topic selection from authentic exam-style prompts (A2 and C1 levels)
- Three-card writing interface: description, instructions, editor
- Real-time word count and validation
- Draft saving functionality
- Text analysis and feedback system
- Progress tracking and statistics

### 3. Progress Dashboard 📊
- Comprehensive statistics for reading and writing
- Recent activity tracking
- Completion indicators and best scores
- Visual progress indicators

## Technical Constraints

### Primary Constraint: Offline-First Architecture
**TENSION IDENTIFIED**: Project rules mandate "100% offline once installed" (PWA-ready, no external APIs). However, the current implementation includes:
- Core features working fully offline with localStorage/IndexedDB ✅
- Optional AI features (model answers, advanced review) requiring OpenAI API ⚠️

This creates a hybrid architecture where basic functionality is offline but advanced features need network access.

### Other Requirements
- Must run in modern browsers (Chrome, Firefox, Safari)
- Performance target: < 2s load time, < 250 KB gzipped bundle
- Responsive design (mobile-first, works from 320px width)
- Accessibility: WCAG 2.2 AA compliance
- Data persistence: localStorage/IndexedDB only
- All exam content embedded in client-side fixtures

## Success Criteria
1. **Usability**: Users can complete a full reading or writing session without confusion
2. **Performance**: Fast load times (< 2s) and responsive interactions (60fps)
3. **Progress**: Users can track improvement over multiple sessions
4. **Authenticity**: Exercises feel like real Goethe Institut exam questions
5. **Offline-capable**: Core features work without internet connection

## Out of Scope (For Now)
- Listening practice
- Speaking practice
- Multi-user accounts and authentication
- Backend database or server-side state
- Social features or shared progress
- Automated advanced AI grading (unless OpenAI key provided)

## Key Metrics
- Number of texts/topics completed per user
- Average session duration
- User accuracy/performance trends
- Progress completion rates

