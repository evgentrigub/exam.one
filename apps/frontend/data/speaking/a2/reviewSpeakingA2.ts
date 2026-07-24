import type { SpeakingTopicA2Teil1, SpeakingTopicA2Teil2 } from '~/utils/exercises/speaking'

function outputRules(teil: 1 | 2): string {
  const criteria =
    teil === 1
      ? [
          { id: 'answers', label: 'Antworten', points: 0, maxPoints: 2 },
          { id: 'questions', label: 'Fragen stellen', points: 0, maxPoints: 2 },
        ]
      : [
          { id: 'taskCompletion', label: 'Aufgabenerfüllung', points: 0, maxPoints: 4 },
          { id: 'language', label: 'Sprachliche Realisierung', points: 0, maxPoints: 4 },
        ]

  return `
Gib ausschließlich ein valides JSON-Objekt in diesem Schema zurück:
${JSON.stringify(
  {
    teil,
    totalPoints: 0,
    maxPoints: teil === 1 ? 4 : 8,
    criteria: criteria.map(item => ({
      ...item,
      comment: 'Kurzer konkreter Kommentar auf Deutsch',
    })),
    strengths: ['Konkrete Stärke auf Deutsch'],
    improvements: ['Konkrete nächste Verbesserung auf Deutsch'],
    summary: 'Kurze Gesamtbeurteilung auf Deutsch',
  },
  null,
  2
)}
Alle Punkte müssen ganze Zahlen innerhalb des jeweiligen Maximums sein.
Kein Markdown und kein Text außerhalb des JSON-Objekts.
`
}

export function reviewPromptSpeakingA2Teil1(
  topic: SpeakingTopicA2Teil1,
  answersTranscript: string,
  questionsTranscript: string
): string {
  return `
Du bist eine erfahrene Prüferin für Goethe-Zertifikat A2 Sprechen.
Bewerte eine selbstständige, textbasierte Übungsadaption von Teil 1. Bewerte nur,
was in den STT-Transkripten erkennbar ist; Aussprache darf nicht bewertet werden.

Thema: ${topic.theme}
Fragen, die beantwortet werden sollten:
${topic.answerQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

Transkript der Antworten:
${answersTranscript}

Fragen, die der Lernende stellen sollte:
${topic.askQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

Transkript der gestellten Fragen:
${questionsTranscript}

Vergib maximal 4 direkte Punkte:
- answers, Label "Antworten", 0–2 Punkte: alle vier Fragen verständlich und mit
  einfachen vollständigen A2-Sätzen beantwortet; kurze passende Details sind positiv.
- questions, Label "Fragen stellen", 0–2 Punkte: alle vier Fragen erkennbar,
  verständlich und grammatisch als Fragen formuliert.

Setze teil auf 1, maxPoints auf 4 und gib genau die zwei Kriterien answers und
questions mit jeweils maxPoints 2 zurück. totalPoints ist deren Summe.
${outputRules(1)}
`
}

export function reviewPromptSpeakingA2Teil2(
  topic: SpeakingTopicA2Teil2,
  monologueTranscript: string
): string {
  return `
Du bist eine erfahrene Prüferin für Goethe-Zertifikat A2 Sprechen.
Bewerte die Texttranskription eines Monologs aus Teil 2. Bewerte nur, was im
Transkript erkennbar ist; Aussprache darf nicht bewertet werden.

Thema: ${topic.theme}
Vier Leitpunkte:
${topic.keywords.map((keyword, index) => `${index + 1}. ${keyword}`).join('\n')}

STT-Transkript:
${monologueTranscript}

Vergib maximal 8 direkte Punkte:
- taskCompletion, Label "Aufgabenerfüllung", 0–4 Punkte: Abdeckung der vier
  Leitpunkte, Verständlichkeit und ein ausreichend zusammenhängender Monolog.
- language, Label "Sprachliche Realisierung", 0–4 Punkte: passender A2-Wortschatz,
  einfache grammatische Strukturen und Verknüpfungen wie und, aber oder deshalb.
  Kleine mündliche Fehler sind erlaubt, solange die Aussage verständlich bleibt.

Setze teil auf 2, maxPoints auf 8 und gib genau die zwei Kriterien taskCompletion
und language mit jeweils maxPoints 4 zurück. totalPoints ist deren Summe.
${outputRules(2)}
`
}
