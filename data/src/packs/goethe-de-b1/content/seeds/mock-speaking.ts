function exercise(part: number, theme: string, cues: { kind: 'ask' | 'answer'; cue: string }[]) {
  return {
    id: `mock-goethe-de-b1-set1-speaking-part${part}`,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    theme,
    topicType: 'interview',
    cards: cues.map(({ kind, cue }, index) => ({
      segment: `turn${index + 1}`,
      kind,
      cue,
      topic: theme,
      ...(kind === 'answer' ? { speaker: 'examiner' } : {}),
    })),
  }
}
export const mockSpeakingSeeds: Record<string, unknown>[] = [
  exercise(1, 'Gemeinsam einen Bücherabend planen', [
    {
      kind: 'ask',
      cue: 'Sie möchten mit Ihrem Partner einen Bücherabend für Ihren Sprachkurs organisieren. Die Teilnehmer sollen Bücher mitbringen und tauschen. Schlagen Sie einen Ort und einen Termin vor und fragen Sie nach der Meinung Ihres Partners.',
    },
    {
      kind: 'answer',
      cue: 'Partner: Freitagabend passt gut. Unser Kursraum ist aber zu klein. Wo könnten wir den Bücherabend stattdessen veranstalten? Reagieren Sie und schlagen Sie eine Lösung vor.',
    },
    {
      kind: 'answer',
      cue: 'Partner: Das Stadtteilzentrum wäre möglich. Dort kostet der Raum zwanzig Euro. Wie bezahlen wir den Raum, und was machen wir mit Getränken? Besprechen Sie beide Punkte.',
    },
    {
      kind: 'answer',
      cue: 'Partner: Gut, so machen wir es. Wer lädt die Teilnehmer ein, und welche Informationen brauchen sie? Verteilen Sie die Aufgaben und fassen Sie den Plan zusammen.',
    },
  ]),
  exercise(2, 'Ist Lernen im Internet besser als im Kursraum?', [
    {
      kind: 'answer',
      cue: 'Präsentieren Sie das Thema „Ist Lernen im Internet besser als im Kursraum?“. Gehen Sie auf fünf Punkte ein: Thema und Aufbau Ihrer Präsentation vorstellen; Ihre persönliche Erfahrung; die Situation in Ihrem Heimatland; Vor- und Nachteile sowie Ihre eigene Meinung; Abschluss und Dank. Sprechen Sie ungefähr drei Minuten.',
    },
  ]),
  exercise(3, 'Auf eine Präsentation reagieren', [
    {
      kind: 'answer',
      cue: 'Ihr Partner hat folgende Präsentation gehalten: „Ich lerne gern mit Sprachvideos, weil ich sie jederzeit ansehen und schwierige Stellen wiederholen kann. In meinem Heimatland nutzen viele Menschen solche Angebote. Allerdings fehlen mir dabei persönliche Gespräche und direkte Rückmeldungen. Deshalb besuche ich zusätzlich einmal pro Woche einen Kurs.“ Geben Sie eine kurze Rückmeldung zu dieser Präsentation.',
    },
    {
      kind: 'ask',
      cue: 'Stellen Sie Ihrem Partner eine Frage zu seiner Präsentation über Sprachvideos und den zusätzlichen Kurs. Die Angaben aus der Präsentation stehen auf der vorherigen Karte.',
    },
    {
      kind: 'answer',
      cue: 'Zu Ihrer eigenen Präsentation über Lernen im Internet oder im Kursraum fragt der Partner: „Wie kann man beim Lernen im Internet motiviert bleiben?“ Antworten Sie mit einer Begründung und einem konkreten Beispiel.',
    },
  ]),
]
