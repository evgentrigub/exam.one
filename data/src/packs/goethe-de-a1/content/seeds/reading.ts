import type { ReadingA1Exercise, ReadingA1Question, TrueFalse } from '../types'

const TRUE_FALSE: TrueFalse = ['Richtig', 'Falsch']

type Row = Omit<ReadingA1Question, 'id' | 'textId' | 'type'>

/** Stamp the ids and question type the reading screen and scoring expect. */
function questions(textId: string, type: ReadingA1Question['type'], rows: Row[]): ReadingA1Question[] {
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
        explanation: 'Am Donnerstag hat Stefan wieder Zeit und fragt: „Spielen wir dann um 18 Uhr?“',
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
        explanation: 'Beim Radverleih können Sie am Wochenende ein Fahrrad mieten; die andere Seite hat nur Nachrichten.',
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
        explanation: 'Die Sprachschule hat Deutschkurse am Abend; die Reisen sind nach Spanien und Italien.',
      },
      {
        question: 'Sie wollen am Sonntag in einem Restaurant frühstücken.',
        options: [
          'www.cafe-sonne.de – Café Sonne: Kuchen und Eis, Dienstag bis Samstag 14–19 Uhr.',
          'www.gasthaus-linde.de – Gasthaus Linde: sonntags großes Frühstück von 9 bis 12 Uhr.',
        ],
        correctAnswer: 1,
        explanation: 'Das Gasthaus Linde hat sonntags Frühstück; das Café ist am Sonntag geschlossen.',
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
