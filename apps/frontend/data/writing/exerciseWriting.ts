import type { WritingExercise } from '~/utils/types'

/**
 * Default A2-level German writing topics (Goethe-Institut, modular A2 format).
 * One topic per Teil: Teil 1 (Kurznachricht / SMS, du-Form) and Teil 2 ((halb-)formelle E-Mail, Sie-Form).
 */
export const defaultWritingTopics: WritingExercise[] = [
  {
    id: 'writing-a2-teil1-001',
    title: 'SMS an eine Freundin wegen einer Verabredung',
    topicType: 'note',
    difficulty: 'A2',
    testingPart: 1,
    estimatedTime: 15,
    wordCount: {
      min: 20,
      max: 30,
    },
    category: ['Freizeit', 'Verabredung'],
    createdAt: '2026-06-14',
    description: 'Kurznachricht (SMS) in der du-Form an Freunde/Bekannte/Verwandte.',
    task: `Sie wollten heute Abend mit Ihrer Freundin Lena ins Schwimmbad gehen. Jetzt sind Sie krank. Schreiben Sie Lena eine SMS.
- Sagen Sie, dass Sie nicht kommen können.
- Erklären Sie, warum.
- Schlagen Sie einen neuen Tag vor.
Schreiben Sie 20–30 Wörter. Schreiben Sie zu allen drei Punkten.`,
    requirements: [
      'Du-Form (informell)',
      '3 Inhaltspunkte (alle bearbeiten)',
      '20–30 Wörter',
      'ohne Vorlagen/Beispiele',
    ],
  },

  {
    id: 'writing-a2-teil2-001',
    title: 'E-Mail an die Nachbarin: Paket abholen',
    topicType: 'email',
    difficulty: 'A2',
    testingPart: 2,
    estimatedTime: 15,
    wordCount: {
      min: 30,
      max: 40,
    },
    category: ['Alltag', 'Nachbarschaft'],
    createdAt: '2026-06-14',
    description: '(Halb-)formelle E-Mail in der Sie-Form an eine passende Person/Institution.',
    task: `Ihre Nachbarin Frau Berger hat ein Paket für Sie angenommen. Schreiben Sie Frau Berger eine E-Mail.
- Bedanken Sie sich für ihre Hilfe.
- Fragen Sie, wann Sie das Paket abholen können.
- Sagen Sie, dass Sie ihr etwas mitbringen.
Verwenden Sie eine passende Anrede und Grußformel. Schreiben Sie 30–40 Wörter. Schreiben Sie zu allen drei Punkten.`,
    requirements: [
      'Sie-Form (neutral-formell)',
      'Anrede und Grußformel erforderlich',
      '3 Inhaltspunkte (alle bearbeiten)',
      '30–40 Wörter',
      'ohne Vorlagen/Beispiele',
    ],
  },
]

export const mockExamWritingTopics: WritingExercise[] = [
  {
    id: 'mock-a2-set1-writing-teil1',
    title: 'SMS: Verspätung beim Treffen',
    topicType: 'note',
    difficulty: 'A2',
    testingPart: 1,
    estimatedTime: 15,
    wordCount: { min: 20, max: 30 },
    category: ['Freizeit', 'Verabredung'],
    createdAt: '2026-08-09',
    description: 'Kurznachricht (SMS) in der du-Form.',
    task: `Sie treffen heute Ihren Freund Amir im Café. Ihr Bus hat Verspätung. Schreiben Sie Amir eine SMS.\n- Entschuldigen Sie sich.\n- Erklären Sie die Verspätung.\n- Sagen Sie, wann Sie kommen.\nSchreiben Sie 20–30 Wörter.`,
    requirements: ['Du-Form', '3 Inhaltspunkte', '20–30 Wörter'],
    examOnly: true,
  },
  {
    id: 'mock-a2-set1-writing-teil2',
    title: 'E-Mail: Termin in der Sprachschule',
    topicType: 'email',
    difficulty: 'A2',
    testingPart: 2,
    estimatedTime: 15,
    wordCount: { min: 30, max: 40 },
    category: ['Deutschlernen', 'Termin'],
    createdAt: '2026-08-09',
    description: '(Halb-)formelle E-Mail in der Sie-Form.',
    task: `Ihre Sprachschule lädt Sie am Dienstag zu einem Beratungstermin ein. Sie können an diesem Tag nicht. Schreiben Sie Frau König eine E-Mail.\n- Bedanken Sie sich für die Einladung.\n- Erklären Sie, warum Sie nicht kommen können.\n- Bitten Sie um einen neuen Termin.\nSchreiben Sie 30–40 Wörter.`,
    requirements: ['Sie-Form', 'Anrede und Grußformel', '3 Inhaltspunkte', '30–40 Wörter'],
    examOnly: true,
  },
]

export const allDefaultWritingTopics: WritingExercise[] = [
  ...defaultWritingTopics,
  ...mockExamWritingTopics,
]
