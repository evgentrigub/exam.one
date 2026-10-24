import { definePrompt } from '../../../assemble'
import type { SkillId, PromptSpec } from '../../../types'
import type { TaskDefinition } from '../runtime'
import { EXAM_TITLE, EXAM_LANGUAGE } from '../structure'

/** All examples are original B1 practice seeds; the model must create fresh situations. */
export function promptsFor(skill: SkillId, tasks: TaskDefinition[]): PromptSpec[] {
  return tasks.flatMap(task => {
    const rules = task.runtime
    const scored = task.itemFormat === 'freeform' || task.itemFormat === 'recording'
    const sample = { ...task.seed }
    for (const key of ['id', 'testingPart', 'difficulty', 'createdAt']) delete sample[key]
    for (const key of ['questions', 'items'])
      if (Array.isArray(sample[key]))
        sample[key] = (sample[key] as Record<string, unknown>[]).map(row => {
          const copy = { ...row }
          delete copy['id']
          return copy
        })
    const generator = definePrompt({
      skill,
      part: task.n,
      kind: 'generator',
      role: `You author original ${EXAM_TITLE} preparation material in ${EXAM_LANGUAGE} at CEFR B1.`,
      task: `Generate {count} independent exercises for ${skill}, Part ${task.n}: ${task.title}.`,
      llm: { temperature: 0.8, maxTokens: 12000 },
      rules: [
        'Use only the exam language for all learner-facing content, questions, options, explanations and cue cards. Use connected B1 language with reasons, experiences, attitudes and plausible distractors; no specialist knowledge. Do not copy an official sample or the example below.',
        ...task.hints,
        `Practice timing: ${rules.minutes} minutes; raw maximum: ${rules.maxPoints}.`,
        ...(rules.questionCount
          ? [
              `Exactly ${rules.questionCount} scored questions, excluding worked examples. Each question has a non-empty explanation that cites evidence or explains the grammatical form.`,
            ]
          : []),
        ...(rules.optionCount
          ? [
              `Exactly ${rules.optionCount} non-empty distinct options per question; correctAnswer is a zero-based integer.`,
            ]
          : []),
        ...(task.optionPattern
          ? [
              `Option counts by item: ${JSON.stringify(task.optionPattern)}. True/false answers use 0 for true and 1 for false.`,
            ]
          : []),
        ...(task.bank
          ? [
              'Repeat the same complete ordered options bank on every question. Include all distractors in that bank.',
            ]
          : []),
        ...(rules.reuseOptions === false ? ['Each correct option may be used at most once.'] : []),
        ...(task.unmatchedIndex !== undefined
          ? [
              `Exactly one correctAnswer is ${task.unmatchedIndex} (no suitable advertisement); every other correct option occurs at most once.`,
            ]
          : []),
        ...(task.gaps || task.itemFormat === 'gap-fill'
          ? [
              'Mark each scored gap in content as (1) ____ through the question count, once each in order; (0) is reserved for a worked example.',
            ]
          : []),
        ...(task.itemFormat === 'gap-fill'
          ? [
              'Use accepted arrays of every valid answer variant, with no options or correctAnswer. Do not put the correct answers into content.',
            ]
          : []),
        ...(task.oneWord ? ['Each accepted answer is exactly one word.'] : []),
        ...(task.typedBankSize
          ? [
              `Start content with a separate line "Wyrazy: word1, word2, ... ." containing exactly ${task.typedBankSize} distinct words. Each accepted list identifies one word from that bank; each correct bank word is used once. Include one unused distractor. Use the spelling and punctuation pattern in the example.`,
            ]
          : []),
        ...(task.items
          ? [
              'Use items with their own context and transcript, one recording per item; do not use a shared transcript.',
            ]
          : []),
        ...(skill === 'listening' && !task.items
          ? ['Provide one complete shared transcript plus questions. Never invent audio URLs.']
          : []),
        ...(task.dialogue
          ? [
              'Label each dialogue turn with a speaker name or role followed by a colon; use at least two speakers.',
            ]
          : []),
        ...(skill === 'writing'
          ? [
              `wordCount must be ${JSON.stringify(task.seed['wordCount'])}; estimatedTime must be ${rules.minutes}. Provide a task and requirements, never a model answer.`,
            ]
          : []),
        ...(skill === 'speaking'
          ? [
              `Use word-cards with these ordered segment IDs: ${(rules.segments ?? []).map(s => s.id).join(', ')}. Each card has segment, kind (ask or answer), topic and cue. Fixed examiner questions use speaker: examiner. Make every cue self-contained for solo practice.`,
            ]
          : []),
        'Use the exact raw payload keys shown in the example. Return a JSON array even for one exercise; omit IDs, difficulty, testingPart and createdAt (the server assigns them).',
      ],
      examples: [JSON.stringify([sample], null, 2)],
      outputContract: 'Return only the JSON array, without markdown or commentary.',
    })
    if (!scored) return [generator]
    const answer = definePrompt({
      skill,
      part: task.n,
      kind: 'answer',
      llm: { maxTokens: 4000 },
      role: `You write a strong but realistic B1 model response in ${EXAM_LANGUAGE}.`,
      task: 'Exercise and cue cards: {task}',
      rules: [
        ...task.hints,
        ...(skill === 'writing'
          ? [
              'Follow the stated wordCount and every requirement, with appropriate register, reasons and connected sentences.',
            ]
          : [
              'Respond to every card in order. Separate model turns clearly. Do not impersonate the learner or invent personal facts as their history.',
            ]),
        'Give the response in the exam language; explain highlights in {outputLanguage}.',
      ],
      outputContract:
        'Return one JSON object: {"content":"model response","wordCount":number,"highlights":{"greeting":"","mainPoints":["why it works"],"closing":"","keyPhrases":["useful B1 language"]}}.',
    })
    const review = definePrompt({
      skill,
      part: task.n,
      kind: 'review',
      llm: { maxTokens: 5000 },
      role: `You give formative ${EXAM_TITLE} B1 ${skill} feedback. Practice scores are estimates, not official examination results.`,
      task: 'Exercise: {task}\nLearner response: {userContent}\nFeedback language: {outputLanguage}',
      rules: [
        ...task.hints,
        'Assess only the supplied response against the actual task. Quote concrete learner evidence in comments and propose actionable corrections. Use the exam language for corrections and {outputLanguage} for explanations.',
        'B1 success means an understandable connected response on familiar topics, with relevant detail, reasons and experiences; some grammar errors are expected. Missing content, unsuitable register and errors that obscure meaning lower the relevant score. Do not reward length alone. Use the full criterion range: zero for no demonstrated ability, middle for partial success and maximum for a fully achieved B1 task.',
        ...(skill === 'speaking'
          ? [
              'Assess content, language and connection visible in transcripts only. Do not assess pronunciation, intonation, acoustic fluency or actual partner interaction. Ignore obvious recognition slips and missing punctuation. Every turn is required.',
              'Wykonanie zadania concerns coverage of the scene, topic or fixed dialogue cues, including relevant details, reasons and a communicative outcome. Poprawność gramatyczna concerns the control of B1 grammar and whether errors obstruct meaning. Słownictwo i styl concerns appropriate range, expression and register. Fixed cues can demonstrate responding or asking appropriately, but cannot demonstrate live turn-taking.',
            ]
          : [
              'Check every requirement, organisation, register and word count. An off-topic response receives zero throughout; enforce any configured zero-below word threshold.',
              'Wykonanie zadania concerns required content, genre, register and coherent organisation. Bogactwo językowe concerns an appropriate range of vocabulary, structures and connecting expressions. Poprawność językowa concerns grammar, spelling and punctuation. Judge the short message against its short purpose rather than requiring the same elaboration as the long text. Scores are formative allocations across two independently stored tasks, not an official marking decision.',
            ]),
        `Criterion interpretation: ${rules.criteria?.map(c => `${c.label}: score only the ability named by this criterion, maximum ${c.maxPoints}`).join('; ')}.`,
        'Do not invent criteria. totalPoints must equal the exact sum of criterion points; preserve criterion IDs and maxima.',
      ],
      outputContract: JSON.stringify(
        {
          criteria: rules.criteria?.map(c => ({
            ...c,
            points: 0,
            comment: 'evidence and next step',
          })),
          totalPoints: 0,
          maxPoints: rules.maxPoints,
          summary: 'overall feedback',
          strengths: ['evidence'],
          improvements: ['next step'],
          examples: [
            { error: 'learner quotation', correction: 'corrected text', rule: 'explanation' },
          ],
        },
        null,
        2
      ),
    })
    return [generator, answer, review]
  })
}
