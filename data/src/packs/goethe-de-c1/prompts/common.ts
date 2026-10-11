import { definePrompt } from '../../../assemble'
import type { SkillId, PromptSpec } from '../../../types'
import type { TaskDefinition } from '../runtime'
import { EXAM_TITLE, EXAM_LANGUAGE } from '../structure'

/** All examples are original C1 practice seeds; the model must create fresh situations. */
export function promptsFor(skill: SkillId, tasks: TaskDefinition[]): PromptSpec[] {
  return tasks.flatMap(task => {
    const rules = task.runtime
    const scored = task.itemFormat === 'freeform' || task.itemFormat === 'recording'
    const sample = { ...task.seed }
    for (const key of ['id', 'testingPart', 'difficulty', 'createdAt', 'audio', 'examOnly'])
      delete sample[key]
    for (const key of ['questions', 'items'])
      if (Array.isArray(sample[key]))
        sample[key] = (sample[key] as Record<string, unknown>[]).map(row => {
          const copy = { ...row }
          if (skill !== 'listening' || task.n !== 3) delete copy['id']
          return copy
        })
    const generator = definePrompt({
      skill,
      part: task.n,
      kind: 'generator',
      role: `You author original ${EXAM_TITLE} preparation material in ${EXAM_LANGUAGE} at CEFR C1.`,
      task: `Generate {count} independent exercises for ${skill}, Part ${task.n}: ${task.title}.`,
      llm: { temperature: 0.8, maxTokens: 12000 },
      rules: [
        'Use only the exam language for all learner-facing content, questions, options, explanations and cue cards. Use nuanced C1 language, complex syntax, precise lexical distinctions, implicit argument and plausible distractors. No specialist knowledge. Do not copy an official sample or the example below.',
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
        ...(task.bank
          ? [
              'Repeat the same complete ordered options bank on every question. Include all distractors in that bank.',
            ]
          : []),
        ...(rules.reuseOptions === false ? ['Each correct option may be used at most once.'] : []),
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
        ...(skill === 'listening'
          ? [
              task.n === 3
                ? 'Four sections only, exactly two question references per section. Use the stable IDs in the example; no question transcripts and no shared transcript. Never invent audio URLs.'
                : 'One complete shared transcript. Never invent audio URLs.',
              `Use sustained C1 language, approximately ${[400, 600, 800, 500][task.n - 1]} words for this part (authoring targets total about 2300 across the four parts). Test paraphrases, implicit attitudes and argument structure. Label dialogue speakers.`,
            ]
          : []),
        ...(skill === 'writing'
          ? [
              `wordCount must be ${JSON.stringify(task.seed['wordCount'])}; estimatedTime must be ${rules.minutes}. Provide a task and requirements, never a model answer.`,
            ]
          : []),
        ...(skill === 'speaking'
          ? [
              `Use word-cards with these ordered segment IDs: ${(rules.segments ?? []).map(s => s.id).join(', ')}. For Part 1 also supply two complete topicOptions with their cards, using the same ordered segments. Each card has segment, kind (presentation, ask or answer), topic and cue. Fixed examiner questions use speaker: examiner. Make every cue self-contained for solo practice.`,
            ]
          : []),
        'Remove audio URLs from the example; provide transcripts for generation. Use the exact raw payload keys shown in the example. Return a JSON array even for one exercise; omit top-level id, difficulty, testingPart and createdAt (the server assigns them). For sectioned listening, preserve local question and section IDs so questionIds remain resolvable.',
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
      role: `You write a strong but realistic C1 model response in ${EXAM_LANGUAGE}.`,
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
        'Return one JSON object: {"content":"model response","wordCount":number,"highlights":{"greeting":"","mainPoints":["why it works"],"closing":"","keyPhrases":["useful C1 language"]}}.',
    })
    const review = definePrompt({
      skill,
      part: task.n,
      kind: 'review',
      llm: { maxTokens: 5000 },
      role: `You give formative ${EXAM_TITLE} C1 ${skill} feedback. Practice scores are estimates, not official examination results.`,
      task: 'Exercise: {task}\nLearner response: {userContent}\nFeedback language: {outputLanguage}',
      rules: [
        ...task.hints,
        'Assess only the supplied response against the actual task. Quote concrete learner evidence in comments and propose actionable corrections. Use the exam language for corrections and {outputLanguage} for explanations.',
        'C1 success means an understandable connected response on complex social topics, with relevant detail, reasons and experiences; some grammar errors are expected. Missing content, unsuitable register and errors that obscure meaning lower the relevant score. Do not reward length alone. Use the full criterion range: zero for no demonstrated ability, middle for partial success and maximum for a fully achieved C1 task.',
        ...(skill === 'speaking'
          ? [
              'Assess content, language and connection visible in transcripts only. Do not assess pronunciation, intonation, acoustic fluency or actual partner interaction. Ignore obvious recognition slips and missing punctuation. Every turn is required.',
            ]
          : [
              'Check every requirement, organisation, register and word count. An off-topic response receives zero throughout; enforce any configured zero-below word threshold.',
            ]),
        ...(skill === 'writing'
          ? [
              'taskCompletion (Erfüllung): assess the requested communicative functions, relevant detail, text type and register for the recipient. In Task 1 assess each of the three functions; in Task 2 assess the opinion and its development; in Task 3 assess the polite message and its reason. If Erfüllung is zero because the response is below half the requested length or misses the topic, give zero for every criterion and for the whole task.',
              'coherence (Kohärenz): assess text organisation, an appropriate opening and closing, a clear sequence and sentence linking. vocabulary (Wortschatz): assess both range and appropriate word choice for the intended meaning. structures (Strukturen): assess grammatical range and control, word order, inflection and spelling. Distinguish occasional errors that do not impair comprehension from errors that obscure meaning.',
            ]
          : [
              'taskCompletion: assess the selected C1 presentation topic, all requested communicative functions, supported arguments, follow-up answers and a pertinent reciprocal question about the supplied partner presentation. In discussion, assess the four responses to the actual partner cues: develop a position, weigh advantages and disadvantages, respond to a counterargument and reach a qualified conclusion. coherence: assess connected reasoning and clear sequencing visible in the text. vocabulary: assess precise, varied C1 expression and paraphrase. structures: assess complex syntax and grammatical control in the transcript. interactiveCommunication: assess relevant responses, objections and reciprocal questions. These five 0–5 criteria are formative; no pronunciation, acoustic fluency or spontaneous interaction can be assessed.',
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
