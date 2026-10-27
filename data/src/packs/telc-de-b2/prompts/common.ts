import { definePrompt } from '../../../assemble'
import type { PromptSpec, SkillId } from '../../../types'
import type { TaskDefinition } from '../runtime'
import { EXAM_LANGUAGE, EXAM_TITLE } from '../structure'

/** The seed without server-assigned keys and audio, as the generator's example. */
export function exampleOf(task: TaskDefinition): Record<string, unknown> {
  const sample = { ...task.seed }
  for (const key of ['id', 'testingPart', 'difficulty', 'createdAt', 'audio', 'examOnly'])
    delete sample[key]
  for (const key of ['questions', 'items'])
    if (Array.isArray(sample[key]))
      sample[key] = (sample[key] as Record<string, unknown>[]).map(row => {
        const copy = { ...row }
        delete copy['id']
        delete copy['textId']
        return copy
      })
  return sample
}

const BANDS = (task: TaskDefinition): string =>
  (task.runtime.criteria ?? [])
    .map(c => `${c.id}: A/B/C/D = ${c.allowedPoints!.join('/')}`)
    .join('; ')

const SPEAKING_PART_RULES: Record<number, string> = {
  1: 'Part 1 (Über Erfahrungen sprechen): a connected report on one personal experience with when/where, what happened, feelings and a present-day evaluation, mostly in past tenses; relevant answers to the two partner questions; a reaction to the partner’s report with one or two fitting questions.',
  2: 'Part 2 (Diskussion): a neutral summary of the text’s main arguments for and against without the learner’s opinion; then a reasoned opinion, a direct reaction to the partner’s argument, a comparison with the learner’s country and a constructive proposal or compromise.',
  3: 'Part 3 (Gemeinsam etwas planen): concrete proposals with reasons, reactions to the partner’s ideas, a solution to the problem the partner raises, and a clear summary of the agreed plan and who does what.',
}

