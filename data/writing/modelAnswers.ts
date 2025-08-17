/**
 * Model answers for German A2/C1 writing exercises
 * High-quality example responses that demonstrate proper structure, vocabulary, and grammar
 */
import type { Difficulty } from '~/utils/types'

export interface ModelAnswer {
  id: string
  topicId: string
  content: string
  wordCount: number
  highlights?: {
    greeting?: string
    mainPoints?: string[]
    closing?: string
    keyPhrases?: string[]
  }
}

export const modelAnswersA2: ModelAnswer[] = [
  {
    id: 'a2-answer-1',
    topicId: 'a2-topic-1',
    content: `Lieber Max,

vielen Dank für deine Einladung zu deiner Geburtstagsfeier! Ich freue mich sehr und komme gerne zu deiner Party.

Zum Geburtstag möchte ich dir ein neues Buch schenken. Du liest doch so gerne Krimis, oder? Ich habe schon eins für dich ausgesucht.

Kannst du mir noch ein paar Details zur Party sagen? Wann beginnt die Feier genau? Und wo findet sie statt - bei dir zu Hause oder in einem Restaurant? Kommen auch andere Freunde aus unserem Deutschkurs?

Ich kann es kaum erwarten, dich zu sehen und mit dir zu feiern!

Viele Grüße
Anna`,
    wordCount: 95,
    highlights: {
      greeting: "Lieber Max,",
      mainPoints: [
        "Freue mich auf die Party",
        "Geschenk: Krimi-Buch", 
        "Fragen zu Details"
      ],
      closing: "Viele Grüße Anna",
      keyPhrases: ["freue mich sehr", "kannst du mir sagen", "kann es kaum erwarten"]
    }
  }
]

