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
    requirements: ['Lesen Sie die Situation.', 'Ergänzen Sie die fünf fehlenden Angaben im Formular.'],
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
