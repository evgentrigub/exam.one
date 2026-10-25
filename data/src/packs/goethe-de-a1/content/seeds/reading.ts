import type { ReadingA1Exercise, ReadingA1Question, TrueFalse } from '../types'

const TRUE_FALSE: TrueFalse = ['Richtig', 'Falsch']

type Row = Omit<ReadingA1Question, 'id' | 'textId' | 'type'>

/** Stamp the ids and question type the reading screen and scoring expect. */
function questions(
  textId: string,
  type: ReadingA1Question['type'],
  rows: Row[]
): ReadingA1Question[] {
  return rows.map((row, index) => ({ ...row, id: `${textId}-q${index + 1}`, textId, type }))
}

/**
 * Original Lesen A1 seeds, one per Teil, in the Start Deutsch 1 format. Not official tasks.
 * True/false answers use index 0 for "richtig" and 1 for "falsch".
 */
export const readingA1Seeds: ReadingA1Exercise[] = [
  {
    id: 'reading-a1-teil1-001',
    title: 'Zwei Nachrichten',
    content: [
      'Liebe Maria,',
      'danke für deine Nachricht. Ich komme am Samstag mit dem Bus um 14.20 Uhr in Salzburg an. Kannst du mich an der Haltestelle am Markt abholen? Ich bringe einen Kuchen für deine Mutter mit.',
      'Bis Samstag!',
      'Deine Jana',
      '',
      'Hallo Paul,',
      'morgen kann ich leider nicht zum Fußball kommen. Mein Sohn ist krank und ich bleibe zu Hause. Am Donnerstag habe ich wieder Zeit. Spielen wir dann um 18 Uhr? Mein neuer Ball ist auch da!',
      'Viele Grüße',
      'Stefan',
    ].join('\n'),
    textType: 'email',
    testingPart: 1,
    difficulty: 'A1',
    estimatedReadingTime: 3,
    wordCount: 80,
    topics: ['Freunde', 'Freizeit', 'Reisen'],
    createdAt: '2026-09-27',
    questions: questions('reading-a1-teil1-001', 'comprehension', [
      {
        question: 'Jana kommt am Samstagnachmittag in Salzburg an.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Jana kommt am Samstag um 14.20 Uhr an, also am Nachmittag.',
      },
      {
        question: 'Maria soll Jana am Bahnhof abholen.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Jana kommt mit dem Bus und wartet an der Haltestelle am Markt.',
      },
      {
        question: 'Stefan spielt morgen Fußball.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Stefan kann morgen leider nicht zum Fußball kommen.',
      },
      {
        question: 'Stefans Sohn ist krank.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Stefan schreibt: „Mein Sohn ist krank und ich bleibe zu Hause.“',
      },
      {
        question: 'Stefan möchte am Donnerstag spielen.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation:
          'Am Donnerstag hat Stefan wieder Zeit und fragt: „Spielen wir dann um 18 Uhr?“',
      },
    ]),
  },
  {
    id: 'reading-a1-teil2-001',
    title: 'Wo finden Sie Informationen?',
    content: 'Lesen Sie die Situationen 1 bis 5. Wo finden Sie Informationen? Wählen Sie a oder b.',
    textType: 'advertisement',
    testingPart: 2,
    difficulty: 'A1',
    estimatedReadingTime: 4,
    wordCount: 140,
    topics: ['Freizeit', 'Gesundheit', 'Wohnen'],
    createdAt: '2026-09-27',
    questions: questions('reading-a1-teil2-001', 'selective', [
      {
        question: 'Sie möchten am Wochenende eine Radtour machen und brauchen ein Fahrrad.',
        options: [
          'www.radverleih-weser.de – Fahrräder mieten: 12 Euro pro Tag, auch am Samstag und Sonntag geöffnet.',
          'www.radsport-news.de – Nachrichten und Fotos vom Radrennen in Bremen am Sonntag.',
        ],
        correctAnswer: 0,
        explanation:
          'Beim Radverleih können Sie am Wochenende ein Fahrrad mieten; die andere Seite hat nur Nachrichten.',
      },
      {
        question: 'Ihr Kind hat Fieber. Sie suchen einen Arzt.',
        options: [
          'www.apotheke-am-park.de – Tabletten, Tee und Kosmetik. Montag bis Freitag 8–18 Uhr.',
          'www.kinderarzt-berger.de – Kinderarztpraxis Dr. Berger: Sprechstunde täglich 8–12 Uhr, Termine auch online.',
        ],
        correctAnswer: 1,
        explanation: 'Dr. Berger ist ein Kinderarzt; die Apotheke ist keine Arztpraxis.',
      },
      {
        question: 'Sie möchten Deutsch lernen, aber Sie haben nur am Abend Zeit.',
        options: [
          'www.sprachschule-lingua.de – Deutschkurse für Anfänger: Montag und Mittwoch 19–21 Uhr.',
          'www.lingua-reisen.de – Sprachreisen nach Spanien und Italien für die ganze Familie.',
        ],
        correctAnswer: 0,
        explanation:
          'Die Sprachschule hat Deutschkurse am Abend; die Reisen sind nach Spanien und Italien.',
      },
      {
        question: 'Sie wollen am Sonntag in einem Restaurant frühstücken.',
        options: [
          'www.cafe-sonne.de – Café Sonne: Kuchen und Eis, Dienstag bis Samstag 14–19 Uhr.',
          'www.gasthaus-linde.de – Gasthaus Linde: sonntags großes Frühstück von 9 bis 12 Uhr.',
        ],
        correctAnswer: 1,
        explanation:
          'Das Gasthaus Linde hat sonntags Frühstück; das Café ist am Sonntag geschlossen.',
      },
      {
        question: 'Sie suchen eine Wohnung mit zwei Zimmern.',
        options: [
          'www.moebel-haus.de – Tische, Stühle und Betten für Ihre neue Wohnung. Heute 20 Prozent billiger.',
          'www.wohnen-leipzig.de – Wohnungen in Leipzig: 1 bis 4 Zimmer, mit Balkon, ab sofort frei.',
        ],
        correctAnswer: 1,
        explanation: 'Bei „Wohnen Leipzig“ gibt es Wohnungen; das Möbelhaus verkauft nur Möbel.',
      },
    ]),
  },
  {
    id: 'reading-a1-teil3-001',
    title: 'Schilder in der Stadt',
    content: [
      '1 · An der Tür der Arztpraxis',
      '„Mittwochnachmittag geschlossen. In dringenden Fällen rufen Sie bitte 0172 55 81 20 an.“',
      '',
      '2 · Im Supermarkt',
      '„Pfandflaschen bitte am Automaten neben dem Eingang zurückgeben.“',
      '',
      '3 · Am Schwimmbad',
      '„Kinder unter 6 Jahren nur mit Erwachsenen. Eintritt für Kinder: 2 Euro.“',
      '',
      '4 · An der Tür der Bibliothek',
      '„Wir sind umgezogen! Sie finden uns jetzt im Rathaus, 1. Stock.“',
      '',
      '5 · Im Zug',
      '„Wagen 5: Ruhebereich. Bitte nicht telefonieren.“',
    ].join('\n'),
    textType: 'notice',
    testingPart: 3,
    difficulty: 'A1',
    estimatedReadingTime: 3,
    wordCount: 76,
    topics: ['Alltag', 'Stadt'],
    createdAt: '2026-09-27',
    questions: questions('reading-a1-teil3-001', 'comprehension', [
      {
        question: 'Schild 1: Die Praxis ist am Mittwochnachmittag offen.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Auf dem Schild steht: „Mittwochnachmittag geschlossen.“',
      },
      {
        question: 'Schild 2: Die Flaschen bringen Sie zum Automaten beim Eingang.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Der Automat für die Pfandflaschen ist neben dem Eingang.',
      },
      {
        question: 'Schild 3: Kleine Kinder dürfen allein ins Schwimmbad.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Kinder unter 6 Jahren dürfen nur mit Erwachsenen ins Schwimmbad.',
      },
      {
        question: 'Schild 4: Die Bibliothek ist jetzt im Rathaus.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Die Bibliothek ist umgezogen und ist jetzt im Rathaus im 1. Stock.',
      },
      {
        question: 'Schild 5: In Wagen 5 dürfen Sie telefonieren.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Wagen 5 ist ein Ruhebereich: „Bitte nicht telefonieren.“',
      },
    ]),
  },
]

