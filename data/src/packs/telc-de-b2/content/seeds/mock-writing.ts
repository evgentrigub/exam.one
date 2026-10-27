/** Original app-authored telc Deutsch B2 mock Set 1 content (exam-only); not official examination material. */
export const mockWritingSeeds: Record<string, unknown>[] = [
  {
    id: 'telc-b2-mock-writing-1',
    title: 'Ein Beet im Gemeinschaftsgarten',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    description:
      'Gemeinschaftsgarten Sonnenfeld – jetzt Beete frei!\nSie möchten Gemüse und Kräuter selbst anbauen, haben aber keinen Garten? Im Gemeinschaftsgarten am Stadtrand vermieten wir Beete in drei Größen an Einzelpersonen und Familien. Gemeinsame Gartentage, Kurse für Anfänger und ein Gerätehaus gehören dazu. Kontakt: Herr Lindqvist, garten@sonnenfeld.example.',
    task: 'Sie wohnen in einer Stadtwohnung ohne Balkon und interessieren sich für ein Beet. Schreiben Sie eine E-Mail an Herrn Lindqvist und bitten Sie um genauere Informationen. Gehen Sie auf drei der vier Punkte ein oder auf zwei Punkte und einen eigenen Aspekt. Ordnen Sie die Punkte sinnvoll und denken Sie an Betreff, Anrede, Einleitung und Schluss. Schreiben Sie mindestens 150 Wörter.',
    requirements: [
      'Kosten für die verschiedenen Beetgrößen',
      'Pflichten der Mitglieder',
      'Werkzeug und Wasserversorgung',
      'Anmeldung und mögliche Wartezeit',
    ],
    category: ['Aufgabe A · Bitte um Informationen'],
    topicType: 'email',
    wordCount: { min: 150, max: 220 },
    estimatedTime: 30,
  },
]
