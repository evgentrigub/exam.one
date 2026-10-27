/** Original app-authored telc Deutsch B2 practice content; not official examination material. */
const TASK_RULES =
  'Gehen Sie auf drei der vier Punkte ein oder auf zwei Punkte und einen eigenen Aspekt. Ordnen Sie die Punkte sinnvoll und denken Sie an Betreff, Anrede, Einleitung und Schluss. Schreiben Sie mindestens 150 Wörter.'

export const writingSeeds: Record<string, unknown>[] = [
  {
    id: 'telc-b2-practice-writing-1',
    title: 'Arbeitsplatz im Coworking-Space',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    description:
      'Werkraum Mitte – Ihr Arbeitsplatz in der Altstadt\nHelle Schreibtische, schnelles Internet und eine ruhige Atmosphäre: Bei uns arbeiten Selbstständige, Studierende und Angestellte im Homeoffice Tür an Tür. Flexible Tarife ab einem Tag pro Woche, Besprechungsräume nach Bedarf und regelmäßige Treffen zum Austausch. Fragen beantwortet Ihnen gern Frau Okafor unter info@werkraum-mitte.example.',
    task: `Sie arbeiten seit einigen Monaten von zu Hause aus und suchen einen Arbeitsplatz außerhalb der Wohnung. Schreiben Sie eine E-Mail an Frau Okafor und bitten Sie um genauere Informationen. ${TASK_RULES}`,
    requirements: [
      'Preise und Mindestlaufzeit der Tarife',
      'Ausstattung der Arbeitsplätze',
      'Möglichkeit, den Raum vorher zu testen',
      'Veranstaltungen für Mitglieder',
    ],
    category: ['Aufgabe A · Bitte um Informationen'],
    topicType: 'email',
    wordCount: { min: 150, max: 220 },
    estimatedTime: 30,
  },
  {
    id: 'telc-b2-practice-writing-2',
    title: 'Enttäuschender Kochkurs',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    description:
      'Kochschule Pfeffer & Salz – Wochenendkurs „Mediterrane Küche“\nKochen Sie in kleiner Runde mit höchstens acht Teilnehmenden! Unser Küchenchef zeigt Ihnen Schritt für Schritt, wie Sie fünf Gerichte aus frischen Bio-Zutaten zubereiten. Alle Rezepte erhalten Sie in einer schön gestalteten Mappe zum Mitnehmen. Samstag 10–16 Uhr, 129 Euro inklusive Mittagessen und Getränken.',
    task: `Sie haben an dem Kurs teilgenommen und waren sehr unzufrieden. Schreiben Sie eine E-Mail an die Kochschule und beschweren Sie sich. ${TASK_RULES}`,
    requirements: [
      'Größe der Gruppe',
      'Qualität der Zutaten und Ablauf des Kurses',
      'fehlende Unterlagen',
      'Ihre Erwartung an die Kochschule',
    ],
    category: ['Aufgabe B · Beschwerde'],
    topicType: 'email',
    wordCount: { min: 150, max: 220 },
    estimatedTime: 30,
  },
]
