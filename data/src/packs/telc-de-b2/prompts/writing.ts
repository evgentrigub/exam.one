import { definePrompt } from '../../../assemble'
import { modules } from '../structure'
import { exampleOf } from './common'

/** Original model answer for the Aufgabe A practice seed (Werkraum Mitte). */
const MODEL_ANSWER = `Betreff: Anfrage zu Ihren Arbeitsplätzen im Werkraum Mitte

Sehr geehrte Frau Okafor,

ich habe Ihre Anzeige gelesen und interessiere mich sehr für einen Arbeitsplatz in Ihrem Coworking-Space. Seit einigen Monaten arbeite ich als Übersetzerin von zu Hause aus, aber in meiner kleinen Wohnung fällt es mir zunehmend schwer, mich zu konzentrieren. Deshalb hätte ich gern einige genauere Informationen.

Zunächst würde mich interessieren, wie viel die verschiedenen Tarife kosten und wie lange man sich mindestens binden muss. Ich würde am liebsten mit zwei Tagen pro Woche beginnen und später eventuell erhöhen. Gibt es vielleicht auch einen günstigeren Tarif für Selbstständige, die gerade erst anfangen?

Außerdem möchte ich wissen, wie die Arbeitsplätze ausgestattet sind. Gibt es zum Beispiel höhenverstellbare Tische und zusätzliche Bildschirme, oder sollte ich meine eigene Ausrüstung mitbringen?

Schließlich wäre es für mich sehr hilfreich, den Raum vorher an einem Probetag kennenzulernen. Ist das möglich, und muss ich dafür etwas bezahlen? So könnte ich auch ausprobieren, ob mir die Arbeitsatmosphäre zusagt.

Über eine baldige Antwort würde ich mich sehr freuen.

Mit freundlichen Grüßen
Jana Novak`

const REGISTER =
  'Semi-formal e-mail (Sie, polite requests or complaint, neutral and clear tone) with a Betreff, an Anrede, an introduction that gives the reason for writing, the chosen points in a sensible order and a closing formula. It answers the advertisement in the task.'

