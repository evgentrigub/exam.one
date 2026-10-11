import { definePrompt } from '../../../assemble'
import { modules } from '../structure'

const originalModels = [
  `Meiner Ansicht nach sollte Weiterbildung selbstverständlich zur Arbeitszeit gehören. Wer von Beschäftigten verlangt, mit technischen und gesellschaftlichen Veränderungen Schritt zu halten, muss ihnen dafür auch verlässliche Bedingungen bieten. Ein frei zugänglicher Kurs allein schafft noch keine tatsächliche Lernmöglichkeit.

Lebenslanges Lernen gewinnt an Bedeutung, weil sich Tätigkeiten verändern und einmal erworbene Kenntnisse nicht dauerhaft ausreichen. Dabei geht es nicht nur um neue Programme. Auch die Fähigkeit, Informationen kritisch zu prüfen und mit anderen zusammenzuarbeiten, muss weiterentwickelt werden. Davon profitieren sowohl die Beschäftigten als auch der Betrieb.

Allerdings darf man die organisatorischen Schwierigkeiten nicht unterschätzen. Während größere Unternehmen Vertretungen einplanen können, fehlen kleinen Betrieben häufig entsprechende Reserven. Zudem lernen Menschen unterschiedlich schnell. Eine einheitliche Vorgabe, die lediglich die Zahl abgeschlossener Kurse zählt, könnte deshalb gerade diejenigen benachteiligen, die zusätzliche Unterstützung benötigen. Auch kurze Angebote müssen fachlich sinnvoll sein und dürfen nicht bloß vorhandene Kenntnisse wiederholen.

Ich halte ein Modell mit regelmäßig vereinbarten Lernzeiten für praktikabel. Teams könnten gemeinsam festlegen, welche Aufgaben vorrangig sind und wann eine Vertretung möglich ist. Digitale Materialien sollten durch erreichbare Ansprechpersonen ergänzt werden. Nach einigen Monaten wäre zu überprüfen, ob die neuen Kenntnisse im Alltag tatsächlich helfen. Die Auswertung sollte auch Rückmeldungen der Teilnehmenden berücksichtigen, statt ausschließlich wirtschaftliche Kennzahlen heranzuziehen.

Ein solches Vorgehen verbindet Verlässlichkeit mit Flexibilität. Es verhindert, dass Weiterbildung zu einer zusätzlichen privaten Pflicht wird, und ermöglicht zugleich eine Planung, die den unterschiedlichen Voraussetzungen eines Betriebs Rechnung trägt. Entscheidend ist, Lernen als gemeinsame Verantwortung zu verstehen.`,
  `Sehr geehrte Frau Neumann,

leider kann ich den vereinbarten Berichtstermin nicht einhalten. Dafür möchte ich mich ausdrücklich entschuldigen. Bei der Prüfung der zuletzt gelieferten Daten sind Widersprüche aufgetreten, die wir vor einer Veröffentlichung sorgfältig klären müssen. Eine ungeprüfte Abgabe würde aus meiner Sicht die Qualität des gesamten Projekts gefährden.

Ich bitte Sie um Verständnis für diese unerwartete Verzögerung. Könnten wir den endgültigen Bericht am kommenden Mittwoch einreichen? Bis Freitag kann ich Ihnen bereits eine Zusammenfassung der gesicherten Ergebnisse und eine Übersicht der noch offenen Fragen schicken. Dadurch hätten Sie eine verlässliche Grundlage für die geplante Besprechung.

Falls dieser Vorschlag Ihre weitere Planung erschwert, bin ich gern zu einem kurzen Gespräch bereit, um gemeinsam eine passende Zwischenlösung zu vereinbaren. Vielen Dank für Ihre Unterstützung.

Mit freundlichen Grüßen
Alex Meyer`,
]

/** Adapted from the six C1 functions in 692f280^:apps/frontend/data/writing/c1/.
 * Communicative functions, register and detailed feedback retained; contracts and examples replaced.
 */
