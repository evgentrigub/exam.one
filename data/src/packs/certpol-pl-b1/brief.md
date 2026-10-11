# Certyfikat Polski B1, adults

Stage 2.18.2; verified 2026-10-07.

Sources: [current official structure](https://certyfikatpolski.pl/o-egzaminie/struktura-egzaminu/); [official 2020 adult B1 sample](https://certyfikatpolski.pl/wp-content/uploads/2020/12/B1_przykladowy_test_2020_03.pdf), pp. 2–22; [2017 adult sample](https://certyfikatpolski.pl/wp-content/uploads/2017/05/5_B1_test.pdf), pp. 25–26 for oral tasks and rubric.

The adult exam tests listening, reading, grammar, writing and speaking independently. Each written paper has 30 marks; the oral paper has 40. Pass requires at least 50% in EACH paper, not an aggregate written/oral threshold. Written duration is at most 190 minutes; oral at most 15. The 2020 sample cover gives listening 30, reading 40, grammar 45 and writing 75 minutes. Its reading inner heading says 45; the cover allocation is used here and the discrepancy is retained explicitly.

The 2020 task counts are a concrete sample blueprint, not a promise that every future paper has identical counts. Reading: 5,7,7,7,8 items, last task half marks. Grammar: 10,5,5,10,5,5,10,5, mostly half marks except five sentence transformations (one each). Listening: 12 half-mark items once, then 7/5/7/5 items twice; multi-matching to four speakers permits reuse. Writing offers three paired sets; the pack practises the 25+175-word variant with two independently stored tasks. Short/long criterion allocation 2+8 per criterion is formative, not official per-task weighting. Oral tasks: photo description, topic monologue and situational dialogue. Practice retains the 20 task marks and 16 grammar/vocabulary marks, omitting 4 pronunciation marks.

Implementation scope for the next stage requested in this chat: grammar paper in the Reading catalog as Parts 6–13, with official grammar I–VIII names retained; written scene instead of photograph; fixed examiner cards; assigned writing pair instead of choosing among three sets. These established practice conventions were stated when implementation resumed. Grammar full-sentence answers use a required sentence opening and enumerated accepted variants; they cannot recognise every valid paraphrase. Word-bank exercises require distinct supplied words and no answer reuse. No combined reading/grammar or overall exam pass is inferred from practice scores. The catalog's display explains the separate /30 reading and /30 grammar papers and their independent 50% requirements.

All 23 practice seeds are original. The mock extension adds a separate original 23-task Set 1, factory, overview and 22 bundled recordings. Listening generation needs installed Polish Piper voices; metadata does not install them. Speaking allows manual transcripts.

## Adult B1 mocks (2.18.5.3)

Five independently timed and scored papers: Listening 30, Reading 40, Grammar 45, Writing 75 and Speaking 15 minutes. Reading and Grammar share the Reading renderer but have separate paper IDs, API-persisted states and review routes. Each written paper is /30 and passes at 15; Speaking is normalized from the transcript-visible /36 rubric to estimated /40 and passes at 20. Fractional points are never rounded up for a pass. No higher paper score can compensate for a failed paper. Pending or unavailable productive grades withhold a final result.

Set 1 has 23 fresh exam-only tasks and 22 explicit WAV paths (12 + 7 item recordings and three shared tracks). Generated sets reuse the existing resumable worker and TTS pipeline; an empty draft retains the five-paper blueprint. The assigned writing pair and oral adaptations above are retained. These original, uncalibrated mocks estimate readiness, not certification. Speech models and prepared WAVs must be installed using the normal self-host setup; registration does not install media.
