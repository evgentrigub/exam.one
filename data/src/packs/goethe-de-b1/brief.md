# Goethe-Zertifikat B1, adults

Stage 2.18.4; verified 2026-10-07.

Sources: [official adult model paper](https://www.goethe.de/pro/relaunch/prf/materialien/B1/b1_modellsatz_erwachsene.pdf), overview p. 6, candidate tasks pp. 7–28, writing rubric pp. 42–43; [current B1 administration regulations](https://www.goethe.de/pro/relaunch/prf/am/Durchfuehrungsbestimmungen_B1.pdf), September 2025 edition.

Official modules are independently certificated, /100 with a 60-point pass. Reading 65 minutes: 6/6/7/7/4 items. Listening 40 minutes: 10/5/7/8 items, Parts 1 and 4 heard twice, Parts 2 and 3 once. Writing 60 minutes: personal email about 80 words (20 min), forum opinion about 80 (25 min), formal email about 40 (15 min). Speaking 15 minutes per pair plus 15 preparation: planning, presentation, and feedback/questions.

All 15 parts receive original seeds and generators. Writing retains /40, /40, /20 criterion allocations and zero below half the requested length (40/40/20 words); off-topic zero is also instructed in the review. Reading/listening remain raw /30 without conversion. Speaking is formative, four transcript-visible 0–5 criteria per part, excluding pronunciation and official weighting; it is not an official speaking score. Reading advertisement matching has exactly one x and no reused advertisements.

Implementation scope for the next stage requested in this chat: fixed partner turns for solo recordings, one assigned presentation topic rather than choosing between two, and a self-contained partner summary for feedback. These continue the established practice conventions of the preceding B1 packs. Listening Part 1 compiles the five short texts into one shared track, retaining its paired true/false and multiple-choice rows. Practice timers for speaking include independent recording transitions and are not the examiner’s per-turn timings.

The shared frontend writing helpers now retain task numbers, so Aufgabe 3 uses its own answer/review prompt rather than Aufgabe 1. This fix was implemented during the preceding B1 stages. No Prisma or API contract change is needed.

The B1 mock follow-up (2.18.5.2, 2026-10-10) adds a blank-safe generated-set factory, a pack-owned overview and one fresh exam-only Set 1 with all 15 tasks and four shared listening WAVs. Reading → Listening → Writing → Speaking uses 65/40/60/15-minute module timers. Each module is independently /100 and passes at 60 after rounding to the nearest integer; a higher total cannot compensate for a failed module. Objective /30 scores convert to /100; Writing retains /40 + /40 + /20; adapted Speaking /60 converts to an explicitly provisional /100 estimate. Missing or unavailable required grades keep their module result pending. Existing individual practice scoring stays unchanged.

Prepared Set 1 playback does not need an LLM or TTS service. The standard `pnpm generate:listening-audio --packs goethe-de-b1` prepares its WAVs using installed German voices. Generated sets still require configured LLM/TTS. The solo speaking adaptations above apply to mocks too; there is no live partner or separate preparation phase. Editable/manual transcripts remain available. See [verification.md](verification.md) for evidence and installation instructions.

The [official interactive writing model](https://bfu.goethe.de/b1_mod/schreiben.php) confirms criterion maxima 10/10/10/10 for Tasks 1 and 2, and 4/4/6/6 for Task 3. App word bands 70–90 and 35–50 are guidance around the official approximate lengths. The official advertisement sample has ten printed advertisements, with one consumed by a worked example; the practice exercise omits that example and uses ten eligible advertisements plus x. These banks and the app x indicator are practice presentation conventions.