export const writingPrompts = modules
  .find(m => m.id === 'writing')!
  .tasks.flatMap(task => {
    const rules = task.runtime
    const forum = task.n === 1
    const target = forum ? 230 : 120
    const sample = { ...task.seed }
    for (const key of ['id', 'createdAt', 'testingPart', 'difficulty', 'examOnly'])
      delete sample[key]
    const register = forum
      ? 'Forum discussion post: clear position, developed arguments, relevant examples and a conclusion. Use a neutral, coherent argumentative register; no formal letter conventions.'
      : 'Formal or semi-formal email to the named recipient: appropriate salutation, polite requests, explanation and closing. Use Sie consistently where appropriate and respect the relationship.'
    const generator = definePrompt({
      skill: 'writing',
      part: task.n,
      kind: 'generator',
      role: 'You author original German Goethe-Zertifikat C1 writing tasks in the modular format introduced in 2024.',
      task: `Generate {count} independent Part ${task.n} writing exercises.`,
      llm: { maxTokens: 6000, temperature: 0.8 },
      rules: [
        register,
        ...task.hints,
        'Cover education, work, digitalisation, environment, health, mobility, city life, culture, science or consumption. Vary situations; do not copy published textbooks or official examples.',
        'Provide exactly four explicit communicative requirements, a realistic situation and the target recipient/audience. Require explanation, evaluation and substantiated reasoning at C1, rather than a list of short factual sentences.',
        `Use German for all learner-facing content. wordCount must be ${JSON.stringify(task.seed['wordCount'])}; estimatedTime must be ${rules.minutes}. No solution or IDs.`,
        'Use the exact payload keys in the original example. Return an array even for one exercise.',
      ],
      examples: [JSON.stringify([sample], null, 2)],
      outputContract: 'Only a valid JSON array, without markdown.',
    })
    const answer = definePrompt({
      skill: 'writing',
      part: task.n,
      kind: 'answer',
      role: 'You produce a strong but realistic C1 German model answer, addressing the actual task.',
      task: 'Exercise: {task}',
      llm: { maxTokens: 3000 },
      rules: [
        register,
        `Write approximately ${target} words in German. Count the words in the actual response; do not use a fixed example count.`,
        'Fulfil all four communicative functions with specific, plausible detail. Use varied syntax, precise vocabulary, logical paragraphing and appropriate cohesive devices. Avoid memorised filler and invented claims about the learner.',
        'Explain highlights in {outputLanguage}.',
      ],
      examples: [
        JSON.stringify(
          {
            content: originalModels[task.n - 1],
            wordCount: originalModels[task.n - 1]!.trim().split(/\s+/u).length,
            highlights: {
              greeting: forum ? '' : 'Sehr geehrte Frau Neumann,',
              mainPoints: [
                'All four communicative requirements are developed in the appropriate register.',
              ],
              closing: forum ? '' : 'Mit freundlichen Grüßen',
              keyPhrases: ['Aus meiner Sicht', 'gemeinsam eine passende Zwischenlösung'],
            },
          },
          null,
          2
        ),
      ],
      outputContract:
        'One JSON object: {"content":"German model answer","wordCount":number,"highlights":{"greeting":"","mainPoints":["why the requirements are fulfilled"],"closing":"","keyPhrases":["useful C1 expressions"]}}.',
    })
    const review = definePrompt({
      skill: 'writing',
      part: task.n,
      kind: 'review',
      role: 'You give strict, evidence-based formative Goethe C1 writing feedback using the modular A–E rubric. This is an estimate, not an official certificate result.',
      task: 'Task and requirements: {task}\nLearner response: {userContent}\nFeedback language: {outputLanguage}',
      llm: { maxTokens: 5500 },
      rules: [
        register,
        `Target approximately ${target} words. Below ${target / 2} words: taskCompletion E and zero for the entire task. At exactly ${target / 2} words the automatic length zero does not apply. Off-topic or taskCompletion E also means zero for all criteria.`,
        'taskCompletion (Erfüllung): cover the four actual communicative functions, address the recipient, maintain text type and register. Do not invent requirements. Penalise mixed formats and inappropriate register with concrete evidence.',
        'coherence (Kohärenz): evaluate logical organisation, paragraphs, opening/closing and connections. vocabulary (Wortschatz): evaluate range, precision and appropriateness. structures (Strukturen): evaluate syntax, grammatical range, spelling and control; distinguish occasional slips from errors obscuring meaning.',
        `Only A/B/C/D/E bands. ${rules.criteria!.map(c => `${c.id}: A/B/C/D/E = ${c.allowedPoints!.join('/')}`).join('; ')}. No intermediate points.`,
        'Use only the task and submitted text. Give 3–6 real error quotations when available, exact German corrections and concise explanations. Never invent errors to meet a quota. Do not rewrite the entire answer.',
        'Comments, summary, strengths, improvements, priorityFixes and report must use {outputLanguage}; German corrections remain German. Provide a concise report with strengths, criterion weaknesses and specific next steps.',
        'totalPoints is the exact sum of criterion points. Do not claim passed_module: a single task cannot establish the module result.',
      ],
      outputContract: JSON.stringify(
        {
          criteria: rules.criteria!.map(c => ({
            id: c.id,
            label: c.label,
            maxPoints: c.maxPoints,
            grade: 'E',
            points: 0,
            comment: 'Evidence and next step',
          })),
          totalPoints: 0,
          maxPoints: rules.maxPoints,
          summary: 'Feedback',
          strengths: [],
          improvements: [],
          wordCount: { actual: 0, min: target },
          ruleApplied: 'none',
          checks: [
            { id: 'contentCoverage', required: 4, covered: 0 },
            {
              id: 'register',
              expected: forum ? 'neutral forum' : 'formal/semi-formal',
              detected: '',
              ok: false,
            },
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
