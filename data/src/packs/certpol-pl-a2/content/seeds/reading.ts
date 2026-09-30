import type { ReadingPlExercise, ReadingPlGap, ReadingPlQuestion } from '../types'

type Row = Omit<ReadingPlQuestion, 'id' | 'textId' | 'type'>
type GapRow = Omit<ReadingPlGap, 'id' | 'textId' | 'type'>

/** Stamp the ids and question type the reading screen and scoring expect. */
function questions(textId: string, type: ReadingPlQuestion['type'], rows: Row[]): ReadingPlQuestion[] {
  return rows.map((row, index) => ({ ...row, id: `${textId}-q${index + 1}`, textId, type }))
}

function gaps(textId: string, rows: GapRow[]): ReadingPlGap[] {
  return rows.map((row, index) => ({ ...row, id: `${textId}-q${index + 1}`, textId, type: 'gap' }))
}

/** Each question of a gapped text offers the same box of words. */
function bank(options: string[], answers: Array<[number, string]>): Row[] {
  return answers.map(([correctAnswer, explanation], index) => ({
    question: `Luka ${index + 1}`,
    options,
    correctAnswer,
    explanation,
  }))
}

const WORD_BOX = ['chodzę', 'duża', 'gdzie', 'jabłek', 'jutro', 'kartą', 'kupiłam', 'lubię', 'od', 'osiem', 'z']

const CAPTIONS = [
  'Czy jest ta kurtka w mniejszym rozmiarze?',
  'Ile kosztuje kilo jabłek?',
  'Autobus znowu się spóźnia!',
  'Dzisiaj muzeum jest nieczynne.',
  'Poproszę kawę i kawałek sernika.',
  'Uwaga, pies zabrał nam piłkę!',
]

