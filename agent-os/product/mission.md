# Product Mission

## Problem

Self-studying adults preparing for Goethe German certification exams (A2, C1) have no single tool that covers all four exam skills — Reading, Writing, Listening, and Speaking — with immediate, actionable feedback. Existing tools (Goethe's own practice tests, Duolingo, Anki) either silo individual skills or provide no intelligent feedback, forcing learners to juggle multiple platforms without a clear picture of exam readiness.

## Target Users

Self-studying adult learners preparing independently for a Goethe-Zertifikat (currently A2 and C1 levels), who want to practice all exam skills in one place without relying on a teacher or scheduling tutoring sessions.

## Solution

Exam.one is a unified exam prep platform that combines practice for all four Goethe exam skills with AI-powered instant feedback. The current MVP is a frontend-only, offline-first web app — no accounts required, data stays local. The planned full-stack version will be a proper SaaS with a NestJS backend, PostgreSQL database, user accounts, and cloud sync, while keeping AI as an enhancement layer (never a hard dependency for core practice). The open-source core covers all four skills and mock exam mode; the paid layer adds the AI prompts that power exercise generation and automated grading.
