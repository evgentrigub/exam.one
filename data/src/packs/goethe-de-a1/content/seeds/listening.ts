import type { ListeningA1Exercise, ListeningA1Item, TrueFalse } from '../types'
import { withSeedAudio } from '../listening-audio'

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
        explanation:
          'Der Mann sagt „Zimmer 314“ und korrigiert: nicht 341, sondern drei, eins, vier.',
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
        explanation:
          'Heute schließt das Kaufhaus schon um 16 Uhr; bis 20 Uhr ist es erst morgen offen.',
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

/**
 * Dedicated mock-exam Set 1 recordings, one exercise per Teil. Original, not official.
 *
 * Unlike the practice seeds they carry an `audio` map pointing at bundled seed WAVs, which
 * `pnpm generate:listening-audio` writes, so Set 1 plays without a TTS service.
 */
const mockListeningA1Payloads: ListeningA1Exercise[] = [
  {
    id: 'mock-a1-set1-listening-teil1',
    title: 'Modellprüfung Set 1 · Teil 1: Kurze Gespräche',
    testingPart: 1,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    examOnly: true,
    items: items('mock-a1-set1-listening-teil1', [
      {
        context: 'In der Bäckerei.',
        transcript:
          'Frau: Guten Morgen, ich möchte vier Brötchen, bitte. Verkäufer: Gern. Sonst noch etwas? Frau: Ja, ein Brot. Verkäufer: Das macht zusammen 4,60 Euro. Frau: 6,40? Verkäufer: Nein, vier Euro sechzig.',
        question: 'Wie viel bezahlt die Frau?',
        options: ['6,40 Euro.', '4,60 Euro.', '4,16 Euro.'],
        correctAnswer: 1,
        explanation: 'Der Verkäufer korrigiert: nicht 6,40, sondern vier Euro sechzig.',
      },
      {
        context: 'Auf der Straße.',
        transcript:
          'Mann: Entschuldigung, wo ist hier die Post? Frau: Die Post? Gehen Sie hier geradeaus und dann die zweite Straße links. Mann: Die zweite links, danke. Frau: Die Post ist neben der Bank.',
        question: 'Wo ist die Post?',
        options: ['Neben der Bank.', 'Neben dem Bahnhof.', 'Neben dem Supermarkt.'],
        correctAnswer: 0,
        explanation: 'Die Frau sagt: „Die Post ist neben der Bank.“',
      },
      {
        context: 'Am Telefon mit einem Freund.',
        transcript:
          'Frau: Hallo Ben, gehen wir heute ins Kino? Mann: Heute kann ich nicht, ich muss arbeiten. Frau: Und morgen? Mann: Morgen ist Freitag, da habe ich Zeit. Frau: Gut, dann morgen.',
        question: 'Wann gehen sie ins Kino?',
        options: ['Heute.', 'Am Donnerstag.', 'Am Freitag.'],
        correctAnswer: 2,
        explanation: 'Heute muss Ben arbeiten; morgen ist Freitag, dann gehen sie ins Kino.',
      },
      {
        context: 'Im Kaufhaus.',
        transcript:
          'Mann: Entschuldigung, wo finde ich Hemden? Verkäuferin: Hemden für Herren sind im zweiten Stock. Mann: Im zweiten? Nicht im ersten? Verkäuferin: Nein, im ersten Stock sind Schuhe.',
        question: 'Wo sind die Hemden?',
        options: ['Im Erdgeschoss.', 'Im ersten Stock.', 'Im zweiten Stock.'],
        correctAnswer: 2,
        explanation: 'Hemden für Herren sind im zweiten Stock; im ersten Stock sind Schuhe.',
      },
      {
        context: 'Im Restaurant.',
        transcript:
          'Kellner: Was möchten Sie trinken? Frau: Einen Kaffee, bitte. Kellner: Mit Milch? Frau: Nein, danke. Ach, haben Sie auch Tee? Kellner: Ja, natürlich. Frau: Dann nehme ich lieber einen Tee.',
        question: 'Was trinkt die Frau?',
        options: ['Kaffee.', 'Tee.', 'Kaffee mit Milch.'],
        correctAnswer: 1,
        explanation: 'Die Frau bestellt zuerst Kaffee, aber dann nimmt sie lieber einen Tee.',
      },
      {
        context: 'In der Schule.',
        transcript:
          'Frau: Herr Kaya, wann beginnt morgen der Elternabend? Mann: Um halb acht. Frau: Um halb sieben? Mann: Nein, um halb acht, also um 19.30 Uhr.',
        question: 'Wann beginnt der Elternabend?',
        options: ['Um 18.30 Uhr.', 'Um 19.30 Uhr.', 'Um 20.30 Uhr.'],
        correctAnswer: 1,
        explanation: 'Der Elternabend beginnt um halb acht, also um 19.30 Uhr.',
      },
    ]),
  },
  {
    id: 'mock-a1-set1-listening-teil2',
    title: 'Modellprüfung Set 1 · Teil 2: Durchsagen',
    testingPart: 2,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    examOnly: true,
    items: items('mock-a1-set1-listening-teil2', [
      {
        context: 'Am Bahnhof.',
        transcript:
          'Achtung, eine Information: Der Intercity nach Köln fährt heute nicht von Gleis 7, sondern von Gleis 9 ab. Abfahrt 14.12 Uhr.',
        question: 'Der Zug nach Köln fährt von Gleis 9.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Der Intercity fährt heute nicht von Gleis 7, sondern von Gleis 9.',
      },
      {
        context: 'Im Supermarkt.',
        transcript:
          'Liebe Kundinnen und Kunden, heute im Angebot: Orangen, ein Kilo für nur 1,50 Euro. Sie finden die Orangen gleich am Eingang.',
        question: 'Die Orangen sind heute teurer.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Die Orangen sind im Angebot, ein Kilo kostet nur 1,50 Euro.',
      },
      {
        context: 'Am Flughafen.',
        transcript:
          'Information zum Flug LH 204 nach Wien: Der Flug hat 45 Minuten Verspätung. Neue Abflugzeit ist 11.30 Uhr. Bitte warten Sie am Ausgang C 3.',
        question: 'Der Flug nach Wien fliegt pünktlich.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Der Flug nach Wien hat 45 Minuten Verspätung.',
      },
      {
        context: 'Im Schwimmbad.',
        transcript:
          'Liebe Gäste, unser Schwimmbad schließt in 15 Minuten. Bitte kommen Sie jetzt aus dem Wasser. Morgen sind wir ab 8 Uhr wieder für Sie da.',
        question: 'Die Gäste sollen jetzt aus dem Wasser kommen.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Das Schwimmbad schließt bald; die Gäste sollen jetzt aus dem Wasser kommen.',
      },
    ]),
  },
  {
    id: 'mock-a1-set1-listening-teil3',
    title: 'Modellprüfung Set 1 · Teil 3: Nachrichten am Telefon',
    testingPart: 3,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    examOnly: true,
    items: items('mock-a1-set1-listening-teil3', [
      {
        context: 'Die Arztpraxis ruft an.',
        transcript:
          'Guten Tag, Frau Novak, hier ist die Praxis Doktor Schulz. Ihr Termin am Dienstag geht leider nicht. Können Sie am Mittwoch um 9 Uhr kommen? Bitte rufen Sie uns zurück. Danke.',
        question: 'Wann ist der neue Termin?',
        options: ['Am Dienstag.', 'Am Mittwoch.', 'Am Donnerstag.'],
        correctAnswer: 1,
        explanation: 'Der Termin am Dienstag geht nicht; die Praxis fragt nach Mittwoch um 9 Uhr.',
      },
      {
        context: 'Ein Freund ruft an.',
        transcript:
          'Hallo Anna, hier ist David. Wir treffen uns heute nicht am Bahnhof, sondern vor dem Café Rosa. Das ist am Marktplatz. Bis um sieben!',
        question: 'Wo treffen sich Anna und David?',
        options: ['Am Bahnhof.', 'Im Kino.', 'Vor dem Café.'],
        correctAnswer: 2,
        explanation: 'Sie treffen sich nicht am Bahnhof, sondern vor dem Café Rosa.',
      },
      {
        context: 'Das Möbelhaus ruft an.',
        transcript:
          'Guten Tag, hier ist das Möbelhaus Krone. Ihr neuer Tisch ist da. Wir bringen ihn am Samstag zwischen 10 und 12 Uhr zu Ihnen nach Hause. Auf Wiederhören.',
        question: 'Was bringt das Möbelhaus am Samstag?',
        options: ['Einen Tisch.', 'Ein Bett.', 'Einen Schrank.'],
        correctAnswer: 0,
        explanation: 'Das Möbelhaus sagt: „Ihr neuer Tisch ist da.“',
      },
      {
        context: 'Die Mutter ruft an.',
        transcript:
          'Hallo Paula, hier ist Mama. Kannst du heute nach der Schule einkaufen? Wir brauchen Milch und Eier. Brot habe ich schon. Das Geld liegt in der Küche. Tschüs!',
        question: 'Was soll Paula kaufen?',
        options: ['Brot und Milch.', 'Milch und Eier.', 'Eier und Brot.'],
        correctAnswer: 1,
        explanation: 'Paula soll Milch und Eier kaufen; Brot hat die Mutter schon.',
      },
      {
        context: 'Das Hotel ruft an.',
        transcript:
          'Guten Abend, Herr Lopez, hier ist das Hotel Seeblick. Sie haben ein Zimmer für drei Nächte reserviert. Das Zimmer kostet 85 Euro pro Nacht, mit Frühstück. Bis bald!',
        question: 'Was kostet das Zimmer pro Nacht?',
        options: ['58 Euro.', '85 Euro.', '80 Euro.'],
        correctAnswer: 1,
        explanation: 'Das Hotel sagt: 85 Euro pro Nacht, mit Frühstück.',
      },
    ]),
  },
]

export const mockListeningA1Seeds: ListeningA1Exercise[] =
  mockListeningA1Payloads.map(withSeedAudio)
