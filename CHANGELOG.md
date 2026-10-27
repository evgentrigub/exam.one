# Changelog

This file records user-visible changes to exam.one. Release tags use the form `vMAJOR.MINOR.PATCH`.

## Unreleased

### Added

- telc Deutsch B2 exam pack: all twelve parts of the written and oral exam with original practice tasks, a bundled mock exam (Set 1) and generated sets. Mock results pass on the written and oral parts separately and show the telc grade.
- Option banks for parts that repeat one option list, answered with compact letter chips; a repeatable "no match" option.
- Speaking tasks can show a text to read, such as the article a discussion is about, on the speaking and mock preparation screens.
- Rubrics with four bands (A–D) and mock grade bands.

### Changed

- The monologue card on speaking screens shows the part's own time limit.
- Learning plan announces B2 as coming soon only for boards without a B2 pack.
- Saved mock attempts with banded rubrics are re-validated, and their module scores recomputed, for every banded pack.

## 1.0.0

Initial public release of exam.one, a self-hostable platform for language exam preparation.

### Added

- Reading, Writing, Listening, and Speaking practice with exam-specific task formats and scoring rules.
- Ten exam packs across English, German, Polish, and Spanish: Cambridge A2/B1, Goethe A1/A2/B1/C1, Certyfikat Polski A2/B1, and DELE A2/B1.
- Bundled practice and mock-exam Set 1, plus optional AI-generated exercises and mock sets.
- Mock timers, saved drafts and attempts, detailed reviews, scores, and progress history.
- Accounts and practice persistence through NestJS, PostgreSQL, and Prisma, with Redis-backed background jobs.
- Optional per-user AI provider configuration for OpenAI, OpenRouter, Google Gemini, Anthropic, and xAI.
- Local listening-audio generation through Kokoro/Piper and optional transcription through Phonon 2/Parakeet Q4.
- Interface translations in English, German, Spanish, Polish, and Russian.
- Docker Compose setup, environment examples, backup/restore instructions, and contributor guides.
- Project licensing, third-party notices, contribution guidance, security policy, and Code of Conduct.

### Limitations

- AI generation and feedback require a configured provider and may incur provider charges.
- Listening requires existing audio or installed voices and audio generation. New generated mock sets require the relevant speech capability.
- Speaking transcripts can be entered manually; AI feedback and practice scores are estimates, not certification results.
- Initial speech setup requires model downloads. Additional language assets may need installation after startup.
- The supplied Compose configuration targets local use; internet-facing deployments require additional operator configuration.

See the [v1.0.0 release](https://github.com/evgentrigub/exam.one/releases/tag/v1.0.0) for setup guidance and limitations.
