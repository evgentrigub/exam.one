import type { ReadingA2Exercise } from '~/utils/exercises/reading'

/**
 * Default A2-level German reading exercises (Goethe-Institut, modular 2024 format).
 * One exercise per Teil (1-4), each distinguished by `testingPart` and text type.
 */
export const defaultReadingTopics: ReadingA2Exercise[] = [
  {
    id: 'reading-a2-teil1-001',
    title: 'Neue Fahrräder in der Stadt',
    textType: 'article',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 205,
    topics: ['Stadt', 'Verkehr', 'Fahrrad', 'Umwelt'],
    createdAt: '2026-06-14',
    content: `Seit dem ersten März gibt es in Freiburg ein neues Angebot für alle Bürger. Die Stadt hat 200 grüne Fahrräder gekauft. Die Fahrräder stehen an 30 Stationen in der ganzen Stadt. Besonders viele Stationen findet man am Bahnhof und in der Nähe der Universität.

Das Mieten ist sehr einfach. Man braucht nur ein Handy und eine App. Die erste halbe Stunde kostet nichts. Danach zahlt man einen Euro pro Stunde. Studenten und Kinder unter 14 Jahren fahren noch günstiger. Sie bezahlen nur 50 Cent pro Stunde.

Viele Menschen sind sehr zufrieden mit den neuen Fahrrädern. „Ich fahre jetzt jeden Morgen mit dem Rad zur Arbeit", sagt Frau Meier. „Das ist gesund und ich spare Geld." Auch Touristen nutzen das Angebot gern, denn so können sie die Stadt schnell sehen.

Die Stadt möchte, dass weniger Autos fahren. Deshalb plant sie für den Sommer noch mehr Stationen. Auch neue Wege nur für Fahrräder sollen bald kommen. Wer Fragen hat, kann jeden Tag das Büro am Marktplatz besuchen. Es ist von neun bis achtzehn Uhr geöffnet.`,
    questions: [
      {
        id: 'reading-a2-teil1-001-q1',
        textId: 'reading-a2-teil1-001',
        question: 'Seit wann gibt es das neue Angebot in Freiburg?',
        options: ['Seit März.', 'Seit dem Sommer.', 'Seit der Universität.'],
        correctAnswer: 0,
        explanation:
          'Im Text steht: „Seit dem ersten März gibt es in Freiburg ein neues Angebot." Der Sommer wird nur für spätere Pläne genannt.',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil1-001-q2',
        textId: 'reading-a2-teil1-001',
        question: 'Wie viel kostet die erste halbe Stunde?',
        options: ['Einen Euro.', 'Nichts.', '50 Cent.'],
        correctAnswer: 1,
        explanation:
          'Der Text sagt: „Die erste halbe Stunde kostet nichts." Einen Euro zahlt man erst danach pro Stunde, 50 Cent zahlen nur Studenten und Kinder.',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil1-001-q3',
        textId: 'reading-a2-teil1-001',
        question: 'Wie viel bezahlen Studenten pro Stunde?',
        options: ['Einen Euro.', 'Nichts.', '50 Cent.'],
        correctAnswer: 2,
        explanation:
          'Im Text steht: „Studenten und Kinder unter 14 Jahren ... bezahlen nur 50 Cent pro Stunde." Einen Euro zahlen die anderen Personen.',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil1-001-q4',
        textId: 'reading-a2-teil1-001',
        question: 'Was möchte die Stadt erreichen?',
        options: ['Dass mehr Touristen kommen.', 'Dass weniger Autos fahren.', 'Dass mehr Büros öffnen.'],
        correctAnswer: 1,
        explanation:
          'Der Text sagt klar: „Die Stadt möchte, dass weniger Autos fahren." Touristen und das Büro werden zwar genannt, sind aber nicht das Ziel.',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil1-001-q5',
        textId: 'reading-a2-teil1-001',
        question: 'Wann ist das Büro am Marktplatz geöffnet?',
        options: ['Jeden Tag von 9 bis 18 Uhr.', 'Nur am Morgen.', 'Von 14 bis 18 Uhr.'],
        correctAnswer: 0,
        explanation:
          'Im Text steht: „Wer Fragen hat, kann jeden Tag das Büro am Marktplatz besuchen. Es ist von neun bis achtzehn Uhr geöffnet."',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'reading-a2-teil2-001',
    title: 'Kaufhaus Stern – Wegweiser',
    textType: 'list',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 2,
    wordCount: 62,
    topics: ['Einkaufen', 'Kaufhaus', 'Orientierung'],
    createdAt: '2026-06-14',
    content: `Kaufhaus Stern – Wegweiser
Erdgeschoss: Parfüm, Schmuck, Information, Kundenservice und Umtausch
1. Stock: Damenmode, Schuhe
2. Stock: Herrenmode, Sportkleidung
3. Stock: Bücher, Spielzeug, Schreibwaren, Geschenke einpacken
4. Stock: Möbel, Küchengeräte, Lampen
5. Stock: Restaurant, Café, Toiletten
Untergeschoss: Parkhaus (die erste Stunde ist frei)
Öffnungszeiten: Montag bis Samstag, 9–20 Uhr
Am Sonntag geschlossen.
Der Aufzug befindet sich neben dem Eingang.`,
    questions: [
      {
        id: 'reading-a2-teil2-001-q1',
        textId: 'reading-a2-teil2-001',
        question: 'Sie möchten ein Buch für Ihre Tochter kaufen. Wohin gehen Sie?',
        options: ['In den 3. Stock.', 'In den 1. Stock.', 'In einen anderen Stock.'],
        correctAnswer: 0,
        explanation: 'Bücher gibt es im 3. Stock. Im 1. Stock sind nur Damenmode und Schuhe.',
        type: 'selective'
      },
      {
        id: 'reading-a2-teil2-001-q2',
        textId: 'reading-a2-teil2-001',
        question: 'Sie möchten einen Kaffee trinken. Wohin gehen Sie?',
        options: ['In den 4. Stock.', 'In den 5. Stock.', 'In einen anderen Stock.'],
        correctAnswer: 1,
        explanation: 'Das Café ist im 5. Stock. Im 4. Stock gibt es nur Möbel, Küchengeräte und Lampen.',
        type: 'selective'
      },
      {
        id: 'reading-a2-teil2-001-q3',
        textId: 'reading-a2-teil2-001',
        question: 'Sie möchten Sportkleidung kaufen. Wohin gehen Sie?',
        options: ['In den 2. Stock.', 'In den 1. Stock.', 'In einen anderen Stock.'],
        correctAnswer: 0,
        explanation: 'Sportkleidung gibt es im 2. Stock. Im 1. Stock sind Damenmode und Schuhe.',
        type: 'selective'
      },
      {
        id: 'reading-a2-teil2-001-q4',
        textId: 'reading-a2-teil2-001',
        question: 'Sie möchten am Sonntag einkaufen. Was tun Sie?',
        options: ['Sie kommen von 9 bis 20 Uhr.', 'Sie kommen erst um 12 Uhr.', 'Sie kommen an einem anderen Tag.'],
        correctAnswer: 2,
        explanation:
          'Am Sonntag ist das Kaufhaus geschlossen. Die Öffnungszeiten 9–20 Uhr gelten nur von Montag bis Samstag.',
        type: 'selective'
      },
      {
        id: 'reading-a2-teil2-001-q5',
        textId: 'reading-a2-teil2-001',
        question: 'Sie möchten Ihr Auto parken. Wohin fahren Sie?',
        options: ['Ins Untergeschoss.', 'In den 5. Stock.', 'An einen anderen Ort.'],
        correctAnswer: 0,
        explanation: 'Das Parkhaus ist im Untergeschoss, und die erste Stunde ist frei.',
        type: 'selective'
      }
    ]
  },

  {
    id: 'reading-a2-teil3-001',
    title: 'Lenas Urlaub am Meer',
    textType: 'email',
    testingPart: 3,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 232,
    topics: ['Urlaub', 'Reise', 'Familie', 'Meer'],
    createdAt: '2026-06-14',
    content: `Liebe Sandra,

wie geht es dir? Ich muss dir unbedingt von meinem Urlaub erzählen. Letzte Woche bin ich mit meiner Familie nach Italien gefahren. Wir waren zehn Tage am Meer.

Die Reise war lang, weil wir mit dem Auto gefahren sind. Am ersten Tag sind wir zwölf Stunden unterwegs gewesen. Mein Bruder hat die ganze Zeit geschlafen, aber ich konnte nicht schlafen, weil es zu heiß war.

Unser Hotel war direkt am Strand. Jeden Morgen sind wir früh aufgestanden und haben im Meer gebadet. Das Wasser war wunderbar warm. Am Nachmittag haben wir oft ein Eis gegessen oder sind in die kleine Stadt gegangen.

Ein Tag war besonders schön. Wir haben einen Ausflug mit dem Boot gemacht. Leider wurde meine Mutter auf dem Boot krank, deshalb sind wir früher zurückgefahren. Am Abend ging es ihr aber wieder gut.

Am letzten Tag habe ich noch ein kleines Geschenk für dich gekauft. Ich glaube, du wirst es lieben! Ich gebe es dir, wenn wir uns nächste Woche treffen.

Schade, dass der Urlaub schon vorbei ist. Aber im nächsten Jahr möchte ich gern wieder dorthin fahren. Vielleicht hast du ja Lust, mitzukommen?

Schreib mir bald und erzähl mir von deinen Plänen!

Liebe Grüße
Lena`,
    questions: [
      {
        id: 'reading-a2-teil3-001-q1',
        textId: 'reading-a2-teil3-001',
        question: 'Wohin ist Lena gefahren?',
        options: ['Ans Meer nach Italien.', 'In die Berge.', 'Nach Spanien.'],
        correctAnswer: 0,
        explanation:
          'Lena schreibt: „Letzte Woche bin ich mit meiner Familie nach Italien gefahren. Wir waren zehn Tage am Meer."',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil3-001-q2',
        textId: 'reading-a2-teil3-001',
        question: 'Wie ist die Familie gereist?',
        options: ['Mit dem Flugzeug.', 'Mit dem Auto.', 'Mit dem Zug.'],
        correctAnswer: 1,
        explanation: 'Im Text steht: „Die Reise war lang, weil wir mit dem Auto gefahren sind."',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil3-001-q3',
        textId: 'reading-a2-teil3-001',
        question: 'Was hat Lenas Bruder während der Fahrt gemacht?',
        options: ['Er hat geschlafen.', 'Er hat gebadet.', 'Er war krank.'],
        correctAnswer: 0,
        explanation:
          'Lena schreibt: „Mein Bruder hat die ganze Zeit geschlafen." Gebadet wurde erst im Urlaub, krank wurde später die Mutter.',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil3-001-q4',
        textId: 'reading-a2-teil3-001',
        question: 'Was ist beim Bootsausflug passiert?',
        options: ['Das Boot hatte einen Unfall.', 'Lenas Mutter wurde krank.', 'Lena hat ein Eis gegessen.'],
        correctAnswer: 1,
        explanation:
          'Im Text steht: „Leider wurde meine Mutter auf dem Boot krank, deshalb sind wir früher zurückgefahren."',
        type: 'comprehension'
      },
      {
        id: 'reading-a2-teil3-001-q5',
        textId: 'reading-a2-teil3-001',
        question: 'Was möchte Lena im nächsten Jahr machen?',
        options: ['Ein Geschenk kaufen.', 'Zu Hause bleiben.', 'Wieder dorthin fahren.'],
        correctAnswer: 2,
        explanation: 'Am Ende schreibt Lena: „Aber im nächsten Jahr möchte ich gern wieder dorthin fahren."',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'reading-a2-teil4-001',
    title: 'Freizeitkurse in der Volkshochschule',
    textType: 'advertisement',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 3,
    wordCount: 150,
    topics: ['Freizeit', 'Kurse', 'Hobby'],
    createdAt: '2026-06-14',
    content: `a: Italienisch kochen! Jeden Dienstagabend um 19 Uhr lernen Sie Pasta und Pizza selbst zu machen. Kleine Gruppen, nur 15 Euro pro Abend. Anmeldung unter 0761/12345.
b: Gitarre für Anfänger – am Samstag und Sonntag. Sie brauchen keine Vorkenntnisse. Eine Gitarre können Sie bei uns leihen. Infos in der Musikschule Ton & Klang.
c: Schwimmkurs für Kinder von 4 bis 7 Jahren. Mittwochnachmittag im Hallenbad. Erfahrene Lehrer und kleine Gruppen. Die erste Stunde ist kostenlos!
d: Sanftes Yoga am Morgen, besonders für Senioren. Jeden Montag und Donnerstag von 9 bis 10 Uhr. Bitte bequeme Kleidung mitbringen.
e: Computer für ältere Menschen. Lernen Sie E-Mails schreiben und im Internet surfen. Der Kurs ist jeden Freitagvormittag, ganz ohne Stress.
f: Malen und Zeichnen für alle. Am Wochenende treffen wir uns im Atelier am Park. Farben und Papier sind vorhanden. Auch für Anfänger geeignet.`,
    questions: [
      {
        id: 'reading-a2-teil4-001-q1',
        textId: 'reading-a2-teil4-001',
        question: 'Herr Klein (70) möchte lernen, wie man am Computer E-Mails schreibt.',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'x'],
        correctAnswer: 4,
        explanation:
          'Anzeige e bietet einen Computerkurs für ältere Menschen, in dem man E-Mails schreiben und im Internet surfen lernt.',
        type: 'matching'
      },
      {
        id: 'reading-a2-teil4-001-q2',
        textId: 'reading-a2-teil4-001',
        question: 'Marta möchte am Wochenende ein Instrument lernen.',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'x'],
        correctAnswer: 1,
        explanation:
          'Anzeige b bietet einen Gitarrenkurs für Anfänger am Samstag und Sonntag, also genau am Wochenende.',
        type: 'matching'
      },
      {
        id: 'reading-a2-teil4-001-q3',
        textId: 'reading-a2-teil4-001',
        question: 'Frau Sommer möchte ihre kleine Tochter zum Schwimmen anmelden.',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'x'],
        correctAnswer: 2,
        explanation: 'Anzeige c bietet einen Schwimmkurs für Kinder von 4 bis 7 Jahren am Mittwochnachmittag.',
        type: 'matching'
      },
      {
        id: 'reading-a2-teil4-001-q4',
        textId: 'reading-a2-teil4-001',
        question: 'Tom sucht einen Tanzkurs für Salsa.',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'x'],
        correctAnswer: 6,
        explanation: 'Es gibt keine Anzeige für einen Tanzkurs. Deshalb passt hier keine Anzeige, die Antwort ist x.',
        type: 'matching'
      },
      {
        id: 'reading-a2-teil4-001-q5',
        textId: 'reading-a2-teil4-001',
        question: 'Sabine möchte abends lernen, italienisch zu kochen.',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'x'],
        correctAnswer: 0,
        explanation: 'Anzeige a bietet einen Kochkurs für italienische Küche jeden Dienstagabend um 19 Uhr.',
        type: 'matching'
      }
    ]
  }
]

/** Dedicated Set 1 content. Kept out of practice lists via `examOnly`. */
export const mockExamReadingTopics: ReadingA2Exercise[] = defaultReadingTopics.map(
  (exercise): ReadingA2Exercise => {
    const id = `mock-a2-set1-reading-teil${exercise.testingPart}`
    return {
      ...exercise,
      id,
      title: `Modellprüfung Set 1 · ${exercise.title}`,
      examOnly: true,
      questions: exercise.questions.map((question, index) => ({
        ...question,
        id: `${id}-q${index + 1}`,
        textId: id,
      })),
    } as ReadingA2Exercise
  },
)

export const allDefaultReadingTopics: ReadingA2Exercise[] = [
  ...defaultReadingTopics,
  ...mockExamReadingTopics,
]
