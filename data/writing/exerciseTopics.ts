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

const writingTopicsC1: WritingTopic[] = [
  // C1 Level Topics
  {
    id: 'c1-topic-1',
    title: 'KI am Arbeitsplatz: Wie weit sollten Unternehmen automatisieren?',
    topicType: 'essay',
    difficulty: 'C1',
    testingPart: 1,
    estimatedTime: 50,
    wordCount: {
      min: 220,
      max: 260
    },
    category: ['Digitalisierung', 'KI'],
    createdAt: '2024-01-22',
    description: 'Schreiben Sie einen argumentativen Aufsatz zu einem aktuellen Thema.',
    task: `KI am Arbeitsplatz: Wie weit sollten Unternehmen automatisieren? 
    In vielen Unternehmen unterstützen KI-Tools bereits Texterstellung, Kundensupport und Datenanalyse. 
    Befürworter versprechen Effizienzgewinne, Kritiker warnen vor Fehlern, Bias und Jobabbau. 
    Diskutieren Sie im Forum.`,
    requirements: [
      'Erklären Sie, in welchen Aufgabenbereichen KI in Ihrem Arbeitsalltag sinnvoll ist und wo aus Ihrer Sicht klare Grenzen liegen.',
      'Argumentieren Sie anhand eines konkreten Beispiels, wie KI die Qualität oder Geschwindigkeit verbessert hat – oder zu Problemen geführt hat.',
      'Nennen Sie Gründe sowie Pro- und Contra-Argumente zu Datenschutz, Verantwortung, Qualifikationen und Auswirkungen auf Arbeitsplätze.',
      'Stellen Sie eine Alternative bzw. Empfehlung dar (z. B. klare Richtlinien, „Human-in-the-Loop“, Pilotprojekte, Schulungen) und begründen Sie diese.',
    ],
  },
  {
    id: 'c1-topic-2',
    title: 'Nachfrage zum Dienstrad-Leasing',
    topicType: 'email',
    difficulty: 'C1',
    testingPart: 2,
    estimatedTime: 25,
    wordCount: { min: 100, max: 140 },
    category: ['Mobilität und Verkehr', 'Arbeit und Büroalltag', 'Umwelt und Nachhaltigkeit'],
    createdAt: '2025-08-17T00:00:00.000Z',
    description: '(halb-)formelle E-Mail an den Personalservice.',
    task:
      `Ihr Unternehmen hat kürzlich ein Dienstrad-Leasing eingeführt. Nach der Infomail sind einige Punkte unklar, insbesondere zur privaten Nutzung, Versicherung und zum Eigenanteil.
      Inhaltspunkte:
      1) Zeigen Sie höflich Verständnis für das Angebot (nachhaltige Mobilität) und bitten Sie um weitere Informationen.
      2) Bitten Sie um Klärung konkreter Bedingungen (z. B. private Nutzung, Versicherung/Diebstahlschutz, Laufzeit, Regelung bei Jobwechsel).
      3) Beschreiben Sie Ihre persönlichen Rahmenbedingungen (Pendelstrecke, Abstellmöglichkeiten, Wartung im Winter) und welche Fragen sich daraus ergeben.
      4) Machen Sie einen Vorschlag/Kompromiss (z. B. Probemonat oder Info-Termin für Mitarbeitende) und bitten Sie um kurze Rückmeldung.`,
    requirements: [
      'C1-Format: (halb-)formelle E-Mail.',
      'Passende Anrede und Grußformel, neutrales bis formelles Register.',
      'Bearbeiten Sie alle vier Inhaltspunkte.',
      'Konkrete Bitte um Rückmeldung/Termin.',
      'Wortzahl: circa 120 Wörter (100–140).'
    ]
  }, 
  {
    id: "c1-topic-3",
    title: "KI-Tools im Studium und Beruf: Hilfsmittel oder unfairer Vorteil?",
    topicType: "article",
    difficulty: "C1",
    testingPart: 1,
    estimatedTime: 50,
    wordCount: { min: 210, max: 260 },
    category: ["Digitalisierung/Soziale Medien", "Bildung und Studium", "Arbeit und Büroalltag"],
    createdAt: "2025-08-17T12:00:00.000Z",
    description: "Forumsbeitrag im neutralen Stil zu einem aktuellen Thema verfassen.",
    task:
      "Schreiben Sie für ein Internetforum einen neutralen Diskussionsbeitrag zum Thema: „KI-Tools im Studium und Beruf: Hilfsmittel oder unfairer Vorteil?“. Beziehen Sie sich auf alle vier Inhaltspunkte:\n" +
      "1) Erklären Sie, unter welchen Voraussetzungen der Einsatz von KI-Tools verantwortungsvoll und sinnvoll ist.\n" +
      "2) Argumentieren Sie an einem konkreten Beispiel, wie KI die Qualität von Arbeit oder Studium verbessern oder verschlechtern kann.\n" +
      "3) Nennen Sie Gründe sowie Pro und Contra (Kompetenzerhalt, Datenschutz, Chancengleichheit, Haftung).\n" +
      "4) Stellen Sie eine Alternative/Empfehlung dar (Leitlinien, Schulungen, transparente Kennzeichnung, angepasste Prüfungsformate).\n" +
      "Schreiben Sie circa 230 Wörter.",
    requirements: [
      "Neutraler Forumsstil",
      "Genau 4 Inhaltspunkte abdecken",
      "Kohärente Struktur mit Einleitung, Hauptteil, Schluss",
      "Umfang: ca. 230 Wörter (210–260)"
    ]
  },
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
  },
  {
    id: "c1-topic-5",
    title: "Kreislaufwirtschaft im Alltag: Reparieren statt Wegwerfen?",
    topicType: "article",
    difficulty: "C1",
    testingPart: 1,
    estimatedTime: 50,
    wordCount: { min: 210, max: 260 },
    category: ["Umwelt und Nachhaltigkeit", "Konsum und Wirtschaft"],
    createdAt: "2025-08-17T12:00:00.000Z",
    description: "Forumsbeitrag im neutralen Stil mit klarer Position zum Thema Kreislaufwirtschaft verfassen.",
    task:
      "Schreiben Sie für ein Internetforum einen neutralen Diskussionsbeitrag zum Thema „Kreislaufwirtschaft im Alltag: Reparieren statt Wegwerfen?“. Beziehen Sie sich auf alle vier Inhaltspunkte:\n" +
      "1) Voraussetzungen für sinnvolle Reparaturen (Kosten, Sicherheit, Garantie, Ersatzteile) erläutern.\n" +
      "2) An einem Beispiel argumentieren, wie Reparatur Nutzen verlängert bzw. scheitern kann.\n" +
      "3) Gründe sowie Pro & Contra (Umweltbilanz, Arbeitsplätze, Innovation, Preise, geplante Obsoleszenz) nennen.\n" +
      "4) Alternative/Empfehlung darstellen (Sharing, modulare Produkte, Reparaturbonus, kommunale Werkstätten).\n" +
      "Schreiben Sie circa 230 Wörter.",
    requirements: [
      "Neutraler Forumsstil mit klarer Position",
      "Vier Inhaltspunkte vollständig abdecken",
      "Einleitung–Hauptteil–Schluss",
      "Umfang: ca. 230 Wörter (210–260)"
    ]
  },
  {
    id: "c1-topic-6",
    title: "Gruppenpräsentation – Klärung von Anforderungen",
    topicType: "email",
    difficulty: "C1",
    testingPart: 2,
    estimatedTime: 25,
    wordCount: { min: 110, max: 140 },
    category: ["Bildung und Studium"],
    createdAt: "2025-08-17T12:00:00.000Z",
    description: "(Halb)formelle E-Mail an eine Lehrperson zur Klärung von Widersprüchen und Bitte um Lösung.",
    task:
      "Verfassen Sie eine (halb)formelle E-Mail an Ihre Lehrende/Ihren Lehrenden: Für die Gruppenpräsentation kommende Woche sind Angaben auf der Plattform und im Handout widersprüchlich; zusätzlich ist ein Teammitglied krank. Beziehen Sie sich auf alle vier Inhaltspunkte:\n" +
      "1) Höflich eröffnen, Verständnis für Seminaranforderungen zeigen und auf das Problem hinweisen.\n" +
      "2) Missverständnisse klären (Umfang, Quellenzahl, Abgabeform) und Bedingungen beschreiben (Krankheit, Attest).\n" +
      "3) Um kurze Rückmeldung/Bestätigung bitten und ggf. um kleine Fristverlängerung oder Alternative.\n" +
      "4) Konkreten Vorschlag/Kompromiss machen (angepasste Aufteilung, Handout vorab, Q&A-Termin).\n" +
      "Schreiben Sie circa 120 Wörter. Verwenden Sie eine passende Anrede und Grußformel.",
    requirements: [
      "Anrede und Grußformel verpflichtend",
      "Neutral-bis-formelles Register",
      "Alle vier Inhaltspunkte abdecken",
      "Umfang: ca. 120 Wörter (110–140)"
    ]
  }
]

const writingTopicsA2: WritingTopic[] = [
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
export const writingTopics: WritingTopic[] = [
  ...writingTopicsA2,
  ...writingTopicsC1,
]