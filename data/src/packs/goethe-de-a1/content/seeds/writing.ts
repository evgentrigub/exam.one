import type { WritingExercise } from '../../../goethe-de-a2/content/types/writing'

/**
 * Original Schreiben A1 seeds, one per Teil, in the Start Deutsch 1 format. Not official tasks.
 * They reuse the A2 writing-topic shape the writing screen reads; Teil 1 adds `form` and
 * `expected`, which only the form-fill screen and its reviewer use.
 */
export const writingA1Seeds: WritingExercise[] = [
  {
    id: 'writing-a1-teil1-001',
    title: 'Anmeldung zum Deutschkurs',
    topicType: 'form',
    difficulty: 'A1',
    testingPart: 1,
    estimatedTime: 5,
    wordCount: { min: 5, max: 20 },
    category: ['Kurs', 'Formular'],
    createdAt: '2026-09-27',
    description: 'Ihr Freund meldet sich und seine Frau für einen Deutschkurs an.',
    task: 'Ihr Freund, Karim Haddad, kommt aus Marokko und wohnt seit einer Woche in Graz. Er ist Koch und arbeitet am Vormittag im Restaurant. Er möchte mit seiner Frau Lina einen Deutschkurs an der Volkshochschule machen. Seine Handynummer ist 0664 318 27 50.',
    requirements: [
      'Lesen Sie die Situation.',
      'Ergänzen Sie die fünf fehlenden Angaben im Formular.',
    ],
    form: {
      title: 'Volkshochschule Graz – Anmeldung Deutschkurs A1',
      rows: [
        { label: 'Familienname, Vorname', value: 'Haddad, Karim' },
        { label: 'Herkunftsland', field: 'field1' },
        { label: 'Wohnort', value: 'Graz' },
        { label: 'Beruf', field: 'field2' },
        { label: 'Anzahl der Personen', field: 'field3' },
        { label: 'Kurszeit', field: 'field4', options: ['Vormittag', 'Abend'] },
        { label: 'Telefon (Handy)', field: 'field5' },
        { label: 'Unterschrift', value: 'Karim Haddad' },
      ],
    },
    expected: {
      field1: 'Marokko',
      field2: 'Koch',
      field3: '2',
      field4: 'Abend',
      field5: '0664 318 27 50',
    },
  },
  {
    id: 'writing-a1-teil2-001',
    title: 'E-Mail an die Kochschule',
    topicType: 'email',
    difficulty: 'A1',
    testingPart: 2,
    estimatedTime: 15,
    wordCount: { min: 20, max: 50 },
    category: ['Freizeit', 'Kurs'],
    createdAt: '2026-09-27',
    description: 'Sie schreiben an eine Kochschule und fragen nach einem Kurs.',
    task: 'Sie möchten im Juli mit drei Freunden einen Kochkurs machen. Schreiben Sie an die Kochschule „Topf & Löffel“:\n– Warum schreiben Sie?\n– Fragen Sie: Wann gibt es Kurse?\n– Bitten Sie: Preise für vier Personen.\nSchreiben Sie zu jedem Punkt ein bis zwei Sätze (circa 30 Wörter). Schreiben Sie auch eine Anrede und einen Gruß.',
    requirements: ['Anrede und Gruß', '3 Inhaltspunkte', 'circa 30 Wörter'],
  },
]

/** Dedicated mock-exam Set 1 tasks, one per Teil. Original, not official; `examOnly`. */
export const mockWritingA1Seeds: WritingExercise[] = [
  {
    id: 'mock-a1-set1-writing-teil1',
    title: 'Modellprüfung Set 1 · Anmeldung im Sportverein',
    topicType: 'form',
    difficulty: 'A1',
    testingPart: 1,
    estimatedTime: 5,
    wordCount: { min: 5, max: 20 },
    category: ['Freizeit', 'Formular'],
    createdAt: '2026-09-27',
    examOnly: true,
    description: 'Ihre Freundin meldet ihre Tochter in einem Sportverein an.',
    task: 'Ihre Freundin, Elena Petrova, wohnt in Kiel, Hafenstraße 14. Ihre Tochter Mila ist 9 Jahre alt und möchte schwimmen lernen. Mila hat nur am Nachmittag Zeit, am Vormittag ist sie in der Schule. Frau Petrova bezahlt den Kurs mit Karte. Ihre E-Mail-Adresse ist elena.petrova@web.de.',
    requirements: [
      'Lesen Sie die Situation.',
      'Ergänzen Sie die fünf fehlenden Angaben im Formular.',
    ],
    form: {
      title: 'Sportverein Kiel e. V. – Anmeldung Kinderkurs',
      rows: [
        { label: 'Name der Mutter / des Vaters', value: 'Elena Petrova' },
        { label: 'Straße, Hausnummer', field: 'field1' },
        { label: 'Wohnort', value: 'Kiel' },
        { label: 'Name des Kindes', field: 'field2' },
        { label: 'Alter des Kindes', field: 'field3' },
        { label: 'Kurs', value: 'Schwimmen' },
        { label: 'Kurszeit', field: 'field4', options: ['Vormittag', 'Nachmittag'] },
        { label: 'E-Mail', field: 'field5' },
        { label: 'Zahlung', value: 'Karte' },
      ],
    },
    expected: {
      field1: 'Hafenstraße 14',
      field2: 'Mila Petrova',
      field3: '9',
      field4: 'Nachmittag',
      field5: 'elena.petrova@web.de',
    },
  },
  {
    id: 'mock-a1-set1-writing-teil2',
    title: 'Modellprüfung Set 1 · E-Mail an eine Freundin',
    topicType: 'email',
    difficulty: 'A1',
    testingPart: 2,
    estimatedTime: 15,
    wordCount: { min: 20, max: 50 },
    category: ['Freunde', 'Wohnen'],
    createdAt: '2026-09-27',
    examOnly: true,
    description: 'Sie haben eine neue Wohnung und schreiben Ihrer Freundin Lisa.',
    task: 'Sie haben eine neue Wohnung. Schreiben Sie Ihrer Freundin Lisa eine E-Mail:\n– Wie ist die Wohnung?\n– Laden Sie Lisa ein: Wann?\n– Bitten Sie: Lisa soll Stühle mitbringen.\nSchreiben Sie zu jedem Punkt ein bis zwei Sätze (circa 30 Wörter). Schreiben Sie auch eine Anrede und einen Gruß.',
    requirements: ['Anrede und Gruß', '3 Inhaltspunkte', 'circa 30 Wörter'],
  },
]