/** Original Polish A2 reading seeds, one per task, in the format of the 2018 sample. Not official tasks. */
export const readingPlSeeds: ReadingPlExercise[] = [
  {
    id: 'reading-pl-a2-zadanie1-001',
    title: 'List od Marka',
    content: [
      'Cześć Aniu!',
      '',
      'Dziękuję za (1) ____ list. W sobotę byłem z (2) ____ w Zakopanem. Pojechaliśmy tam (3) ____ o siódmej rano. Pogoda była (4) ____ niż w piątek, więc długo chodziliśmy po górach. Wieczorem zjedliśmy kolację w małej (5) ____ niedaleko dworca. Moja siostra (6) ____ pierogi, a ja zupę. W niedzielę (7) ____ wrócić do Krakowa, bo w poniedziałek rano miałem egzamin. W przyszłym tygodniu (8) ____ Ci zdjęcia z wycieczki. Kupiłem też dla Ciebie (9) ____ pocztówki z górami. Kiedy (10) ____ do mnie w odwiedziny? Czekam na Ciebie!',
      '',
      'Pozdrawiam serdecznie,',
      'Marek',
    ].join('\n'),
    textType: 'email',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 105,
    topics: ['Podróże', 'Czas wolny'],
    createdAt: '2026-09-30',
    questions: questions('reading-pl-a2-zadanie1-001', 'cloze', [
      {
        question: 'Luka 1',
        options: ['Twój', 'Twojego', 'Twoim'],
        correctAnswer: 0,
        explanation: 'Po „dziękuję za” używamy biernika; „list” jest rodzaju męskiego nieżywotnego: „za Twój list”.',
      },
      {
        question: 'Luka 2',
        options: ['siostra', 'siostrą', 'siostry'],
        correctAnswer: 1,
        explanation: 'Po przyimku „z” (razem z kimś) używamy narzędnika: „z siostrą”.',
      },
      {
        question: 'Luka 3',
        options: ['pociąg', 'pociągu', 'pociągiem'],
        correctAnswer: 2,
        explanation: 'Środek transportu bez przyimka stoi w narzędniku: „pojechać pociągiem”.',
      },
      {
        question: 'Luka 4',
        options: ['ładna', 'ładniejsza', 'najładniejsza'],
        correctAnswer: 1,
        explanation: 'Po wyrazie „niż” potrzebny jest stopień wyższy: „ładniejsza niż”.',
      },
      {
        question: 'Luka 5',
        options: ['restauracja', 'restauracji', 'restaurację'],
        correctAnswer: 1,
        explanation: 'Po przyimku „w” (gdzie?) używamy miejscownika: „w małej restauracji”.',
      },
      {
        question: 'Luka 6',
        options: ['zamówił', 'zamówiła', 'zamówili'],
        correctAnswer: 1,
        explanation: 'Podmiot „moja siostra” jest rodzaju żeńskiego, więc czasownik ma formę „zamówiła”.',
      },
      {
        question: 'Luka 7',
        options: ['musimy', 'musieliśmy', 'musicie'],
        correctAnswer: 1,
        explanation: 'Marek opowiada o przeszłości („miałem egzamin”), więc potrzebny jest czas przeszły: „musieliśmy”.',
      },
      {
        question: 'Luka 8',
        options: ['wyślę', 'wysłałem', 'wysłać'],
        correctAnswer: 0,
        explanation: '„W przyszłym tygodniu” wymaga czasu przyszłego: „wyślę”.',
      },
      {
        question: 'Luka 9',
        options: ['dwa', 'dwie', 'dwóch'],
        correctAnswer: 1,
        explanation: '„Pocztówka” jest rodzaju żeńskiego, więc mówimy „dwie pocztówki”.',
      },
      {
        question: 'Luka 10',
        options: ['przyjedziesz', 'przyjechałaś', 'przyjeżdżać'],
        correctAnswer: 0,
        explanation: 'Marek pyta o przyszłość („Czekam na Ciebie!”), więc potrzebny jest czas przyszły: „przyjedziesz”.',
      },
    ]),
  },
  {
    id: 'reading-pl-a2-zadanie2-001',
    title: 'Zakupy i miasto',
    content: [
      `Wyrazy do wyboru: ${WORD_BOX.join(', ')}`,
      '',
      'Sklep jest otwarty (1) ____ poniedziałku do piątku.',
      'Poproszę kilogram (2) ____ i pół kilo sera.',
      'Przepraszam, (3) ____ jest najbliższa apteka?',
      'W piątek wieczorem zawsze (4) ____ z przyjaciółmi do kina.',
      'Ta sukienka jest za (5) ____, poproszę mniejszy rozmiar.',
      'Na śniadanie piję kawę (6) ____ mlekiem.',
      'Moja córka ma (7) ____ lat.',
      'Czy mogę zapłacić (8) ____?',
      'Bardzo (9) ____ oglądać filmy w domu.',
      'Wczoraj (10) ____ nowe buty w centrum handlowym.',
    ].join('\n'),
    textType: 'article',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 75,
    topics: ['Zakupy', 'Miasto'],
    createdAt: '2026-09-30',
    questions: questions(
      'reading-pl-a2-zadanie2-001',
      'cloze',
      bank(WORD_BOX, [
        [8, '„Od … do …” wyraża czas: od poniedziałku do piątku.'],
        [3, 'Po „kilogram” mówimy, czego: dopełniacz liczby mnogiej „jabłek”.'],
        [2, 'Pytamy o miejsce: „gdzie jest apteka?”.'],
        [0, 'Coś robimy regularnie („zawsze”), więc używamy czasownika „chodzić”: „chodzę do kina”.'],
        [1, '„Za duża” – sukienka ma zły rozmiar, dlatego osoba prosi o mniejszy.'],
        [10, 'Kawa razem z mlekiem: „z mlekiem” (narzędnik).'],
        [9, 'Wiek podajemy liczebnikiem: „ma osiem lat”.'],
        [5, 'Płacimy czymś – narzędnik: „zapłacić kartą”.'],
        [7, '„Lubię” + bezokolicznik: „lubię oglądać filmy”.'],
        [6, '„Wczoraj” wymaga czasu przeszłego: „kupiłam”.'],
      ])
    ),
  },
  {
    id: 'reading-pl-a2-zadanie3-001',
    title: 'Napisy',
    content: [
      'Napis 1: „Kasa nieczynna”',
      'Napis 2: „Peron 3”',
      'Napis 3: „Nie dotykać eksponatów”',
      'Napis 4: „Rejestracja pacjentów”',
      'Napis 5: „Wyprzedaż – wszystko 50% taniej”',
    ].join('\n'),
    textType: 'notice',
    testingPart: 3,
    difficulty: 'A2',
    estimatedReadingTime: 3,
    wordCount: 20,
    topics: ['Miasto', 'Usługi'],
    createdAt: '2026-09-30',
    questions: questions('reading-pl-a2-zadanie3-001', 'comprehension', [
      {
        question: 'Napis 1: Co oznacza ten napis?',
        options: ['Tu nie można teraz zapłacić.', 'Tu można kupić bilet taniej.', 'Kasa jest otwarta całą dobę.'],
        correctAnswer: 0,
        explanation: '„Nieczynna” znaczy, że kasa teraz nie działa.',
      },
      {
        question: 'Napis 2: Gdzie można zobaczyć ten napis?',
        options: ['w banku', 'na dworcu kolejowym', 'w szpitalu'],
        correctAnswer: 1,
        explanation: 'Perony są na dworcu kolejowym.',
      },
      {
        question: 'Napis 3: Gdzie można zobaczyć ten napis?',
        options: ['w sklepie spożywczym', 'w muzeum', 'na basenie'],
        correctAnswer: 1,
        explanation: 'Eksponaty to rzeczy pokazywane w muzeum.',
      },
      {
        question: 'Napis 4: Gdzie można zobaczyć ten napis?',
        options: ['na poczcie', 'w kinie', 'w przychodni'],
        correctAnswer: 2,
        explanation: 'Pacjenci rejestrują się na wizytę u lekarza w przychodni.',
      },
      {
        question: 'Napis 5: Co oznacza ten napis?',
        options: ['Sklep jest dziś zamknięty.', 'Wszystkie rzeczy kosztują teraz połowę ceny.', 'Za zakupy trzeba zapłacić gotówką.'],
        correctAnswer: 1,
        explanation: '„50% taniej” znaczy, że cena jest o połowę niższa.',
      },
    ]),
  },
  {
    id: 'reading-pl-a2-zadanie4-001',
    title: 'Krótkie teksty',
    content: [
      'Tekst 1',
      'Szanowni Mieszkańcy! W czwartek 14 marca od 8:00 do 14:00 nie będzie wody w całym budynku. Przepraszamy za utrudnienia. Administracja',
      '',
      'Tekst 2',
      'Kasiu, poszłam do sklepu po chleb i mleko. Wrócę za pół godziny. Obiad jest w lodówce – musisz go tylko podgrzać. Mama',
      '',
      'Tekst 3',
      'Hej Piotrek! Nie mogę dziś przyjść na trening, bo boli mnie noga. Możesz powiedzieć o tym trenerowi? Dzięki! Tomek',
      '',
      'Tekst 4',
      'Sprzedam rower dla dziecka (6–9 lat). Mało używany, kolor czerwony. Cena: 150 zł. Tel. 601 234 567, proszę dzwonić po 17:00.',
      '',
      'Tekst 5',
      'Uwaga! Kurs języka polskiego dla początkujących zaczyna się 2 października. Zajęcia są we wtorki i czwartki od 18:00 do 19:30 w sali 12. Zapisy w sekretariacie.',
    ].join('\n'),
    textType: 'announcement',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 130,
    topics: ['Życie codzienne', 'Dom'],
    createdAt: '2026-09-30',
    questions: questions('reading-pl-a2-zadanie4-001', 'comprehension', [
      {
        question: 'Tekst 1: Co się stanie w czwartek?',
        options: ['Administracja będzie zamknięta.', 'W budynku przez kilka godzin nie będzie wody.', 'Mieszkańcy muszą zapłacić za wodę.'],
        correctAnswer: 1,
        explanation: 'Od 8:00 do 14:00 nie będzie wody w całym budynku.',
      },
      {
        question: 'Tekst 2: Co ma zrobić Kasia?',
        options: ['pójść do sklepu', 'ugotować obiad', 'podgrzać obiad'],
        correctAnswer: 2,
        explanation: 'Mama pisze, że obiad jest w lodówce i Kasia musi go tylko podgrzać.',
      },
      {
        question: 'Tekst 3: Dlaczego Tomek pisze do Piotrka?',
        options: ['Chce, żeby Piotrek przekazał wiadomość trenerowi.', 'Chce pójść z Piotrkiem do lekarza.', 'Chce zmienić godzinę treningu.'],
        correctAnswer: 0,
        explanation: 'Tomek prosi: „Możesz powiedzieć o tym trenerowi?”.',
      },
      {
        question: 'Tekst 4: Kiedy można zadzwonić w sprawie roweru?',
        options: ['tylko rano', 'po piątej po południu', 'w każdej chwili'],
        correctAnswer: 1,
        explanation: 'W ogłoszeniu jest napisane: „proszę dzwonić po 17:00”.',
      },
      {
        question: 'Tekst 5: Gdzie trzeba się zapisać na kurs?',
        options: ['w sekretariacie', 'w sali 12', 'przez internet'],
        correctAnswer: 0,
        explanation: '„Zapisy w sekretariacie”; w sali 12 są zajęcia.',
      },
    ]),
  },
  {
    id: 'reading-pl-a2-zadanie5-001',
    title: 'Zapisy na kurs języka angielskiego',
    content: [
      'Nazywam się Ewa Nowicka. Mam trzydzieści cztery lata. Urodziłam się w Poznaniu, ale od pięciu lat mieszkam w Gdańsku, na ulicy Morskiej 15. Jestem pielęgniarką i pracuję w szpitalu miejskim. Mam męża i dwoje dzieci: syna i córkę. W wolnym czasie lubię pływać i czytać kryminały. Chcę zapisać się na kurs języka angielskiego, bo w przyszłym roku jedziemy na wakacje do Irlandii. Najlepiej mogę się uczyć w soboty rano, bo w tygodniu dużo pracuję. Mój numer telefonu to 512 408 316.',
      '',
      'FORMULARZ ZGŁOSZENIOWY – KURS JĘZYKOWY',
      'Imię: (1) ____',
      'Nazwisko: (2) ____',
      'Wiek: (3) ____',
      'Miejsce urodzenia: (4) ____',
      'Adres: (5) ____',
      'Zawód: (6) ____',
      'Liczba dzieci: (7) ____',
      'Zainteresowania: (8) ____',
      'Termin zajęć: (9) ____',
      'Numer telefonu: (10) ____',
    ].join('\n'),
    textType: 'article',
    testingPart: 5,
    difficulty: 'A2',
    estimatedReadingTime: 6,
    wordCount: 110,
    topics: ['Dane osobowe', 'Nauka'],
    createdAt: '2026-09-30',
    questions: gaps('reading-pl-a2-zadanie5-001', [
      { question: 'Imię', accepted: ['Ewa'], explanation: '„Nazywam się Ewa Nowicka.”' },
      { question: 'Nazwisko', accepted: ['Nowicka'], explanation: '„Nazywam się Ewa Nowicka.”' },
      {
        question: 'Wiek',
        accepted: ['34', '34 lata', 'trzydzieści cztery', 'trzydzieści cztery lata'],
        explanation: '„Mam trzydzieści cztery lata.”',
      },
      { question: 'Miejsce urodzenia', accepted: ['Poznań', 'w Poznaniu'], explanation: '„Urodziłam się w Poznaniu.”' },
      {
        question: 'Adres',
        accepted: [
          'ul. Morska 15, Gdańsk',
          'ulica Morska 15, Gdańsk',
          'Gdańsk, ul. Morska 15',
          'Gdańsk, ulica Morska 15',
          'ul. Morska 15',
          'ulica Morska 15',
          'Morska 15',
          'Morska 15, Gdańsk',
        ],
        explanation: '„Mieszkam w Gdańsku, na ulicy Morskiej 15.”',
      },
      { question: 'Zawód', accepted: ['pielęgniarka'], explanation: '„Jestem pielęgniarką.”' },
      { question: 'Liczba dzieci', accepted: ['2', 'dwoje', 'dwoje dzieci', '2 dzieci'], explanation: '„Mam męża i dwoje dzieci.”' },
      {
        question: 'Zainteresowania',
        accepted: [
          'pływanie i czytanie',
          'pływanie, czytanie',
          'pływanie i czytanie kryminałów',
          'pływanie i kryminały',
          'pływać i czytać',
          'pływać i czytać kryminały',
        ],
        explanation: '„W wolnym czasie lubię pływać i czytać kryminały.”',
      },
      {
        question: 'Termin zajęć',
        accepted: ['soboty rano', 'w soboty rano', 'sobota rano', 'soboty', 'sobota', 'w soboty'],
        explanation: '„Najlepiej mogę się uczyć w soboty rano.”',
      },
      {
        question: 'Numer telefonu',
        accepted: ['512 408 316', '512408316', '512-408-316'],
        explanation: '„Mój numer telefonu to 512 408 316.”',
      },
    ]),
  },
  {
    id: 'reading-pl-a2-zadanie6-001',
    title: 'Sobota w mieście',
    content: [
      'Scena 1: Kobieta stoi w deszczu na przystanku i niecierpliwie patrzy na zegarek.',
      'Scena 2: Dwóch chłopców gra w piłkę w parku, a mały pies biegnie z ich piłką w pysku.',
      'Scena 3: Mężczyzna siedzi w kawiarni i czyta menu, a obok stoi kelnerka z notesem.',
      'Scena 4: Dziewczyna przymierza w sklepie czerwoną kurtkę, ale kurtka jest na nią za duża.',
      'Scena 5: Starsza pani stoi na targu przy stoisku z owocami i trzyma w ręce portfel.',
    ].join('\n'),
    textType: 'article',
    testingPart: 6,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 80,
    topics: ['Miasto', 'Czas wolny'],
    createdAt: '2026-09-30',
    questions: questions('reading-pl-a2-zadanie6-001', 'matching', [
      { question: 'Scena 1', options: CAPTIONS, correctAnswer: 2, explanation: 'Kobieta czeka na przystanku i patrzy na zegarek – autobus się spóźnia.' },
      { question: 'Scena 2', options: CAPTIONS, correctAnswer: 5, explanation: 'Pies biegnie z piłką chłopców.' },
      { question: 'Scena 3', options: CAPTIONS, correctAnswer: 4, explanation: 'Mężczyzna w kawiarni zamawia u kelnerki.' },
      { question: 'Scena 4', options: CAPTIONS, correctAnswer: 0, explanation: 'Kurtka jest za duża, więc dziewczyna pyta o mniejszy rozmiar.' },
      { question: 'Scena 5', options: CAPTIONS, correctAnswer: 1, explanation: 'Pani na targu przy owocach pyta o cenę jabłek.' },
    ]),
  },
]
