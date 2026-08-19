# Product Mission

## Problem

Passing a language certification exam is stressful, expensive, and time-consuming, and most people walk in under-prepared. The single biggest gap is realistic practice: learners rarely get enough trial attempts under conditions that mirror the real exam. Nerves, cost, and the high stakes of a one-shot test compound the problem. If learners could take unlimited attempts against a structure very close to the real exam — across every skill the exam tests — their odds of passing would rise dramatically, for any language.

## Target Users

Anyone preparing for a language certification exam, including:

- Adult self-learners studying independently
- Students preparing for required certifications
- Native speakers earning a certificate in a foreign language
- People relocating to a new country who need an exam result for official documents

The goal is a **generic, reusable framework** that, with light customization, can be adapted to prepare for _any_ language certification exam at _any_ difficulty level (any CEFR band or provider format) — not locked to a single language, level, or exam board.

## Solution

exam.one is an open-source, self-hostable platform for practicing all parts of a language exam — Reading, Writing, Listening, and Speaking — with optional AI-powered instant feedback. Phase 1 practice is complete; Phase 2 has login-gated NestJS accounts, practice persistence on PostgreSQL, and a NestJS AI/TTS/STT proxy. Learners configure how exercises are generated and reviewed and plug in their own LLM API keys so they can generate as many realistic attempts as they want at their own cost.

German / Goethe A2 is the first complete and tested exam product. It is a starting point for content and validation, not a product ceiling — the architecture stays exam-agnostic so additional languages, levels, and providers can be added through seed data, metadata, and prompt templates.

What makes it unique:

- **Open source and self-hosted** — transparent, configurable structure for exercises, review, and skill improvement; serve it locally like n8n or Postiz.
- **Bring-your-own-key AI** — users supply their own LLM keys for effectively unlimited, low-friction practice attempts.
- **Generic framework** — designed to adapt to any language exam and any difficulty level, not hardcoded to one language or certificate.
- **Realistic, repeatable attempts** — practice structures stay close to the real exam, including a strict mock exam mode.

Alongside the open-source self-hosted project, a hosted cloud copy will be offered later under paid price plans for users who prefer not to self-host.
