# Goethe-Zertifikat C1 · modular format

Scope: 2.19.1 practice and 2.19.2 mocks, using the existing `goethe-de-c1` identity. Twelve original practice seeds, twelve fresh exam-only Set 1 seeds, twenty prompt slots. No content revision/history feature or grammar module.

Sources inspected: [official modular model](https://bfu.goethe.de/c1mod/), [administration rules, September 2025](https://www.goethe.de/pro/relaunch/prf/de/Durchfuehrungsbestimmungen_C1.pdf), [handbook, 2024](https://www.goethe.de/pro/relaunch/prf/vi/Handbuch_Pruefungsziele_Testbeschreibung_C1.pdf). Facts below describe that format; all app sample wording is original.

Reading: 65 minutes; 8 four-option lexical gaps, 7 three-option comprehension items, 8 sentence gaps with ten bank sentences (two distractors, no reuse), 7 statements matched to three expert opinions or x (exactly two x). Thirty raw marks.

Listening: 40 minutes; 6 podcast matches, 9 three-way statements (true/false/not stated), four discussion sections of two questions, 7 lecture questions. Thirty raw marks. Seven separate WAVs per seed bank. Hearing limits 1/2/1/2; previews 60/60/30 per discussion section/90 seconds. Mock playback and preview state is saved with the exercise response. Transcripts remain hidden until review.

Writing: 75 minutes, split 50/25. A neutral argumentative forum post of approximately 230 words and a recipient-appropriate formal/semi-formal message of approximately 120 words, each with four communicative functions. The practice length guides are 230–260 and 120–150, not official hard upper limits. Rubrics /60 and /40: 14/14/16/16 and 10/10/10/10. Only A–E scores, max × 1/.75/.5/.25/0. Below 115/60 words or Erfüllung E: zero throughout the task. Recovered generator, answer and review instructions from `692f280^:apps/frontend/data/writing/c1/` are adapted in `prompts/writing.ts`; old textbook examples and Russian-only feedback were replaced, malformed JSON repaired, actual model-answer words counted, and single-task module-pass claims removed.

Speaking: 20-minute module plus a separately saved 20-minute preparation phase in mocks. Two topics, one five-minute presentation, two prepared follow-up questions, reciprocal question about a supplied partner presentation, and four guided discussion turns. Preparation notes and topic survive reload; expiry starts the speaking timer from the saved preparation deadline. Ending preparation early starts the module immediately.

Practice adaptations: solo partner prompts are fixed, not spontaneous. Speaking feedback has five transcript-visible /5 criteria per part (fulfilment, coherence, vocabulary, structures, relevant responses/questions), /50 normalized to provisional /100. It cannot evaluate pronunciation, intonation or acoustic fluency and does not reproduce official examiner weighting. Prepared audio uses local German synthetic voices rather than human exam recordings. Original seed texts and distractors require specialist linguistic calibration; structural checks do not certify CEFR difficulty. The compact initial listening seeds are shorter than handbook-scale transcripts and need pacing calibration; generation prompts specify longer per-part targets.

Each mock module passes independently at 60/100; Writing 59.5 remains below the threshold. Reading/listening use the rounded official raw conversion; high scores elsewhere cannot compensate. Writing totals directly /100; speaking is explicitly provisional. Missing grades remain pending. Generated sets use existing immutable definitions and resumable generation/audio jobs.

Cleanup is a one-time operator command: `pnpm db:prune --pack goethe-de-c1`. It cancels active jobs and waits for worker acknowledgement before deleting records, clears C1-only level overrides, and preserves every other pack, accounts, sessions and settings. Neither startup nor seed runs pruning. No schema migration or new tables are required.

Paid-provider evaluation, deployment and professional content review remain outside this implementation.
