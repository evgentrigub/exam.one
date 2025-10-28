import type { GermanText } from '~/utils/types'

/**
 * Sample A2-level German texts for reading comprehension practice
 * Each text is designed to match Goethe Institut A2 certification standards
 */
export const germanTexts: GermanText[] = [
  {
    id: 'email-001',
    title: 'E-Mail von Lisa',
    textType: 'email',
    difficulty: 'A2',
    estimatedReadingTime: 3,
    wordCount: 142,
    topics: ['Familie', 'Urlaub', 'Freunde'],
    createdAt: '2024-01-15',
    content: `Liebe Maria,

wie geht es dir? Mir geht es sehr gut! Ich schreibe dir aus dem Urlaub. Wir sind seit drei Tagen in München und es gefällt uns sehr gut hier.

Gestern waren wir im berühmten Englischen Garten spazieren. Das Wetter war wunderbar - sonnig und warm. Wir haben ein Picknick gemacht und viele Fotos gemacht. Mein Bruder Tom hat auch viele Leute kennengelernt. Er spricht jetzt den ganzen Tag nur Deutsch!

Heute wollen wir das Deutsche Museum besuchen. Morgen fahren wir nach Salzburg in Österreich. Ich freue mich schon sehr darauf.

Was machst du denn in den Ferien? Schreibst du mir bald zurück?

Viele liebe Grüße aus München
Lisa

P.S.: Ich bringe dir ein kleines Geschenk mit!`,
    questions: [
      {
        id: 'email-001-q1',
        textId: 'email-001',
        question: 'Wo ist Lisa im Urlaub?',
        options: ['In Berlin', 'In München', 'In Hamburg', 'In Salzburg'],
        correctAnswer: 1,
        explanation: 'Lisa schreibt "Ich schreibe dir aus dem Urlaub. Wir sind seit drei Tagen in München".',
        type: 'comprehension'
      },
      {
        id: 'email-001-q2',
        textId: 'email-001',
        question: 'Wie war das Wetter gestern?',
        options: ['Regnerisch und kalt', 'Sonnig und warm', 'Windig und kühl', 'Nebelig und feucht'],
        correctAnswer: 1,
        explanation: 'Lisa schreibt: "Das Wetter war wunderbar - sonnig und warm."',
        type: 'comprehension'
      },
      {
        id: 'email-001-q3',
        textId: 'email-001',
        question: 'Was wollen sie heute machen?',
        options: ['Ein Picknick machen', 'Nach Salzburg fahren', 'Das Deutsche Museum besuchen', 'Im Englischen Garten spazieren'],
        correctAnswer: 2,
        explanation: 'Lisa schreibt: "Heute wollen wir das Deutsche Museum besuchen."',
        type: 'comprehension'
      },
      {
        id: 'email-001-q4',
        textId: 'email-001',
        question: 'Was macht Tom jetzt den ganzen Tag?',
        options: ['Er macht Fotos', 'Er spricht nur Deutsch', 'Er schreibt E-Mails', 'Er lernt neue Leute kennen'],
        correctAnswer: 1,
        explanation: 'Lisa schreibt über ihren Bruder Tom: "Er spricht jetzt den ganzen Tag nur Deutsch!"',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'notice-001',
    title: 'Schwimmbad-Information',
    textType: 'notice',
    difficulty: 'A2',
    estimatedReadingTime: 2,
    wordCount: 98,
    topics: ['Öffentliche Einrichtungen', 'Öffnungszeiten', 'Regeln'],
    createdAt: '2024-01-16',
    content: `STADTBAD MITTE - WICHTIGE INFORMATION

Liebe Besucher,

ab dem 1. Februar ändern sich unsere Öffnungszeiten:

Montag bis Freitag: 6:00 - 22:00 Uhr
Samstag und Sonntag: 8:00 - 20:00 Uhr

PREISE:
Erwachsene: 4,50 Euro
Kinder (bis 14 Jahre): 2,00 Euro
Familienkarte: 12,00 Euro

WICHTIGE REGELN:
- Duschen vor dem Schwimmen ist Pflicht
- Kinder unter 8 Jahren nur mit Erwachsenen
- Schwimmkurse: Anmeldung an der Kasse

Bei Fragen rufen Sie uns an: 030-12345678

Ihr Team vom Stadtbad Mitte`,
    questions: [
      {
        id: 'notice-001-q1',
        textId: 'notice-001',
        question: 'Wann ändert sich die Öffnungszeit?',
        options: ['Ab dem 1. Januar', 'Ab dem 1. Februar', 'Ab dem 1. März', 'Ab dem 1. April'],
        correctAnswer: 1,
        explanation: 'Im Text steht: "ab dem 1. Februar ändern sich unsere Öffnungszeiten".',
        type: 'comprehension'
      },
      {
        id: 'notice-001-q2',
        textId: 'notice-001',
        question: 'Wie viel kostet der Eintritt für Erwachsene?',
        options: ['2,00 Euro', '4,50 Euro', '12,00 Euro', '6,00 Euro'],
        correctAnswer: 1,
        explanation: 'Bei den Preisen steht: "Erwachsene: 4,50 Euro".',
        type: 'comprehension'
      },
      {
        id: 'notice-001-q3',
        textId: 'notice-001',
        question: 'Was ist vor dem Schwimmen Pflicht?',
        options: ['Anmelden an der Kasse', 'Duschen', 'Bezahlen', 'Schwimmkurs machen'],
        correctAnswer: 1,
        explanation: 'In den wichtigen Regeln steht: "Duschen vor dem Schwimmen ist Pflicht".',
        type: 'comprehension'
      },
      {
        id: 'notice-001-q4',
        textId: 'notice-001',
        question: 'Wie lange ist das Schwimmbad am Sonntag geöffnet?',
        options: ['Von 6:00 bis 22:00 Uhr', 'Von 8:00 bis 20:00 Uhr', 'Von 8:00 bis 22:00 Uhr', 'Von 6:00 bis 20:00 Uhr'],
        correctAnswer: 1,
        explanation: 'Für Wochenende steht: "Samstag und Sonntag: 8:00 - 20:00 Uhr".',
        type: 'comprehension'
      }
    ]
  }
] 