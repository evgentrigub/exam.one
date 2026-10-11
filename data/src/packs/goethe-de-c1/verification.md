# Goethe C1 verification · 2026-10-11

Implemented practice and mocks using the existing `goethe-de-c1` identity. The current modular Goethe model, September 2025 administration rules and 2024 handbook inform part counts, task formats, timings and rubrics. All seed tasks and model examples are original app content. No production deployment or completed paid-provider evaluation.

## Practice

- Twelve practice seeds, twelve separate exam-only Set 1 seeds and twenty PromptSpecs validate. Reading covers 8/7/8/7 questions, Listening 6/9/8/7 with four two-question discussion sections, Writing two four-requirement tasks, and Speaking presentation/questions plus four discussion turns.
- The six writing generators/model answers/reviews are adapted from `692f280^:apps/frontend/data/writing/c1/`. Count placeholders, 50/25-minute timings, actual model word counts, /60 and /40 criterion maxima, A–E bands, output-language feedback and current CriterionReview JSON are checked. Book examples and standalone module-pass claims were removed.
- Backend coverage checks 114/115 and 59/60-word boundaries, task-fulfilment zero, invalid bands, persisted wrapper normalization, gap/option-bank references, seven audio segments per bank, topic options and recording limits. Only Reading/Listening round module conversion; Writing 59.5 stays below 60.
- Browser coverage completes all eight objective practice tasks with persisted 100% results, restores both writing drafts and ready band reviews, restores manual speaking drafts/topic choice with STT unavailable, and stops a real browser recorder at 300 seconds.
- AI remains optional. Manual speaking transcripts and saved submissions/results use PostgreSQL; no new tables or history-versioning layer.

## Mock exams

- Fresh Set 1 has twelve parts and 65/40/75/20-minute timers in Reading → Listening → Writing → Speaking order. A separate 20-minute speaking preparation phase saves topic choice, notes and deadline; reload and automatic expiry are verified.
- Browser tests verify once-only playback, twice-heard interview playback, four section boundaries, preview gates, saved playback counts and reload recovery. Mock transcripts and answer keys stay hidden until review.
- The full mock finishes all twelve parts, grades Writing/Speaking automatically, retains five-criterion speaking reviews, and preserves results after reload. A high total cannot compensate for a failed module. Unavailable required grades remain pending.
- Generated immutable Set 2 has twelve parts and seven audio artifacts, including four discussion WAVs. Duplicate generation is rejected. A failed job seeded with completed Reading checkpoints resumes through the real BullMQ worker without replacing those parts.

## Cleanup and persistence

- One-off development `pnpm db:prune --pack goethe-de-c1` ran before activation; the development catalog had no C1 records to remove. No accounts/settings were deleted. Pruning is not imported by startup or seeding.
- A one-off fixture verification ran against isolated PostgreSQL with C1 and A2 fixtures. C1 results, attempts, drafts, mock sets/attempts, queued jobs and obsolete prompt overrides were removed. Counts for every other pack, users, auth tokens and settings remained unchanged. The temporary verification helper was removed after use; running-job cancellation ordering remains unit-tested.
- Normal development seeding completed with 24 C1 exercises (12 practice + 12 exam-only) and bundled Set 1. Other packs use the ordinary idempotent upsert path.

## Checks

- Workspace lint: passed, zero errors; one pre-existing SetRadio prop warning.
- Workspace type checks and build: passed.
- Backend: 61 suites, 610 tests and 4 snapshots passed.
- Prompt control: all twelve C1 practice seeds passed, no provider call.
- Locale parity: all five locales agree, 1239 keys.
- Isolated Chromium: all 11 C1 checks passed against the final rebuilt stack, including real playback of all 14 German recordings with TTS unavailable. Also 52 default regression checks and 46 multi-pack mock checks passed across Cambridge A2 and all four B1 packs. Existing intentional regression skips remain.
- Public documentation structure, facts, types and production build: passed. Code graph refreshed with AST extraction only.

## Prepared audio

`TTS_CONCURRENCY=1 pnpm generate:listening-audio --packs goethe-de-c1` prepared all fourteen WAVs: seven practice and seven separate Set 1 tracks, including four discussion sections per bank. Final synthesis wrote thirteen and reused one current recording, with zero failures. A second run reused all fourteen by content hash without synthesis.

Offline WAV inspection verifies mono, 16-bit PCM at 24 kHz, non-silent samples and valid durations for every file. Practice tracks run from 33.88 to 181.97 seconds; Set 1 tracks run from 32.65 to 171.54 seconds. Files are prepared under `apps/frontend/public/audio/listening/goethe-de-c1/`, following the existing generated-audio convention.

Chromium decodes and plays the prepared German tracks while synthesis endpoints return 503. Mock section completion and practice pause controls work without a TTS request. These are compact initial recordings, not full-length calibrated official exam audio.

An unsupported `--help` invocation of the existing prompt-evaluation script attempted provider requests; all failed at connection setup. The C1 verification uses its explicit `--control` mode, which makes no provider requests.

## Limits and follow-up

Fixed partner prompts do not reproduce spontaneous interaction. Transcript grading cannot evaluate pronunciation, intonation or acoustic fluency; speaking /100 is provisional and does not reproduce official examiner weighting. Original C1 texts, distractors, feedback and recording pace require specialist linguistic calibration. The initial compact seed transcripts are not calibrated to the full handbook length; generated listening prompts specify longer C1 authoring targets. Module timers and task counts match the format, but these original mocks are practice estimates. Synthetic German voices replace human exam recordings.

Next steps are professional content/pacing review, then optional live-provider prompt evaluation and a separate deployment decision. Those activities remain outside this implementation.