/**
 * Dedicated mock-exam Set 1 texts, one per Teil. Original, not official; kept out of the
 * practice lists by `examOnly`.
 */
export const mockReadingA1Seeds: ReadingA1Exercise[] = [
  {
    id: 'mock-a1-set1-reading-teil1',
    title: 'Modellprüfung Set 1 · Zwei Nachrichten',
    content: [
      'Liebe Sophie,',
      'am Freitag habe ich Geburtstag. Ich mache eine kleine Party bei mir zu Hause. Sie beginnt um 19 Uhr. Meine Adresse ist Lindenstraße 8, dritter Stock. Du musst nichts mitbringen, ich koche Pizza für alle. Kommst du?',
      'Viele Grüße',
      'Marta',
      '',
      'Hallo Herr Wagner,',
      'leider kann ich morgen nicht zur Arbeit kommen. Ich bin krank und gehe am Vormittag zum Arzt. Frau Klein macht meine Termine am Nachmittag. Am Donnerstag bin ich wieder im Büro.',
      'Mit freundlichen Grüßen',
      'Jonas Richter',
    ].join('\n'),
    textType: 'email',
    testingPart: 1,
    difficulty: 'A1',
    estimatedReadingTime: 3,
    wordCount: 88,
    topics: ['Freunde', 'Arbeit'],
    createdAt: '2026-09-27',
    examOnly: true,
    questions: questions('mock-a1-set1-reading-teil1', 'comprehension', [
      {
        question: 'Die Party von Marta beginnt am Abend.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Die Party beginnt um 19 Uhr, also am Abend.',
      },
      {
        question: 'Sophie soll etwas zu essen mitbringen.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Marta schreibt: „Du musst nichts mitbringen, ich koche Pizza für alle.“',
      },
      {
        question: 'Marta wohnt im dritten Stock.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Die Adresse ist Lindenstraße 8, dritter Stock.',
      },
      {
        question: 'Jonas geht morgen am Nachmittag zum Arzt.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation:
          'Jonas geht am Vormittag zum Arzt; am Nachmittag macht Frau Klein seine Termine.',
      },
      {
        question: 'Jonas arbeitet am Donnerstag wieder.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Jonas schreibt: „Am Donnerstag bin ich wieder im Büro.“',
      },
    ]),
  },
  {
    id: 'mock-a1-set1-reading-teil2',
    title: 'Modellprüfung Set 1 · Wo finden Sie Informationen?',
    content: 'Lesen Sie die Situationen 1 bis 5. Wo finden Sie Informationen? Wählen Sie a oder b.',
    textType: 'advertisement',
    testingPart: 2,
    difficulty: 'A1',
    estimatedReadingTime: 4,
    wordCount: 150,
    topics: ['Einkaufen', 'Reisen', 'Freizeit'],
    createdAt: '2026-09-27',
    examOnly: true,
    questions: questions('mock-a1-set1-reading-teil2', 'selective', [
      {
        question: 'Sie möchten am Samstag mit dem Zug nach München fahren.',
        options: [
          'www.bahn-reise.de – Fahrkarten online kaufen: alle Züge in Deutschland, auch am Wochenende.',
          'www.muenchen-hotels.de – Hotels und Zimmer in München: ab 59 Euro pro Nacht.',
        ],
        correctAnswer: 0,
        explanation:
          'Auf der Bahn-Seite finden Sie Züge und Fahrkarten; die andere Seite hat nur Hotels.',
      },
      {
        question: 'Sie brauchen neue Schuhe für Ihren Sohn.',
        options: [
          'www.kinder-mode.de – Hosen, Jacken und Schuhe für Kinder von 2 bis 12 Jahren.',
          'www.schuh-reparatur.de – Wir reparieren Ihre Schuhe schnell und billig.',
        ],
        correctAnswer: 0,
        explanation:
          'Kinder-Mode verkauft Schuhe für Kinder; die andere Seite repariert nur Schuhe.',
      },
      {
        question: 'Sie möchten am Abend schwimmen gehen.',
        options: [
          'www.hallenbad-nord.de – Hallenbad Nord: Montag bis Freitag 6 bis 22 Uhr geöffnet.',
          'www.see-camping.de – Camping am See: Plätze für Zelte, Mai bis September.',
        ],
        correctAnswer: 0,
        explanation:
          'Das Hallenbad ist bis 22 Uhr offen; der Campingplatz ist kein Schwimmbad am Abend.',
      },
      {
        question: 'Ihr Computer ist kaputt. Sie suchen Hilfe.',
        options: [
          'www.computer-kurs.de – Computerkurse für Anfänger, jeden Dienstag in der Volkshochschule.',
          'www.pc-service-hahn.de – PC-Service Hahn: Wir reparieren Computer und Laptops, auch bei Ihnen zu Hause.',
        ],
        correctAnswer: 1,
        explanation:
          'Der PC-Service repariert Computer; der Kurs hilft nicht bei einem kaputten Computer.',
      },
      {
        question: 'Sie möchten eine Katze haben.',
        options: [
          'www.tierheim-mitte.de – Tierheim Mitte: Katzen und Hunde suchen ein neues Zuhause.',
          'www.tierarzt-sommer.de – Tierarztpraxis Sommer: Sprechstunde Montag bis Samstag.',
        ],
        correctAnswer: 0,
        explanation:
          'Im Tierheim können Sie eine Katze bekommen; der Tierarzt behandelt nur kranke Tiere.',
      },
    ]),
  },
  {
    id: 'mock-a1-set1-reading-teil3',
    title: 'Modellprüfung Set 1 · Schilder und Informationen',
    content: [
      '1 · An der Tür der Bäckerei',
      '„Montag Ruhetag. Dienstag bis Sonntag 6.30 bis 13 Uhr.“',
      '',
      '2 · Im Hotel',
      '„Frühstück im Restaurant, 1. Stock, von 7 bis 10 Uhr.“',
      '',
      '3 · An der Bushaltestelle',
      '„Linie 12 fährt heute nicht. Bitte nehmen Sie die Linie 14.“',
      '',
      '4 · Im Museum',
      '„Fotografieren verboten. Taschen bitte an der Garderobe abgeben.“',
      '',
      '5 · Im Supermarkt',
      '„Heute: Äpfel aus der Region, 1 Kilo nur 1,99 Euro.“',
    ].join('\n'),
    textType: 'notice',
    testingPart: 3,
    difficulty: 'A1',
    estimatedReadingTime: 3,
    wordCount: 70,
    topics: ['Alltag', 'Stadt'],
    createdAt: '2026-09-27',
    examOnly: true,
    questions: questions('mock-a1-set1-reading-teil3', 'comprehension', [
      {
        question: 'Schild 1: Am Montag können Sie in der Bäckerei Brot kaufen.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Montag ist Ruhetag, die Bäckerei ist geschlossen.',
      },
      {
        question: 'Schild 2: Das Frühstück ist im ersten Stock.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Frühstück gibt es im Restaurant im 1. Stock.',
      },
      {
        question: 'Schild 3: Heute fahren Sie mit der Linie 14.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Die Linie 12 fährt heute nicht; Sie sollen die Linie 14 nehmen.',
      },
      {
        question: 'Schild 4: Im Museum dürfen Sie Fotos machen.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Auf dem Schild steht: „Fotografieren verboten.“',
      },
      {
        question: 'Schild 5: Ein Kilo Äpfel kostet heute weniger als 2 Euro.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Ein Kilo Äpfel kostet heute 1,99 Euro.',
      },
    ]),
  },
]
