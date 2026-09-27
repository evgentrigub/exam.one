import type { ListeningA1Exercise, ListeningA1Item, TrueFalse } from '../types'

const TRUE_FALSE: TrueFalse = ['Richtig', 'Falsch']

/** Stamp the per-item ids the per-item audio map is keyed by. */
function items(exerciseId: string, rows: Omit<ListeningA1Item, 'id'>[]): ListeningA1Item[] {
  return rows.map((row, index) => ({ ...row, id: `${exerciseId}-i${index + 1}` }))
}

/**
 * Original Hören A1 seeds, one per Teil, in the Start Deutsch 1 format. Not official tasks.
 *
 * They ship without an `audio` map: the player finds no file, shows the missing-audio notice,
 * and **Generate audio** synthesises each item with the local German TTS. Dialogue turns carry
 * `Name:` labels so the two speakers get different voices.
 */
export const listeningA1Seeds: ListeningA1Exercise[] = [
  {
    id: 'listening-a1-teil1-001',
    title: 'Teil 1: Kurze Gespräche',
    testingPart: 1,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    items: items('listening-a1-teil1-001', [
      {
        context: 'Im Hotel.',
        transcript:
          'Frau: Guten Abend, ich habe ein Zimmer reserviert. Mein Name ist Kowalski. Mann: Moment, bitte. Ja, Frau Kowalski, Sie haben Zimmer 314. Frau: 341? Mann: Nein, drei, eins, vier. Im dritten Stock.',
        question: 'Welche Zimmernummer hat Frau Kowalski?',
        options: ['Zimmer 341.', 'Zimmer 314.', 'Zimmer 143.'],
        correctAnswer: 1,
        explanation: 'Der Mann sagt „Zimmer 314“ und korrigiert: nicht 341, sondern drei, eins, vier.',
      },
      {
        context: 'Am Bahnhof.',
        transcript:
          'Mann: Entschuldigung, wann fährt der Zug nach Dresden? Frau: Um 9.15 Uhr. Mann: Nicht um 9.50 Uhr? Frau: Nein, der Zug um 9.50 Uhr fährt nach Berlin. Nach Dresden fahren Sie um 9.15 Uhr.',
        question: 'Wann fährt der Zug nach Dresden?',
        options: ['Um 9.15 Uhr.', 'Um 9.50 Uhr.', 'Um 5.19 Uhr.'],
        correctAnswer: 0,
        explanation: 'Der Zug um 9.50 Uhr fährt nach Berlin; nach Dresden geht es um 9.15 Uhr.',
      },
      {
        context: 'Im Supermarkt.',
        transcript:
          'Frau: Entschuldigung, wo finde ich hier Reis? Verkäufer: Reis ist bei den Nudeln, im Regal neben dem Brot. Frau: Und die Milch? Verkäufer: Die Milch ist hinten, neben dem Käse.',
        question: 'Wo ist der Reis?',
        options: ['Neben dem Käse.', 'Bei der Milch.', 'Neben dem Brot.'],
        correctAnswer: 2,
        explanation: 'Der Reis ist im Regal neben dem Brot; neben dem Käse ist die Milch.',
      },
      {
        context: 'Am Telefon in der Arztpraxis.',
        transcript:
          'Frau: Praxis Doktor Weber, guten Tag. Mann: Guten Tag, ich brauche einen Termin. Geht Montag? Frau: Montag ist leider voll. Dienstag um 10 Uhr? Mann: Dienstag kann ich nicht. Frau: Dann Mittwoch um 11 Uhr. Mann: Ja, das passt.',
        question: 'Wann hat der Mann einen Termin?',
        options: ['Am Montag.', 'Am Dienstag.', 'Am Mittwoch.'],
        correctAnswer: 2,
        explanation: 'Montag ist voll, Dienstag kann der Mann nicht; der Termin ist am Mittwoch.',
      },
      {
        context: 'Auf dem Markt.',
        transcript:
          'Mann: Was kosten die Äpfel? Frau: Ein Kilo kostet 2,80 Euro. Mann: Und die Tomaten? Frau: 3,20 Euro das Kilo. Mann: Hm, dann nehme ich nur ein Kilo Äpfel, bitte.',
        question: 'Was kauft der Mann?',
        options: ['Äpfel.', 'Tomaten.', 'Äpfel und Tomaten.'],
        correctAnswer: 0,
        explanation: 'Der Mann fragt nach den Tomaten, aber er nimmt nur ein Kilo Äpfel.',
      },
      {
        context: 'Im Büro.',
        transcript:
          'Frau: Herr Lang, wie ist Ihre neue Telefonnummer? Mann: 0341 27 58 90. Frau: 27 85 90? Mann: Nein, 27 58 90.',
        question: 'Wie ist die Telefonnummer von Herrn Lang?',
        options: ['0341 27 85 90.', '0341 27 58 90.', '0341 72 58 90.'],
        correctAnswer: 1,
        explanation: 'Herr Lang korrigiert die Frau: Die Nummer ist 27 58 90.',
      },
    ]),
  },
  {
    id: 'listening-a1-teil2-001',
    title: 'Teil 2: Durchsagen',
    testingPart: 2,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    items: items('listening-a1-teil2-001', [
      {
        context: 'Am Bahnhof.',
        transcript:
          'Achtung an Gleis 4. Der Regionalexpress nach Hannover hat heute 20 Minuten Verspätung. Die Abfahrt ist jetzt um 16.35 Uhr. Wir bitten um Entschuldigung.',
        question: 'Der Zug nach Hannover fährt pünktlich ab.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Der Zug nach Hannover hat 20 Minuten Verspätung.',
      },
      {
        context: 'Am Flughafen.',
        transcript:
          'Eine Durchsage für Frau Ana Silva, gebucht auf den Flug nach Lissabon. Bitte kommen Sie sofort zum Schalter B 12. Ihr Flug ist bereit zum Einsteigen.',
        question: 'Frau Silva soll zum Schalter kommen.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Frau Silva soll sofort zum Schalter B 12 kommen.',
      },
      {
        context: 'Im Kaufhaus.',
        transcript:
          'Liebe Kundinnen und Kunden, unser Kaufhaus schließt heute schon um 16 Uhr. Morgen sind wir wieder von 9 bis 20 Uhr für Sie da. Vielen Dank für Ihren Besuch.',
        question: 'Das Kaufhaus ist heute bis 20 Uhr geöffnet.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Heute schließt das Kaufhaus schon um 16 Uhr; bis 20 Uhr ist es erst morgen offen.',
      },
      {
        context: 'Im Zug.',
        transcript:
          'Liebe Fahrgäste, in wenigen Minuten erreichen wir Stuttgart Hauptbahnhof. Dieser Zug endet hier. Bitte steigen Sie alle aus und vergessen Sie Ihr Gepäck nicht.',
        question: 'Alle Fahrgäste müssen in Stuttgart aussteigen.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Der Zug endet in Stuttgart, alle Fahrgäste sollen aussteigen.',
      },
    ]),
  },
  {
    id: 'listening-a1-teil3-001',
    title: 'Teil 3: Nachrichten am Telefon',
    testingPart: 3,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    items: items('listening-a1-teil3-001', [
      {
        context: 'Eine Nachricht auf dem Anrufbeantworter.',
        transcript:
          'Hallo Lukas, hier ist Oma. Ich komme am Sonntag nicht um zwölf, sondern schon um elf Uhr zum Mittagessen. Ich bringe einen Kuchen mit. Bis Sonntag, mein Schatz!',
        question: 'Wann kommt die Oma am Sonntag?',
        options: ['Um 11 Uhr.', 'Um 12 Uhr.', 'Um 2 Uhr.'],
        correctAnswer: 0,
        explanation: 'Die Oma kommt nicht um zwölf, sondern schon um elf Uhr.',
      },
      {
        context: 'Die Autowerkstatt ruft an.',
        transcript:
          'Guten Tag, Herr Demir, hier ist die Autowerkstatt Brandt. Ihr Auto ist fertig. Sie können es heute bis 18 Uhr abholen. Die Reparatur kostet 145 Euro. Auf Wiederhören.',
        question: 'Was kostet die Reparatur?',
        options: ['154 Euro.', '145 Euro.', '115 Euro.'],
        correctAnswer: 1,
        explanation: 'Die Werkstatt sagt: Die Reparatur kostet 145 Euro.',
      },
      {
        context: 'Eine Freundin ruft an.',
        transcript:
          'Hi Nina, hier ist Clara. Wir wollen am Freitag grillen. Kannst du einen Salat mitbringen? Brot und Getränke haben wir schon. Ruf mich bitte zurück. Tschüs!',
        question: 'Was soll Nina mitbringen?',
        options: ['Brot.', 'Getränke.', 'Einen Salat.'],
        correctAnswer: 2,
        explanation: 'Brot und Getränke hat Clara schon; Nina soll einen Salat mitbringen.',
      },
      {
        context: 'Die Sprachschule ruft an.',
        transcript:
          'Guten Tag, hier ist die Sprachschule Babel. Ihr Deutschkurs ist ab Montag nicht mehr im Raum 12, sondern im Raum 21, im zweiten Stock. Der Kurs beginnt wie immer um 18 Uhr.',
        question: 'In welchem Raum ist der Kurs ab Montag?',
        options: ['Raum 21.', 'Raum 12.', 'Raum 2.'],
        correctAnswer: 0,
        explanation: 'Der Kurs ist ab Montag nicht mehr in Raum 12, sondern in Raum 21.',
      },
      {
        context: 'Ein Kollege ruft an.',
        transcript:
          'Hallo Frau Becker, hier ist Tom Maier. Mein Zug hat Verspätung. Ich bin nicht um neun, sondern erst um zehn im Büro. Das Meeting machen wir dann um halb elf. Danke!',
        question: 'Wann ist das Meeting?',
        options: ['Um 9 Uhr.', 'Um 10 Uhr.', 'Um 10.30 Uhr.'],
        correctAnswer: 2,
        explanation: 'Tom ist um zehn im Büro; das Meeting ist um halb elf.',
      },
    ]),
  },
]