/** Generators for every part, plus model answers and reviews for speaking. */
export function promptsFor(skill: SkillId, tasks: TaskDefinition[]): PromptSpec[] {
  return tasks.flatMap(task => {
    const rules = task.runtime
    const generator = definePrompt({
      skill,
      part: task.n,
      kind: 'generator',
      role: `You author original ${EXAM_TITLE} preparation material in ${EXAM_LANGUAGE} at CEFR B2.`,
      task: `Generate {count} independent exercises for ${skill}, Part ${task.n}: ${task.title}.`,
      llm: { temperature: 0.8, maxTokens: 12000 },
      rules: [
        'Use German for all learner-facing content: texts, transcripts, questions, options, explanations and cue cards. Use authentic B2 language on everyday, work and social topics; no specialist knowledge. Write entirely original material: do not copy or paraphrase an official telc sample or the example below, and use invented names instead of real brands.',
        ...task.hints,
        `Practice timing: ${rules.minutes} minutes; raw maximum: ${rules.maxPoints}.`,
        ...(rules.questionCount
          ? [
              `Exactly ${rules.questionCount} scored items. Each has a non-empty German explanation that cites the evidence or names the grammar rule.`,
            ]
          : []),
        ...(rules.optionCount && task.itemFormat !== 'true-false'
          ? [
              `Exactly ${rules.optionCount} non-empty distinct options per item; correctAnswer is a zero-based integer and exactly one option is correct.`,
            ]
          : []),
        ...(task.bank
          ? [
              'Repeat the same complete ordered option bank on every question, including all distractors.',
            ]
          : []),
        ...(rules.reuseOptions === false
          ? [
              rules.repeatableOptions?.length
                ? 'Each option except the final x may be the correct answer for at most one question.'
                : 'Each option may be the correct answer for at most one question.',
            ]
          : []),
        ...(task.gaps
          ? [
              'Mark each gap in content as (1) ____ through the question count, once each and in order, and do not write the solution into the text. The chosen option is displayed inside the gap, so it must fit there exactly as written.',
            ]
          : []),
        ...(skill === 'listening'
          ? [
              'Write transcripts for speech synthesis: no stage directions, sound effects or brackets; write out abbreviations. Never invent audio URLs.',
              'Distribute Richtig and Falsch answers without a pattern.',
            ]
          : []),
        ...(skill === 'speaking'
          ? [
              `Use word-cards with these ordered segment ids: ${(rules.segments ?? []).map(s => s.id).join(', ')}. Each card has segment, kind, topic and cue; partner lines start with "Partner:". Make every cue self-contained for solo practice.`,
            ]
          : []),
        'Use the exact raw payload keys shown in the example. Return a JSON array even for one exercise; omit top-level id, difficulty, testingPart and createdAt and per-question ids (the server assigns them).',
      ],
      examples: [JSON.stringify([exampleOf(task)], null, 2)],
      outputContract: 'Return only the JSON array, without markdown or commentary.',
    })
    if (skill !== 'speaking') return [generator]
    const answer = definePrompt({
      skill,
      part: task.n,
      kind: 'answer',
      llm: { maxTokens: 4000 },
      role: `You write a strong but realistic B2 model response for ${EXAM_TITLE} speaking in ${EXAM_LANGUAGE}.`,
      task: 'Exercise and cue cards: {task}',
      rules: [
        SPEAKING_PART_RULES[task.n]!,
        'Respond to every card in order, one clearly separated turn per card, as natural spoken German at B2 (connected sentences, common connectors, some idiomatic phrases). Keep each turn speakable within its time limit. Where the exercise has topicOptions, answer the first option unless the learner chose another.',
        'Do not impersonate the learner or claim facts about their life as true; present experiences as an example the learner can adapt.',
        'Give the response in German; explain highlights in {outputLanguage}.',
      ],
      outputContract:
        'Return one JSON object: {"content":"model response","wordCount":number,"highlights":{"greeting":"","mainPoints":["why it works"],"closing":"","keyPhrases":["useful B2 phrases"]}}.',
    })
    const review = definePrompt({
      skill,
      part: task.n,
      kind: 'review',
      llm: { maxTokens: 5000 },
      role: `You give formative ${EXAM_TITLE} speaking feedback on the official telc criteria. Practice scores are estimates, not official results.`,
      task: 'Exercise: {task}\nLearner transcripts: {userContent}\nFeedback language: {outputLanguage}',
      rules: [
        SPEAKING_PART_RULES[task.n]!,
        'expression (Ausdrucksfähigkeit): content- and role-appropriate wording, range of vocabulary and structures, and whether each speaking intention is achieved. taskCompletion (Aufgabenbewältigung): every card answered, participation and reactions to the partner lines, discourse strategies (opening, turn-taking, agreeing, objecting, summarising) and connected, flowing turns as far as a transcript shows them. accuracy (Formale Richtigkeit): syntax and morphology; distinguish occasional slips from errors that hinder understanding.',
        `Bands: A fully appropriate, B appropriate on the whole, C barely acceptable, D insufficient throughout. Only these points: ${BANDS(task)}. Give each criterion its grade letter.`,
        'Assess only what the transcripts show. Do not assess pronunciation, intonation or acoustic fluency (Aussprache und Intonation is not scored in this practice), and ignore speech-recognition slips and missing punctuation. Every turn is required.',
        'Quote concrete learner evidence in comments and give actionable corrections. Corrections in German, explanations in {outputLanguage}.',
        'Do not invent criteria. totalPoints must equal the exact sum of criterion points; preserve criterion ids and maxima.',
      ],
      outputContract: JSON.stringify(
        {
          criteria: rules.criteria?.map(c => ({
            id: c.id,
            label: c.label,
            maxPoints: c.maxPoints,
            grade: 'D',
            points: 0,
            comment: 'evidence and next step',
          })),
          totalPoints: 0,
          maxPoints: rules.maxPoints,
          summary: 'overall feedback',
          strengths: ['evidence'],
          improvements: ['next step'],
          examples: [
            { error: 'learner quotation', correction: 'corrected German', rule: 'explanation' },
          ],
        },
        null,
        2
      ),
    })
    return [generator, answer, review]
  })
}
