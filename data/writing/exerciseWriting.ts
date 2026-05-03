import type { WritingTopic } from '~/utils/types'

export const writingTipsC1Teil1 = [
  'Beginnen Sie mit 2–3 Sätzen Kontext und einer Leitfrage; benennen Sie Ihre Ausgangsposition nuanciert.',
  'Bearbeiten Sie die vier Inhaltspunkte je in einem Absatz nach dem Muster: Themensatz – Begründung – Beispiel – Mini-Fazit.',
  'Wägen Sie Pro und Contra ab und nutzen Sie Konnektoren wie „einerseits … andererseits“, „außerdem“, „jedoch“, „folglich“, „daher“.',
  'Verwenden Sie präzisen Wortschatz; erklären Sie Fachbegriffe kurz und bleiben Sie durchgängig sachlich (keine Umgangssprache).',
  'Sichern Sie Kohärenz durch Rückbezüge und Verknüpfungen; schließen Sie mit einer Empfehlung/Alternative und prüfen Sie die Wortzahl.',
]

export const writingTipsC1Teil2 = [
  'Betreff (falls vorgesehen), passende Anrede und ein klarer Eröffnungssatz mit Anlass und Ziel; konsequent in der Sie-Form schreiben.',
  'Höflichkeit und Verständnis zeigen; Bitten im Konjunktiv formulieren („wäre es möglich …“, „könnten Sie …“).',
  'Missverständnisse und Bedingungen präzise klären (Daten, Fristen, Zuständigkeiten) und neutral formulieren.',
  'Jeden Inhaltspunkt in einem kurzen Absatz strukturieren; konkrete, beantwortbare Fragen stellen.',
  'Mit einem umsetzbaren Vorschlag/Kompromiss und einer höflichen Bitte um Rückmeldung bis zu einem realistischen Termin schließen; passende Grußformel und Name.',
]

const defaultWritingTopicsC1: WritingTopic[] = [
  {
    id: "c1-topic-4",
    title: "Dienstreise und Bahnstreik – Abstimmung mit der/dem Vorgesetzten",
    topicType: "email",
    difficulty: "C1",
    testingPart: 2,
    estimatedTime: 25,
    wordCount: { min: 110, max: 140 },
    category: ["Mobilität und Verkehr", "Arbeit und Büroalltag"],
    createdAt: "2025-08-17T12:00:00.000Z",
    description: "(Halb)formelle E-Mail an eine vorgesetzte Person verfassen.",
    task:
      "Verfassen Sie eine (halb)formelle E-Mail an Ihre Vorgesetzte/Ihren Vorgesetzten: Nächste Woche ist ein Kundentermin in Hamburg geplant, jedoch fällt wegen eines Bahnstreiks Ihre Verbindung aus; das Hotel ist nur eingeschränkt stornierbar. Beziehen Sie sich auf alle vier Inhaltspunkte:\n" +
      "1) Höflich eröffnen, Verständnis zeigen und auf das Reiseproblem aufmerksam machen.\n" +
      "2) Klären, ob Präsenz zwingend ist, und Bedingungen beschreiben (Stornofristen, Erstattungen, Alternativverbindungen).\n" +
      "3) Um Entscheidung/Zustimmung zu einer Alternative bitten (Videokonferenz, Abreise am Vortag, andere Route).\n" +
      "4) Konkreten Vorschlag/Kompromiss mit kurzer Kosten- und Zeitabschätzung machen und erläutern, wie die Vorbereitung gesichert wird.\n" +
      "Schreiben Sie circa 120 Wörter. Verwenden Sie eine passende Anrede und Grußformel.",
    requirements: [
      "Passende Anrede und Grußformel",
      "Neutral-bis-formelles Register",
      "Alle 4 Inhaltspunkte abdecken",
      "Umfang: ca. 120 Wörter (110–140)"
    ]
  }
]

const defaultWritingTopicsA2: WritingTopic[] = [
  {
    id: 'a2-topic-1',
    title: 'E-Mail an einen Freund',
    topicType: 'email',
    difficulty: 'A2',
    estimatedTime: 20,
    wordCount: {
      min: 80,
      max: 120
    },
    category: ['Freunde', 'Alltag', 'Persönlich'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine persönliche E-Mail an einen Freund oder eine Freundin.',
    task: 'Dein Freund Max hat dir geschrieben, dass er nächste Woche Geburtstag hat und eine kleine Party macht. Schreibe ihm eine E-Mail zurück.',
    requirements: [
      'Schreibe 80-120 Wörter',
      'Verwende eine passende Anrede und einen passenden Gruß',
      'Antworte auf seine Einladung',
      'Erzähle, was du ihm zum Geburtstag schenken möchtest',
      'Frage nach Details zur Party (Zeit, Ort, andere Gäste)'
    ],
  }
]

/**
 * Sample German writing topics for writing practice
 * Each topic is designed to match Goethe Institut certification standards
 */
export const defaultWritingTopics: WritingTopic[] = [
  ...defaultWritingTopicsA2,
  ...defaultWritingTopicsC1,
]