/** telc Schriftlicher Ausdruck: one e-mail, criteria I–III on A–D bands, raw sum × 3. */
export const writingPrompts = modules
  .find(m => m.id === 'writing')!
  .tasks.flatMap(task => {
    const rules = task.runtime
    const criteria = rules.criteria!
    const generator = definePrompt({
      skill: 'writing',
      part: task.n,
      kind: 'generator',
      role: 'You author original telc Deutsch B2 writing tasks (Schriftlicher Ausdruck, format since 2019).',
      task: `Generate {count} independent Part ${task.n} writing exercises.`,
      llm: { maxTokens: 6000, temperature: 0.8 },
      rules: [
        REGISTER,
        ...task.hints,
        'description is a realistic advertisement, notice or offer of 50–90 words with an invented organisation and a named contact person (use an e-mail address ending in .example). task sets the situation, names the recipient and ends with the same instruction sentences as in the example (three of four points or two plus an own aspect, Betreff, Anrede, Einleitung, Schluss, at least 150 words).',
        'requirements are exactly four short Leitpunkte that fit the advertisement and give enough to write about. Alternate the two Aufgaben across exercises: category ["Aufgabe A · Bitte um Informationen"] asks for information, ["Aufgabe B · Beschwerde"] complains about an experience that did not match the advertisement.',
        `topicType is "email"; wordCount must be ${JSON.stringify(task.seed['wordCount'])}; estimatedTime must be ${rules.minutes}. German only; no model answer and no ids.`,
        'Use the exact payload keys of the example. Return an array even for one exercise.',
      ],
      examples: [JSON.stringify([exampleOf(task)], null, 2)],
      outputContract: 'Only a valid JSON array, without markdown.',
    })
    const answer = definePrompt({
      skill: 'writing',
      part: task.n,
      kind: 'answer',
      role: 'You write a strong but realistic B2 model e-mail for telc Deutsch B2, addressing the actual task.',
      task: 'Exercise: {task}',
      llm: { maxTokens: 3000 },
      rules: [
        REGISTER,
        'Write 160–200 words in German. Handle three of the four Leitpunkte in a logical order and develop at least one of them with more than a single sentence. Count the words in your actual e-mail.',
        'Use varied B2 structures (subordinate clauses, Konjunktiv II for polite requests, passive where natural) and clear connectors. Use an invented name for the sender.',
        'Explain highlights in {outputLanguage}.',
      ],
      examples: [
        JSON.stringify(
          {
            content: MODEL_ANSWER,
            wordCount: MODEL_ANSWER.trim().split(/\s+/u).length,
            highlights: {
              greeting: 'Sehr geehrte Frau Okafor,',
              mainPoints: [
                'Three Leitpunkte (prices, equipment, trial day) are handled in a logical order, each with a reason.',
              ],
              closing: 'Mit freundlichen Grüßen',
              keyPhrases: ['Zunächst würde mich interessieren, …', 'Über eine baldige Antwort …'],
            },
          },
          null,
          2
        ),
      ],
      outputContract:
        'One JSON object: {"content":"German model e-mail","wordCount":number,"highlights":{"greeting":"","mainPoints":["why the task is fulfilled"],"closing":"","keyPhrases":["useful B2 phrases"]}}.',
    })
    const review = definePrompt({
      skill: 'writing',
      part: task.n,
      kind: 'review',
      role: 'You give strict, evidence-based formative telc Deutsch B2 writing feedback on an e-mail, using the official criteria I–III. This is an estimate, not an official result.',
      task: 'Task and Leitpunkte: {task}\nLearner e-mail: {userContent}\nFeedback language: {outputLanguage}',
      llm: { maxTokens: 5500 },
      rules: [
        REGISTER,
        'taskCompletion (I Aufgabenbewältigung): count the Leitpunkte handled appropriately, an own aspect counting as one. A = three Leitpunkte (or two plus an own aspect) handled appropriately; B = two (or one plus an own aspect); C = one; D = none. A Leitpunkt only listed in a single short sentence is not handled appropriately; one Leitpunkt should be developed with more than a single sentence structure.',
        'communicativeDesign (II Kommunikative Gestaltung): register, text logic, connectors, range of vocabulary and text-type features. A = fully appropriate; B = mostly appropriate; C = mostly inappropriate; D = entirely inappropriate. Do not give A when Betreff, Anrede or closing formula is missing.',
        'accuracy (III Formale Richtigkeit): grammar, spelling and punctuation measured against the level. A = B2 fully met, few errors; B = B2 met, errors do not hinder understanding; C = B1 level; D = A2 or below. A D here does not change I and II.',
        `Only these points: ${criteria.map(c => `${c.id}: A/B/C/D = ${c.allowedPoints!.join('/')}`).join('; ')}. Give each criterion its grade letter. The raw total is out of ${rules.maxPoints}; the exam multiplies it by ${rules.multiplier} (the app does this, do not multiply).`,
        'Special case: a text that misses the topic entirely (Thema verfehlt) gets D for all three criteria; set ruleApplied to "thema_verfehlt", otherwise "none". A text that addresses the topic but ignores the situation gets D only for taskCompletion. There is no automatic zero for length: 150 words is guidance, but a much shorter text usually cannot handle three Leitpunkte.',
        'Use only the task and the submitted text. Give 3–6 real error quotations where available, with exact German corrections and short explanations; never invent errors. Do not rewrite the whole e-mail.',
        'Comments, summary, strengths, improvements, priorityFixes and report use {outputLanguage}; German corrections stay German. totalPoints is the exact sum of criterion points.',
      ],
      outputContract: JSON.stringify(
        {
          criteria: criteria.map(c => ({
            id: c.id,
            label: c.label,
            maxPoints: c.maxPoints,
            grade: 'D',
            points: 0,
            comment: 'Evidence and next step',
          })),
          totalPoints: 0,
          maxPoints: rules.maxPoints,
          summary: 'Feedback',
          strengths: [],
          improvements: [],
          wordCount: { actual: 0, min: 150 },
          ruleApplied: 'none',
          checks: [
            { id: 'contentCoverage', required: 3, covered: 0 },
            { id: 'register', expected: 'semi-formal e-mail', detected: '', ok: false },
          ],
          examples: [
            {
              error: 'Exact learner quotation',
              correction: 'German correction',
              rule: 'Explanation',
            },
          ],
          priorityFixes: [],
          report: 'Criterion-based report',
        },
        null,
        2
      ),
    })
    return [generator, answer, review]
  })
