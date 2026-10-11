// Original solo oral tasks: written scene, monologue, fixed examiner dialogue.
export const mockSpeakingSeeds: Record<string, unknown>[] = [
  {
    id: 'mock-certpol-pl-b1-set1-speaking-part1',
    testingPart: 1,
    difficulty: 'B1',
    examOnly: true,
    createdAt: '2026-10-10',
    theme: 'Mówienie 1 · Na dworcu',
    topicType: 'interview',
    cards: [
      {
        segment: 'turn1',
        kind: 'answer',
        topic: 'Na dworcu',
        speaker: 'examiner',
        cue: 'Opis sceny zamiast fotografii: W hali dworca młoda kobieta sprawdza tablicę odjazdów. Obok starszy mężczyzna trzyma walizkę, a pracownica informacji pokazuje mu drogę. Dziecko siedzi na ławce z plecakiem. Przez okno widać deszcz. Proszę opisać miejsce, osoby i czynności oraz powiedzieć, co mogło się wydarzyć i co będzie dalej.',
      },
    ],
  },
  {
    id: 'mock-certpol-pl-b1-set1-speaking-part2',
    testingPart: 2,
    difficulty: 'B1',
    examOnly: true,
    createdAt: '2026-10-10',
    theme: 'Mówienie 2 · Odpoczynek po pracy',
    topicType: 'interview',
    cards: [
      {
        segment: 'turn1',
        kind: 'answer',
        topic: 'Odpoczynek',
        speaker: 'examiner',
        cue: 'Proszę opowiedzieć, jak lubi Pani/Pan odpoczywać po intensywnym dniu. Proszę opisać zwykły sposób odpoczynku, wspomnieć sytuację, gdy plan trzeba było zmienić, i wyjaśnić, czy lepiej odpoczywać samemu, czy z innymi. Proszę uzasadnić opinię.',
      },
    ],
  },
  {
    id: 'mock-certpol-pl-b1-set1-speaking-part3',
    testingPart: 3,
    difficulty: 'B1',
    examOnly: true,
    createdAt: '2026-10-10',
    theme: 'Mówienie 3 · Rezerwacja wycieczki',
    topicType: 'interview',
    cards: [
      {
        segment: 'turn1',
        kind: 'ask',
        topic: 'Rezerwacja wycieczki',
        cue: 'Chce Pani/Pan zarezerwować wycieczkę dla dwóch osób. Proszę zapytać pracownika biura o wolne miejsca w sobotę i cenę.',
      },
      {
        segment: 'turn2',
        kind: 'answer',
        topic: 'Rezerwacja wycieczki',
        speaker: 'examiner',
        cue: 'Pracownik: W sobotę został tylko jeden bilet, ale w niedzielę są dwa. Cena wynosi osiemdziesiąt złotych za osobę. Czy niedziela Pani/Panu odpowiada? Proszę zareagować i podać powód swojej decyzji.',
      },
      {
        segment: 'turn3',
        kind: 'ask',
        topic: 'Rezerwacja wycieczki',
        cue: 'Proszę zapytać o miejsce zbiórki oraz to, co trzeba zabrać na wyjazd.',
      },
      {
        segment: 'turn4',
        kind: 'answer',
        topic: 'Rezerwacja wycieczki',
        speaker: 'examiner',
        cue: 'Pracownik: Spotykamy się pod ratuszem o dziewiątej. Proszę zabrać wygodne buty i napój. Za bilety trzeba zapłacić do piątku. Proszę ustalić sposób płatności i potwierdzić rezerwację.',
      },
    ],
  },
]
