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
      max: 30
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
      'ohne Vorlagen/Beispiele'
    ]
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
      max: 40
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
      'ohne Vorlagen/Beispiele'
    ]
  }
]
