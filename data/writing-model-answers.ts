/**
 * Model answers for German A2/C1 writing exercises
 * High-quality example responses that demonstrate proper structure, vocabulary, and grammar
 */
import type { Difficulty } from '~/utils/types'

export interface ModelAnswer {
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

export const modelAnswersC1: ModelAnswer[] = [
  {
    topicId: 'essay-digitalization-001',
    content: `Digitalisierung und Gesellschaft – Chancen nutzen, Risiken begrenzen

Die fortschreitende Digitalisierung prägt nahezu alle Lebensbereiche: Arbeit, Bildung, Gesundheit, Konsum und soziale Beziehungen. Befürworter betonen zu Recht die gewaltigen Effizienzgewinne und die neue Teilhabe, die aus niedrigeren Zugangshürden entstehen. Gleichzeitig mehren sich kritische Stimmen, die den Verlust von Privatheit, die Verbreitung von Desinformation und die wachsende Abhängigkeit von Plattformmonopolen problematisieren.

Einerseits eröffnet die digitale Transformation enorme Möglichkeiten. Wissensbestände sind global verfügbar, kollaboratives Arbeiten über Zeitzonen hinweg ist selbstverständlich geworden, und datengetriebene Prozesse beschleunigen Innovationen – von der Medikamentenforschung bis zur Energiewende. In ländlichen Regionen können Telemedizin, E‑Government und Fernunterricht strukturelle Nachteile reduzieren. Zudem stärken barrierearme Tools die Inklusion von Menschen mit Behinderungen.

Andererseits entstehen gesellschaftliche Spannungen. Algorithmische Verstärkungseffekte fördern Echokammern, während Personalisierung die gemeinsame Informationsbasis erodiert. Der Arbeitsmarkt polarisiert sich: Hochqualifizierte profitieren überproportional, Routinetätigkeiten werden automatisiert. Nicht zuletzt verschiebt sich Macht hin zu wenigen globalen Konzernen, was Wettbewerb, Datenschutz und demokratische Kontrolle herausfordert.

Folglich muss die Frage nicht lauten, ob Digitalisierung gut oder schlecht ist, sondern wie sie gestaltbar bleibt. Nötig sind wirksame Regulierungen (Interoperabilität, Datenportabilität, Transparenz von Algorithmen), starke digitale Grundbildung für alle Altersgruppen und Investitionen in offene, gemeinwohlorientierte Infrastrukturen. So lassen sich Risiken begrenzen und Chancen breiter verteilen.

Meine Position ist daher differenziert: Die Digitalisierung ist weder Heilsversprechen noch Bedrohung, sondern ein Gestaltungsauftrag. Wo klare Leitplanken, digitale Mündigkeit und wettbewerbsfähige, europäische Alternativen vorhanden sind, überwiegen die Vorteile. Fehlen sie, drohen Abhängigkeiten, Desinformation und Exklusion – mit spürbaren Folgen für den gesellschaftlichen Zusammenhalt.`,
    wordCount: 330,
    highlights: {
      mainPoints: [
        'Chancen: Zugang, Effizienz, Inklusion',
        'Risiken: Datenschutz, Desinformation, Marktmacht',
        'Gestaltung: Regulierung, Bildung, offene Infrastruktur',
        'Position: differenziert, Leitplanken nötig'
      ],
      keyPhrases: [
        'algorithmische Verstärkungseffekte',
        'digitale Mündigkeit',
        'gemeinwohlorientierte Infrastrukturen',
        'Interoperabilität und Datenportabilität'
      ]
    }
  },

  {
    topicId: 'report-workplace-001',
    content: `Bericht: Arbeitsplatz der Zukunft – Auswirkungen geplanter Modernisierungen

Einleitung
Das Unternehmen beabsichtigt, Home‑Office‑Modelle, flexible Arbeitszeiten und moderne Kollaborationstools einzuführen. Ziel dieses Berichts ist es, Auswirkungen auf Mitarbeiterzufriedenheit und Produktivität zu analysieren und Empfehlungen abzuleiten.

Analyse
Vorteile: Flexible Modelle erhöhen nachweislich die wahrgenommene Autonomie, was sich positiv auf Motivation und Bindung auswirkt. Wegfall von Pendelzeiten reduziert Stress und erweitert den verfügbaren Fokus-Zeitraum. Digitale Tools verbessern die asynchrone Abstimmung und senken Übergabezeiten zwischen Teams.

Herausforderungen: Ohne klare Spielregeln drohen Entgrenzung und Überlastung (ständige Erreichbarkeit). Informelle Wissensflüsse reißen ab, was Onboarding und Innovation hemmen kann. Zudem besteht die Gefahr sozialer Isolation, insbesondere bei Berufseinsteigern. Führung auf Distanz erfordert neue Kompetenzprofile (Ergebnisorientierung, Feedbackkultur, psychologische Sicherheit).

Perspektiven verschiedener Gruppen: Eltern und Pendler profitieren besonders von Flexibilität; Produktionsnahe Bereiche benötigen hingegen hybride Lösungen. Neue Mitarbeitende brauchen strukturierte Lernpfade und Mentoring. Führungskräfte benötigen Training in virtueller Moderation und Zielvereinbarung.

Empfehlungen
1) Klare Rahmen: Kernzeiten, Meeting‑Standards, asynchrone Dokumentation.
2) Gesundheit: Recht auf Nichterreichbarkeit, ergonomische Ausstattungspauschalen.
3) Wissensmanagement: Entscheidungsprotokolle, offene Wissensbasen, Buddy-Programme.
4) Führung: Schulungen zu Remote‑Leadership und Outcome‑Messung.
5) Monitoring: Quartalsweise Pulsbefragungen zu Wohlbefinden und Produktivität.

Fazit
Die geplanten Maßnahmen versprechen Produktivitätsgewinne, sofern sie von verbindlichen Standards, gezielter Qualifizierung und systematischem Wissensmanagement begleitet werden. Andernfalls drohen Ermüdungseffekte und Koordinationsverluste.`,
    wordCount: 340,
    highlights: {
      mainPoints: [
        'Vorteile: Autonomie, weniger Pendeln, bessere Abstimmung',
        'Risiken: Entgrenzung, Wissensverlust, Isolation',
        'Zielgruppen: Eltern, Einsteiger, Führungskräfte',
        'Empfehlungen: Rahmen, Gesundheit, Wissensmanagement, Führung, Monitoring'
      ],
      keyPhrases: [
        'psychologische Sicherheit',
        'asynchrone Dokumentation',
        'Recht auf Nichterreichbarkeit',
        'Remote‑Leadership'
      ]
    }
  },

  {
    topicId: 'review-literature-001',
    content: `Kritische Rezension: Wolfgang Herrndorfs „Tschick“

Ohne die zentrale Wendung vorwegzunehmen: „Tschick“ verbindet Road‑Novel, Coming‑of‑Age und Gesellschaftsskizze in einer überraschend leichten, zugleich präzisen Sprache. Der Erzählerblick bleibt nah an den Figuren, wodurch Humor und Melancholie ein glaubwürdiges Spannungsverhältnis eingehen.

Stil und Sprache
Herrndorf arbeitet mit lakonischen Beobachtungen und pointierten Dialogen. Die scheinbar beiläufige Erzählweise erzeugt Tempo, während dichte Bildfelder – etwa Landschaftsminiaturen – einen poetischen Unterton beisteuern. Registerwechsel zwischen Umgangssprache und literarischer Verdichtung wirken funktional, nie manieriert.

Themen und Relevanz
Im Zentrum stehen Freundschaft, Herkunft, soziale Ungleichheit und die Frage nach Selbstbestimmung. Die Reise wird zur Erprobungsfläche jugendlicher Autonomie. Gesellschaftliche Ränder treten nicht als Kulisse, sondern als aktive Gegenwelt zum bürgerlichen Normalmodus auf. Dadurch gelingt dem Roman ein inklusiver Blick, der weder romantisiert noch den moralischen Zeigefinger erhebt.

Bewertung
Die Figurenzeichnung überzeugt durch Ambivalenz: Widersprüche bleiben stehen und laden zur Deutung ein. Einzelne Episoden wirken episodisch‑skizzenhaft, was die erzählerische Kohärenz gelegentlich lockert; zugleich entspricht dies der Perspektive jugendlicher Wahrnehmung. Insgesamt liefert „Tschick“ ein sprachlich zugängliches, literarisch eigenständiges Werk, das Leserinnen und Leser über das Ende hinaus beschäftigt. Empfehlenswert – gerade auch für den Unterricht, sofern die gesellschaftlichen Kontexte mit reflektiert werden.`,
    wordCount: 300,
    highlights: {
      mainPoints: [
        'Stil: lakonisch, pointiert, poetische Untertöne',
        'Themen: Freundschaft, Ungleichheit, Autonomie',
        'Bewertung: zugänglich und eigenständig, mit Ambivalenzen'
      ],
      keyPhrases: [
        'Coming‑of‑Age',
        'Registerwechsel',
        'inklusive Perspektive',
        'episodisch‑skizzenhaft'
      ]
    }
  },

  {
    topicId: 'proposal-environment-001',
    content: `Formeller Vorschlag: „Grüne Höfe – Mikroklima verbessern, Gemeinschaft stärken“

Problemstellung
Hitzewellen nehmen zu, versiegelte Flächen heizen Wohnquartiere auf. Gleichzeitig fehlen niedrigschwellige Begegnungsräume. Ziel ist eine quartiersweite Entsiegelung und Begrünung von Innenhöfen, ergänzt um Regenwassermanagement.

Lösungskonzept
1) Entsiegelung von 2.000 m² Höfen; Ersatz durch wasserdurchlässige Beläge und Staudenbeete.
2) Pflanzung von 80 klimaresilienten Bäumen (z. B. Feldahorn, Hainbuche) zur Verschattung.
3) Regenwassernutzung: Zisternen und Mulden‑Rigolen‑Systeme, um Starkregen zu puffern.
4) Gemeinschaftsbeete und Sitzinseln als soziale Ankerpunkte; saisonale Nachbarschaftsfeste.

Erwartete Wirkungen
– Temperaturspitzen sinken lokal um bis zu 2 °C; Aufenthaltsqualität steigt.
– Biodiversität nimmt messbar zu (Insektenhabitate, Vogelnahrung).
– Soziale Kohäsion durch partizipative Pflegepatenschaften.

Umsetzung und Zeitplan
Phase 1 (0–3 Monate): Partizipationsprozess, Flächenanalyse, Genehmigungen.
Phase 2 (4–9 Monate): Bauliche Maßnahmen, Baumpflanzungen, Zisternen.
Phase 3 (10–12 Monate): Möblierung, Kommunikationskampagne, Evaluation.

Risiken und Gegenmaßnahmen
Pflegeaufwand: Patenschaftsprogramm mit Schulungen; Trockenperioden: Tropfbewässerung aus Zisternen; Vandalismus: Beleuchtung und soziale Kontrolle durch Aktivierung.

Finanzierung
Kombination aus kommunalen Klimafonds, Stiftungsmitteln und Unternehmensspenden; Sachleistungen durch lokale Betriebe.

Schlussbemerkung
„Grüne Höfe“ verbindet Klimaanpassung mit sozialer Belebung. Das Projekt ist skalierbar, messbar und bürgernah – ein sichtbares Signal für nachhaltige Stadtentwicklung.`,
    wordCount: 360,
    highlights: {
      mainPoints: [
        'Entsiegelung und Begrünung',
        'Regenwassermanagement',
        'Soziale Aktivierung und Pflegepatenschaften',
        'Skalierbarkeit und Evaluation'
      ],
      keyPhrases: [
        'Mulden‑Rigolen‑Systeme',
        'klimaresiliente Bäume',
        'Klimaanpassung',
        'kommunale Klimafonds'
      ]
    }
  },

  {
    topicId: 'article-education-001',
    content: `Bildung im Umbau: Drei Hebel für ein gerechteres System

Die Diagnose ist vertraut: Lehrermangel, ungleiche Chancen, schleppende Digitalisierung. Doch statt pauschaler Klagen braucht es einen klaren Reformpfad – machbar, messbar, menschenzentriert.

Erstens: Personal sichern durch neue Wege. Quereinstieg ja, aber qualitätsgesichert: verpflichtende didaktische Ausbildung, Mentoring im Tandem und reduzierte Unterrichtsdeputate im ersten Jahr. Regionale Anreize – von Wohnkostenzuschüssen bis Mobilitätsbudgets – lenken Lehrkräfte dorthin, wo sie fehlen.

Zweitens: Unterricht entlasten und Lernen personalisieren. Digitale Basisinfrastruktur (WLAN, Endgeräte, Lernplattformen) ist kein Luxus, sondern Voraussetzung. Offene, geprüfte Lernmaterialien verringern Abhängigkeiten und ermöglichen adaptive Lernpfade. Diagnostische Kurzchecks zu Beginn jeder Einheit schaffen Transparenz über den Lernstand und geben Lehrkräften Zeit für Förderung statt Verwaltung.

Drittens: Früh investieren, um Spätfolgen zu vermeiden. Sprachliche Bildung und multiprofessionelle Teams in der Primarstufe zahlen sich überproportional aus. Schulen in herausfordernden Lagen brauchen mehr Zeit pro Kind, kleinere Klassen und starke Kooperation mit Sozialarbeit und Eltern.

Wer nun einwendet, es fehle das Geld, übersieht die Folgekosten des Nichtstuns: wiederholte Schuljahre, Ausbildungsabbrüche, demotivierte Lehrkräfte. Eine ehrliche Priorisierung im Haushalt – flankiert von Evaluation und Transparenz – schafft Vertrauen.

Bildung ist öffentliche Infrastruktur wie Strom oder Wasser. Wenn wir sie zuverlässig machen, gewinnen alle: Lernende, Lehrende und die Gesellschaft. Reformen gelingen nicht über Nacht, aber sie beginnen mit konkreten Schritten – heute.`,
    wordCount: 320,
    highlights: {
      mainPoints: [
        'Lehrkräfte sichern: Quereinstieg mit Qualität, Anreize',
        'Digitalbasis und OER: personalisiertes Lernen',
        'Frühkindliche Förderung und Ressourcensteuerung'
      ],
      keyPhrases: [
        'machbar, messbar, menschenzentriert',
        'diagnostische Kurzchecks',
        'offene, geprüfte Lernmaterialien (OER)'
      ]
    }
  }
]

/**
 * Get model answer for a specific topic
 */
export function getModelAnswer(topicId: string, difficulty: Difficulty): ModelAnswer | undefined {
  if (difficulty === 'A2') {
    return modelAnswersA2.find(answer => answer.topicId === topicId)
  }
  return modelAnswersC1.find(answer => answer.topicId === topicId)
}
