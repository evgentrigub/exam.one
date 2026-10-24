/** Original app-authored C1 exam-only content; requires linguistic review. */
export const mockWritingSeeds: Record<string, unknown>[] = [
  {
    id: 'c1-mock-writing-1',
    title: 'Kulturelle Angebote ohne Eintritt?',
    testingPart: 1,
    difficulty: 'C1',
    createdAt: '2026-10-11',
    examOnly: true,
    description:
      'In einem Onlineforum wird diskutiert, ob Museen grundsätzlich kostenlosen Eintritt anbieten sollten. Verfassen Sie einen differenzierten Beitrag.',
    task: 'In einem Onlineforum wird diskutiert, ob Museen grundsätzlich kostenlosen Eintritt anbieten sollten. Verfassen Sie einen differenzierten Beitrag. Behandeln Sie alle vier Punkte. Schreiben Sie etwa 230 Wörter.',
    requirements: [
      'Äußern Sie Ihre Meinung zum kostenlosen Museumsbesuch.',
      'Begründen Sie die Bedeutung kultureller Teilhabe.',
      'Erläutern Sie mögliche Nachteile einer Abschaffung der Eintrittspreise.',
      'Schlagen Sie ein alternatives Finanzierungs- oder Zugangsmodell vor und erläutern Sie dessen Vorteile.',
    ],
    category: ['Gesellschaft'],
    topicType: 'forum',
    wordCount: {
      min: 230,
      max: 260,
    },
    estimatedTime: 50,
  },
  {
    id: 'c1-mock-writing-2',
    title: 'Raum für eine Veranstaltung ändern',
    testingPart: 2,
    difficulty: 'C1',
    createdAt: '2026-10-11',
    examOnly: true,
    description:
      'Sie organisieren für einen Verein eine öffentliche Diskussionsveranstaltung. Der zugesagte Raum ist kurzfristig nicht nutzbar. Schreiben Sie an den Ansprechpartner der Stadtverwaltung, Herrn Berger.',
    task: 'Sie organisieren für einen Verein eine öffentliche Diskussionsveranstaltung. Der zugesagte Raum ist kurzfristig nicht nutzbar. Schreiben Sie an den Ansprechpartner der Stadtverwaltung, Herrn Berger. Behandeln Sie alle vier Punkte. Schreiben Sie etwa 120 Wörter. Achten Sie auf Anrede und Gruß.',
    requirements: [
      'Schildern Sie die entstandene Situation.',
      'Erklären Sie die besonderen Anforderungen an einen Ersatzraum.',
      'Bitten Sie höflich um Unterstützung.',
      'Schlagen Sie eine konkrete Lösung mit Termin vor.',
    ],
    category: ['Gesellschaft'],
    topicType: 'email',
    wordCount: {
      min: 120,
      max: 150,
    },
    estimatedTime: 25,
  },
]
