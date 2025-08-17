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
    id: '1',
    topicId: 'email-friend-001',
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
  },

  {
    id: '2',
    topicId: 'letter-formal-001', 
    content: `Sehr geehrte Damen und Herren,

ich möchte gerne ein Zimmer in Ihrem Hotel "Zur schönen Aussicht" für meinen Urlaub reservieren.

Ich plane, vom 15. bis 22. Juli nach München zu reisen. Für diese Zeit benötige ich ein Einzelzimmer für eine Person. Das Zimmer sollte ruhig sein und möglichst einen schönen Blick haben.

Könnten Sie mir bitte den Preis pro Nacht mitteilen? Ist das Frühstück im Preis inbegriffen oder kostet es extra? Gibt es auch die Möglichkeit, abends im Hotel zu essen?

Außerdem hätte ich gerne eine schriftliche Bestätigung der Reservierung. Sie können mir gerne per E-Mail antworten.

Ich freue mich auf Ihre Antwort und meinen Aufenthalt in München.

Mit freundlichen Grüßen
Thomas Müller

Tel: 030-12345678
E-Mail: thomas.mueller@email.com`,
    wordCount: 142,
    highlights: {
      greeting: "Sehr geehrte Damen und Herren,",
      mainPoints: [
        "Reservierung 15.-22. Juli",
        "Einzelzimmer, ruhig",
        "Preis und Frühstück fragen",
        "Bestätigung erwünscht"
      ],
      closing: "Mit freundlichen Grüßen",
      keyPhrases: ["ich möchte gerne", "könnten Sie mir bitte", "ich freue mich auf"]
    }
  },

  {
    id: '3',
    topicId: 'essay-hometown-001',
    content: `Meine Heimatstadt Hamburg

Hamburg ist meine Heimatstadt und liegt im Norden Deutschlands. Die Stadt hat etwa 1,9 Millionen Einwohner und ist die zweitgrößte Stadt in Deutschland.

Was Hamburg besonders macht, ist der große Hafen. Hier kommen Schiffe aus der ganzen Welt an. Außerdem gibt es viele Kanäle und Brücken in der Stadt - sogar mehr als in Venedig! Die Speicherstadt ist sehr schön und gehört zum UNESCO-Welterbe.

Mir gefällt besonders die Mischung aus Tradition und Moderne in Hamburg. Die historischen Gebäude stehen neben neuen, modernen Häusern. Außerdem ist Hamburg sehr grün - es gibt viele Parks und die Alster mitten in der Stadt.

Touristen sollten unbedingt den Hafen besuchen und eine Hafenrundfahrt machen. Die Reeperbahn ist auch sehr berühmt, aber eher für Erwachsene interessant. Für Familien empfehle ich den Tierpark Hagenbeck oder das Maritime Museum.

Deshalb liebe ich meine Stadt: Hamburg ist lebendig, vielfältig und hat für jeden etwas zu bieten.`,
    wordCount: 175,
    highlights: {
      mainPoints: [
        "Lage und Größe",
        "Besonderheiten: Hafen, Kanäle",
        "Persönliche Meinung",
        "Empfehlungen für Touristen"
      ],
      keyPhrases: ["was Hamburg besonders macht", "mir gefällt besonders", "außerdem", "deshalb"]
    }
  },

  {
    id: '4',
    topicId: 'form-application-001',
    content: `Sehr geehrte Damen und Herren,

ich habe Ihre Stellenanzeige für eine Teilzeitstelle als Verkäufer/in in Ihrem Buchladen gelesen und möchte mich gerne dafür bewerben.

Ich bin 24 Jahre alt und komme ursprünglich aus Polen. Seit drei Jahren lebe ich in Deutschland und spreche schon gut Deutsch. Zurzeit besuche ich einen B1-Deutschkurs, aber meine Kenntnisse reichen für den Alltag und die Arbeit aus.

Bücher sind meine große Leidenschaft! Ich lese sehr viel und kenne mich gut mit deutscher und internationaler Literatur aus. In Polen habe ich schon einmal in einer Buchhandlung gearbeitet, deshalb habe ich Erfahrung im Verkauf.

Ich suche eine Teilzeitstelle, weil ich nebenbei noch Deutsch lerne. Am besten könnte ich nachmittags und am Wochenende arbeiten, etwa 20 Stunden pro Woche.

Gerne möchte ich Sie persönlich kennenlernen und mehr über die Stelle erfahren. Wann passt es Ihnen für ein Gespräch?

Mit freundlichen Grüßen
Maria Kowalski`,
    wordCount: 164,
    highlights: {
      greeting: "Sehr geehrte Damen und Herren,",
      mainPoints: [
        "Bewerbung für Verkäuferstelle",
        "Alter, Herkunft, Deutschkenntnisse",
        "Erfahrung und Interesse an Büchern",
        "Verfügbarkeit: Teilzeit"
      ],
      closing: "Mit freundlichen Grüßen",
      keyPhrases: ["möchte mich bewerben", "meine große Leidenschaft", "gerne möchte ich"]
    }
  },

  {
    id: '5',
    topicId: 'postcard-vacation-001',
    content: `Ciao aus Italien!

Hier am Meer ist es wunderschön! Das Wetter ist perfekt - jeden Tag Sonnenschein und 28 Grad. Das Wasser ist so warm und klar, dass ich jeden Tag schwimmen gehe.

Gestern waren wir in einem kleinen Fischerdorf und haben fantastisch gegessen. Die Pasta war so lecker! Heute fahren wir mit dem Boot zu einer kleinen Insel. Ich bin schon sehr gespannt.

Die Leute hier sind so freundlich und hilfsbereit. Auch wenn mein Italienisch nicht so gut ist, verstehen wir uns prima.

Wie geht es euch denn zu Hause? Regnet es noch so viel wie letzte Woche? Ich vermisse euch, aber ich genieße jeden Moment hier.

Bis bald und viele Grüße aus Bella Italia!

Eure Lisa

Familie Schmidt
Musterstraße 15
12345 Berlin`,
    wordCount: 92,
    highlights: {
      greeting: "Ciao aus Italien!",
      mainPoints: [
        "Wetter und Meer",
        "Aktivitäten und Essen",
        "Freundliche Menschen",
        "Frage nach Familie"
      ],
      closing: "Bis bald und viele Grüße",
      keyPhrases: ["es ist wunderschön", "bin schon gespannt", "wie geht es euch", "ich genieße"]
    }
  },

  {
    id: '6',
    topicId: 'email-complaint-001',
    content: `Sehr geehrte Damen und Herren,

ich habe am 5. März online bei Ihnen ein Buch bestellt (Bestellnummer: 12345), aber leider das falsche Buch erhalten.

Bestellt habe ich "Der Hobbit" von J.R.R. Tolkien, aber in dem Paket war "Harry Potter und der Stein der Weisen". Das ist zwar auch ein gutes Buch, aber nicht das, was ich wollte.

Ich möchte gerne das richtige Buch bekommen und das falsche zurückschicken. Können Sie mir bitte sagen, wie das funktioniert? Muss ich das falsche Buch zuerst zurücksenden oder schicken Sie mir erst das richtige?

Die Rechnung und alle Unterlagen habe ich noch. Gerne kann ich Ihnen auch Fotos von dem falschen Buch schicken, wenn das hilft.

Ich hoffe, dass wir das Problem schnell lösen können. Bitte antworten Sie mir so bald wie möglich.

Vielen Dank für Ihre Hilfe.

Mit freundlichen Grüßen
Stefan Weber`,
    wordCount: 147,
    highlights: {
      greeting: "Sehr geehrte Damen und Herren,",
      mainPoints: [
        "Problem: falsches Buch erhalten",
        "Details: Bestellnummer, was bestellt/erhalten",
        "Lösung: Umtausch gewünscht",
        "Bereitschaft zur Mitarbeit"
      ],
      closing: "Mit freundlichen Grüßen",
      keyPhrases: ["leider das falsche", "ich möchte gerne", "können Sie mir bitte sagen", "ich hoffe"]
    }
  },

  {
    id: '7',
    topicId: 'note-roommate-001',
    content: `Hallo Lisa,

ich muss für zwei Tage nach Frankfurt fahren (Donnerstag bis Freitag). Kannst du bitte auf meine Pflanzen aufpassen?

Die Blumen auf dem Balkon brauchen jeden Tag Wasser, aber nicht zu viel. Die große Pflanze im Wohnzimmer reicht einmal gießen.

Im Kühlschrank ist noch Pizza vom Wochenende - iss gerne alles auf! :)

Ich bin Freitag Abend wieder da.

Vielen Dank für deine Hilfe!

Tim`,
    wordCount: 67,
    highlights: {
      greeting: "Hallo Lisa,",
      mainPoints: [
        "Reise: Donnerstag-Freitag",
        "Bitte Pflanzen gießen",
        "Genaue Anweisungen",
        "Pizza angeboten"
      ],
      closing: "Vielen Dank!",
      keyPhrases: ["kannst du bitte", "nicht zu viel", "iss gerne", "vielen Dank für"]
    }
  },

  {
    id: '8',
    topicId: 'letter-invitation-001',
    content: `Liebe Freunde,

ich habe endlich meine neue Wohnung! Nach langer Suche bin ich vor zwei Wochen eingezogen und möchte das gerne mit euch feiern.

Deshalb lade ich euch herzlich zu meiner Einweihungsfeier ein:

Wann: Samstag, 20. Mai, ab 18:00 Uhr
Wo: Sonnenstraße 42, 3. Stock (bei mir)

Meine neue Wohnung ist nicht sehr groß, aber sehr gemütlich. Sie hat zwei Zimmer, eine moderne Küche und einen kleinen Balkon mit Blick in den Garten.

Für Essen und Trinken ist gesorgt! Ich mache Grillwurst und Salate, und es gibt auch vegetarische Sachen. Getränke sind auch genug da.

Bitte gebt mir bis zum 15. Mai Bescheid, ob ihr kommen könnt. Ihr könnt mir einfach eine WhatsApp schreiben oder anrufen.

Ich würde mich riesig freuen, wenn ihr alle kommen könntet!

Bis bald,
Julia

Tel: 0177-1234567`,
    wordCount: 142,
    highlights: {
      greeting: "Liebe Freunde,",
      mainPoints: [
        "Neue Wohnung - Einweihungsfeier",
        "Datum, Zeit, Adresse",
        "Beschreibung der Wohnung",
        "Essen und Trinken organisiert",
        "Rückmeldung bis 15. Mai"
      ],
      closing: "Bis bald, Julia",
      keyPhrases: ["lade ich euch herzlich ein", "für Essen ist gesorgt", "bitte gebt mir Bescheid", "würde mich riesig freuen"]
    }
  }
]

export const modelAnswersС1: ModelAnswer[] = [
  {
    id: '9',
    topicId: "1",
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
    id: '10',
    topicId: "2",
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