export const modelAnswersС1: ModelAnswer[] = [
  {
    id: 'c1-answer-1',
    topicId: "c1-topic-1",
    content: `KI am Arbeitsplatz: Automatisieren mit Augenmaß

In meinem Arbeitsalltag erweist sich KI besonders bei repetitiven Routinen als hilfreich: Entwürfe für Standardmails, Priorisierung von Tickets, schnelle Auswertung großer Textmengen. Grenzen sehe ich dort, wo Kontextwissen, Verantwortung oder Empathie entscheidend sind – etwa bei heiklen Kundengesprächen, Beurteilungen oder finalen Freigaben.

Ein Beispiel: In unserem Support klassifiziert ein Modell Anfragen vor. Die Bearbeitungszeit sank um rund 20 %, weil Tickets automatisch geroutet werden. Gleichzeitig zeigte sich, dass das System ironische Formulierungen missdeutet und dadurch falsche Kategorien vergibt; ohne menschliche Korrektur hätten wir Qualitätsverluste riskiert.

Pro sprechen Effizienz, geringere Fehler in Routineprozessen und die Möglichkeit, Beschäftigte für höherwertige Aufgaben zu gewinnen. Contra sind Datenschutzrisiken, Intransparenz von Entscheidungen („Black Box“), Qualifikationsdruck und reale Substitution bestimmter Tätigkeiten. Zudem bleibt die Haftungsfrage: Wer trägt Verantwortung, wenn KI-Vorschläge übernommen werden?

Meine Empfehlung: nicht „alles oder nichts“, sondern ein gestuftes Vorgehen. Klare Richtlinien (Datenminimierung, Quellenangaben, Prüfpflicht), verbindliche Human-in-the-Loop-Kontrollen an kritischen Punkten, kleine Pilotprojekte mit messbaren Kriterien sowie verpflichtende Schulungen. So lässt sich Nutzen heben, ohne Sorgfalt und Verantwortung zu verlieren – und die Organisation bleibt lernfähig.`,
    wordCount: 230,
    highlights: {
      mainPoints: [
        "Aufgabenerfüllung: A – Alle vier Inhaltspunkte vollständig, neutrale Forumsregister, klare Position.",
        "Kohärenz: A – Stringente Absatzstruktur (Kontext → Beispiel → Pro/Contra → Empfehlung) mit präzisen Verknüpfungen.",
        "Wortschatz: A – Fachnahe, differenzierte Lexik (Black Box, Human-in-the-Loop, Datenminimierung, Haftungsfrage).",
        "Strukturen: A – Variabler Satzbau, Konjunktiv für Hypothesen, korrekte Zeichensetzung; Fehler beeinträchtigen das Verständnis nicht."
      ],
      keyPhrases: [
        "Human-in-the-Loop",
        "Transparenzberichte",
        "Audit-Logs",
        "gestuftes Vorgehen",
        "Qualifikationsdruck",
        "Datenminimierung"
      ]
    }
  },
  {
    id: 'c1-answer-2',
    topicId: "c1-topic-2",
    content: `Sehr geehrtes Team Personalservice,

vielen Dank für die Einführung des Dienstrad-Leasings – das passt hervorragend zu unseren Nachhaltigkeitszielen. Wäre es möglich, mir nähere Informationen zu den Konditionen zu senden?

Konkret interessieren mich: private Nutzung außerhalb des Arbeitswegs, Versicherung/Diebstahlschutz (Selbstbehalt?), Laufzeit und Kosten bei vorzeitiger Beendigung sowie die Regelung bei einem möglichen Stellenwechsel.

Zu meinen Rahmenbedingungen: Ich pendele täglich 14 km, habe im Büro einen überdachten Stellplatz, zu Hause jedoch nur einen Hof. Wie wird Wartung im Winter organisiert und welche Werkstätten sind vorgesehen?

Als Vorschlag: Ein kurzer Probemonat oder ein Info-Termin für Mitarbeitende würde viele Fragen klären. Über eine Rückmeldung bis zum 30.09. würde ich mich freuen.

Mit freundlichen Grüßen
Frau Müller`,
    wordCount: 112,
    highlights: {
      greeting: "Sehr geehrtes Team Personalservice,",
      mainPoints: [
        "Aufgabenerfüllung: A – Höfliches Verständnis, konkrete Bitten, Klärung von Bedingungen, Vorschlag/Kompromiss; passender Adressat und Stil.",
        "Kohärenz: A – Klare Gliederung in kurze Absätze, explizite Leitfragen und saubere Verknüpfungen.",
        "Wortschatz: A – Präzise Verwaltungsterminologie (Konditionen, vorzeitige Beendigung, Diebstahlschutz).",
        "Strukturen: A – Höflichkeits- und Konjunktivformen („wäre es möglich“), korrekte Orthografie und Zeichensetzung."
      ],
      closing: "Mit freundlichen Grüßen",
      keyPhrases: [
        "wäre es möglich",
        "vorzeitige Beendigung",
        "Rückmeldung bis zum 30.09.",
        "Probemonat",
        "Diebstahlschutz"
      ]
    }
  },
  {
    id: 'c1-answer-3',
    topicId: "c1-topic-3",
    content: "KI-Tools haben in Studium und Beruf längst Einzug gehalten. Statt reflexhaft zu verbieten, sollten wir klären, wann ihr Einsatz verantwortbar ist. Meine Position: KI darf unterstützen, aber nicht ersetzen – transparent, überprüfbar und datensparsam.\n\nVerantwortungsvoll ist der Einsatz, wenn Ziele und Grenzen vorab festgelegt sind: Quellen müssen genannt, Eingaben ohne sensible Daten formuliert und Ergebnisse kritisch geprüft werden. Zudem braucht es Grundkenntnisse zu Funktionsweise, Bias und Urheberrecht, damit Nutzerinnen und Nutzer bewusste Entscheidungen treffen.\n\nEin Beispiel: In einem Forschungsseminar habe ich eine Gliederung mit Hilfe eines Sprachmodells erstellt. Das Tool half beim Strukturieren und beim Formulieren präziser Leitfragen; gleichzeitig enthielt ein Absatz sachliche Fehler. Erst durch Gegencheck mit Fachliteratur wurde der Entwurf belastbar. Das zeigt, wie Qualität steigen kann – sofern Kontrolle und Fachwissen vorhanden sind.\n\nPro sprechen Effizienz, Barrierefreiheit und neue Kreativität. Contra stehen Kompetenzabbau, Datenschutzrisiken, ungleiche Zugänge und die Haftungsfrage, wenn fehlerhafte Ausgaben übernommen werden. Ein reiner Verbotsansatz löst diese Spannungen nicht.\n\nEmpfehlenswert sind klare Leitlinien: verpflichtende Kennzeichnung von KI-Hilfe, Schulungen für Studierende und Mitarbeitende, sowie Prüfungsformate, die Recherche, Reflexion und Quellenarbeit sichtbar machen. Denkbar ist ein „KI-Kompetenzführerschein“ als Nachweis für verantwortliche Nutzung. So sichern wir Qualität, Fairness und Lernziele. Fazit: nicht Verhinderung, sondern reguliertes Ermöglichen.",
    wordCount: 235,
    highlights: {
      mainPoints: [
        "Klare Voraussetzungen für verantwortungsvollen Einsatz",
        "Konkretes Beispiel mit Nutzen und Risiko",
        "Abgewogene Pro-und-Contra-Argumentation",
        "Konkrete Empfehlung: Leitlinien, Schulungen, Kennzeichnung, Prüfungsformate"
      ],
      keyPhrases: [
        "transparent, überprüfbar und datensparsam",
        "Gegencheck mit Fachliteratur",
        "Kompetenzabbau und Haftungsfrage",
        "KI-Kompetenzführerschein",
        "reguliertes Ermöglichen"
      ]
    }
  },
  {
    id: 'c1-answer-4',
    topicId: "c1-topic-4",
    content: "Sehr geehrte Frau Schneider,\n\nich weiß, wie wichtig der Kundentermin in Hamburg für unser Projekt ist. Leider fallen wegen des angekündigten Bahnstreiks meine direkten Verbindungen aus; das Hotel kann nur bis morgen 18 Uhr kostenfrei storniert werden, danach würden 80 % anfallen. Alternativ gäbe es eine Umstiegsroute mit deutlich längerer Fahrzeit.\n\nBitte teilen Sie mir mit, ob meine physische Anwesenheit zwingend erforderlich ist oder ob eine Zuschaltung per Videokonferenz akzeptabel wäre. Falls Präsenz gewünscht wird, könnte ich bereits am Vortag mit einer frühen Verbindung anreisen.\n\nMein Vorschlag: Videotermin mit geteilten Unterlagen; Kosten: null, Vorbereitung identisch. Zweitbeste Option: Anreise am Vortag, Mehrkosten ca. 140 €, dafür pünktliche Präsenz. Die Präsentation und das Protokoll bereite ich heute fertig vor, damit Sie entscheiden können.\n\nMit freundlichen Grüßen  \n[Ihr Name]",
    wordCount: 128,
    highlights: {
      greeting: "Sehr geehrte Frau Schneider,",
      mainPoints: [
        "Höflicher Einstieg mit Verständnis und Problemanzeige",
        "Klärung von Bedingungen: Stornofristen, Alternativverbindungen",
        "Bitte um Entscheidung/Bestätigung",
        "Konkreter Vorschlag mit Kosten- und Zeitrahmen, Sicherung der Vorbereitung"
      ],
      closing: "Mit freundlichen Grüßen",
      keyPhrases: [
        "zwingend erforderlich",
        "Zuschaltung per Videokonferenz",
        "Anreise am Vortag",
        "Mehrkosten ca. 140 €",
        "Vorbereitung identisch"
      ]
    }
  },
  {
    id: 'c1-answer-5',
    topicId: "c1-topic-5",
    content:
      "Reparieren sollte der Standard sein – Neuanschaffung die begründete Ausnahme. Sinnvoll ist eine Reparatur, wenn Sicherheitsrisiken ausgeschlossen sind, Ersatzteile verfügbar bleiben und die Gesamtkosten unter dem Preis eines gleichwertigen Neugeräts liegen. Unternehmen profitieren zusätzlich, wenn sie Service als Geschäftsmodell etablieren und Garantien nicht erlöschen, sobald ein Akku gewechselt wird.\n\nKonkretes Beispiel: Mein Smartphone hielt nach drei Jahren nur noch wenige Stunden. In einem Reparaturcafé ersetzte ich den Akku für 45 Euro, inklusive Einweisung in Sicherheitsschritte. Das Gerät läuft seitdem stabil; zugleich zeigte sich die Grenze: Eine versiegelte Gehäusekonstruktion machte die Arbeit unnötig aufwendig und riskant.\n\nPro Reparatur sprechen eine deutlich bessere Umweltbilanz durch längere Nutzungsdauer, regionale Dienstleistungsjobs und geringere Abhängigkeit von Rohstoffen. Contra sind mögliche Effizienzverluste alter Geräte, der Zeitaufwand, fehlende Softwareupdates und die Gefahr geplanter Obsoleszenz. Ein reines „Buy new“ fördert Kurzlebigkeit, ein pauschaler Reparaturzwang verhindert Innovation.\n\nDeshalb empfehle ich einen Mix: gesetzliches Recht auf Reparatur und modulare Designs, ein staatlich kofinanzierter Reparaturbonus sowie reduzierte Mehrwertsteuer auf Ersatzteile. Kommunale Werkstätten und Schulen können Grundlagen vermitteln; Hersteller kennzeichnen reparierbare Produkte mit einem Score. So entsteht Wahlfreiheit – mit klaren Anreizen für Langlebigkeit, ohne Fortschritt zu bremsen. Fazit: Reparieren zuerst, aber intelligent geregelt.",
    wordCount: 242,
    highlights: {
      mainPoints: [
        "Klare Kriterien für sinnvolle Reparaturen",
        "Konkretes Beispiel mit Nutzen und Grenze",
        "Ausgewogenes Pro-und-Contra mit Umwelt, Jobs, Innovation",
        "Konkrete, realistische Empfehlungen (Recht auf Reparatur, Bonus, Steuer, Score)"
      ],
      keyPhrases: [
        "Reparieren sollte der Standard sein",
        "Service als Geschäftsmodell",
        "geplante Obsoleszenz",
        "modulare Designs",
        "Wahlfreiheit mit Anreizen"
      ]
    }
  },
  {
    id: 'c1-answer-6',
    topicId: "c1-topic-6",
    content:
      "Sehr geehrte Frau Dr. Keller,\n\nvielen Dank für die klaren Anforderungen an die Präsentation; wir möchten sie bestmöglich erfüllen. Auf Moodle stehen jedoch 10–12 Minuten und mindestens fünf Quellen, während das Handout 15 Minuten und acht Quellen nennt. Zudem ist unsere Mitstudentin Lara krank (Attest bis Freitag).\n\nKönnten Sie bitte bestätigen, welche Dauer, Quellenzahl und Abgabeform (PDF vorab oder Upload nach dem Termin) gelten? Falls Präsenz aller Teammitglieder erforderlich ist, bitten wir um eine kurze Fristverlängerung bis Mittwoch.\n\nVorschlag: Wir liefern Ihnen morgen ein einseitiges Handout mit Gliederung und Quellenliste und halten am Montag einen 12-minütigen Vortrag zu dritt; Lara übernimmt später das schriftliche Protokoll. Ein kurzer Q&A-Slot würde die offenen Punkte klären.\n\nMit freundlichen Grüßen  \n[Ihr Name]",
    wordCount: 149,
    highlights: {
      greeting: "Sehr geehrte Frau Dr. Keller,",
      mainPoints: [
        "Höflicher Einstieg und Problemanzeige (widersprüchliche Angaben)",
        "Klärungsfragen zu Umfang, Quellenzahl, Abgabeform + Team-Bedingungen",
        "Bitte um Rückmeldung und ggf. Fristverlängerung",
        "Konkreter, umsetzbarer Kompromiss mit Verantwortlichkeiten"
      ],
      closing: "Mit freundlichen Grüßen",
      keyPhrases: [
        "bitte bestätigen",
        "Fristverlängerung",
        "einseitiges Handout",
        "Q&A-Slot",
        "schriftliches Protokoll"
      ]
    }
  }
];


/**
 * Get model answer for a specific topic
 */
export function getModelAnswer(topicId: string, difficulty: Difficulty): ModelAnswer | undefined {
  if (difficulty === 'A2') {
    return modelAnswersA2.find(answer => answer.topicId === topicId)
  }
  return modelAnswersС1.find(answer => answer.topicId === topicId)
}
