import type { ListeningPlExercise, ListeningPlItem } from '../types'
import { withSeedAudio } from '../listening-audio'

/** Stamp the per-item ids the per-item audio map is keyed by. */
function items(
  exerciseId: string,
  rows: Omit<ListeningPlItem, 'id' | 'context'>[]
): ListeningPlItem[] {
  return rows.map((row, index) => ({
    ...row,
    context: `Nagranie ${index + 1}`,
    id: `${exerciseId}-i${index + 1}`,
  }))
}

function rows<T extends object>(exerciseId: string, list: T[]): Array<T & { id: string }> {
  return list.map((row, index) => ({ ...row, id: `${exerciseId}-q${index + 1}` }))
}

const TRUE_FALSE = ['Prawda', 'Fałsz']

const WHO = 'Kto mówi?'
const WHERE = 'Gdzie to słyszymy?'

const SPORTS = [
  'bieganie',
  'joga',
  'jazda na nartach',
  'pływanie',
  'siatkówka',
  'tenis',
  'jazda na rowerze',
]

const PURPOSES = [
  'Ktoś zaprasza na przyjęcie.',
  'Ktoś przypomina o obowiązku.',
  'Ktoś dziękuje za pomoc.',
  'Ktoś odwołuje spotkanie.',
  'Ktoś prosi o pomoc.',
  'Ktoś zmienia godzinę wizyty.',
]

/**
 * Original Polish A2 listening seeds, one per task, in the format of the 2018 sample. Not
 * official tasks.
 *
 * They ship without an `audio` map: the player finds no file, shows the missing-audio notice,
 * and **Generate audio** synthesises it with the local Polish Piper voices. Every turn starts
 * with a role, a first name or "Pan / Pani" and a surname, so each speaker gets a voice of the
 * right gender; a single leading label picks the voice of a monologue and is not read aloud.
 */
export const listeningPlSeeds: ListeningPlExercise[] = [
  {
    id: 'listening-pl-a2-zadanie1-001',
    title: 'Zadanie I: Kto mówi? Gdzie?',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    items: items('listening-pl-a2-zadanie1-001', [
      {
        transcript:
          'Kobieta: Proszę otworzyć usta i powiedzieć „a”. Dobrze. Niestety ma pan chore gardło. Wypiszę panu receptę.',
        question: WHO,
        options: ['nauczycielka', 'lekarka', 'fryzjerka'],
        correctAnswer: 1,
        explanation: 'Kobieta bada gardło i wypisuje receptę – to lekarka.',
      },
      {
        transcript:
          'Mężczyzna: Dzień dobry, bilety do kontroli. Czy mogę zobaczyć pana bilet? Następna stacja: Warszawa Centralna.',
        question: WHO,
        options: ['konduktor', 'kelner', 'policjant'],
        correctAnswer: 0,
        explanation: 'Mężczyzna sprawdza bilety w pociągu – to konduktor.',
      },
      {
        transcript:
          'Kobieta: Dzisiaj zrobimy ćwiczenie numer pięć. Proszę otworzyć książki na stronie dwudziestej i przeczytać tekst.',
        question: WHO,
        options: ['sprzedawczyni', 'lekarka', 'nauczycielka'],
        correctAnswer: 2,
        explanation: 'Kobieta mówi o ćwiczeniach i książkach na lekcji – to nauczycielka.',
      },
      {
        transcript:
          'Mężczyzna: Mamy dziś zupę pomidorową i świeżą rybę. Co państwu podać do picia?',
        question: WHO,
        options: ['kelner', 'kierowca', 'listonosz'],
        correctAnswer: 0,
        explanation: 'Mężczyzna proponuje dania i napoje – to kelner.',
      },
      {
        transcript:
          'Kobieta: Poproszę dwa bilety normalne do Krakowa na pociąg o piętnastej dwadzieścia.',
        question: WHERE,
        options: ['na lotnisku', 'na dworcu kolejowym', 'w kinie'],
        correctAnswer: 1,
        explanation: 'Kobieta kupuje bilety na pociąg – jest na dworcu kolejowym.',
      },
      {
        transcript: 'Mężczyzna: Chciałbym wysłać ten list polecony do Niemiec. Ile to kosztuje?',
        question: WHERE,
        options: ['na poczcie', 'w banku', 'w sklepie'],
        correctAnswer: 0,
        explanation: 'Mężczyzna wysyła list polecony – jest na poczcie.',
      },
      {
        transcript:
          'Kobieta: Przepraszam, gdzie jest mleko? A, jest tam, obok soków. Wezmę jeszcze chleb i masło.',
        question: WHERE,
        options: ['w restauracji', 'w supermarkecie', 'w aptece'],
        correctAnswer: 1,
        explanation: 'Kobieta szuka mleka na półce i bierze chleb i masło – jest w supermarkecie.',
      },
      {
        transcript: 'Mężczyzna: Poproszę coś na ból głowy. Czy te tabletki są bez recepty?',
        question: WHERE,
        options: ['u fryzjera', 'w bibliotece', 'w aptece'],
        correctAnswer: 2,
        explanation: 'Mężczyzna kupuje tabletki na ból głowy – jest w aptece.',
      },
      {
        transcript:
          'Kobieta: Chciałabym oddać te dwie książki i wypożyczyć nową powieść. Jak długo mogę ją mieć?',
        question: WHERE,
        options: ['w bibliotece', 'w księgarni', 'w szkole'],
        correctAnswer: 0,
        explanation: 'Książki można oddać i wypożyczyć w bibliotece; w księgarni się je kupuje.',
      },
      {
        transcript:
          'Mężczyzna: Proszę państwa, za dwadzieścia minut lądujemy w Londynie. Proszę wrócić na swoje miejsca i zapiąć pasy.',
        question: WHERE,
        options: ['w autobusie', 'w samolocie', 'na statku'],
        correctAnswer: 1,
        explanation: '„Lądujemy” i „zapiąć pasy” słyszymy w samolocie.',
      },
    ]),
  },
  {
    id: 'listening-pl-a2-zadanie2-001',
    title: 'Zadanie II: Festiwal Pierogów',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context: 'Usłyszysz komunikat w radiu o festiwalu w Krakowie.',
    transcript:
      'Spiker: Dzień dobry, zapraszamy na Festiwal Pierogów w Krakowie! Festiwal będzie w dniach od szesnastego do osiemnastego sierpnia na Małym Rynku. Co roku przyjeżdżają do nas kucharze z całej Polski. W tym roku można spróbować ponad trzydziestu rodzajów pierogów: z mięsem, z kapustą, z serem, a nawet z owocami. Festiwal jest otwarty codziennie od jedenastej do dwudziestej pierwszej. Wstęp jest bezpłatny, ale za pierogi trzeba zapłacić – porcja kosztuje od dwunastu do osiemnastu złotych. W sobotę o szesnastej zapraszamy dzieci na warsztaty: razem z kucharzami zrobią własne pierogi. Na warsztaty trzeba zapisać się wcześniej przez internet. Do zobaczenia w Krakowie!',
    questions: rows('listening-pl-a2-zadanie2-001', [
      {
        question: 'Festiwal trwa trzy dni.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: 'Festiwal jest od szesnastego do osiemnastego sierpnia – trzy dni.',
      },
      {
        question: 'Na festiwal przyjeżdżają kucharze tylko z Krakowa.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Kucharze przyjeżdżają „z całej Polski”.',
      },
      {
        question: 'Za wejście na festiwal nie trzeba płacić.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: '„Wstęp jest bezpłatny” – płaci się tylko za pierogi.',
      },
      {
        question: 'Warsztaty dla dzieci są w niedzielę.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Warsztaty są „w sobotę o szesnastej”.',
      },
      {
        question: 'Na warsztaty można przyjść bez zapisów.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: '„Na warsztaty trzeba zapisać się wcześniej przez internet.”',
      },
    ]),
  },
  {
    id: 'listening-pl-a2-zadanie3-001',
    title: 'Zadanie III: Sport w rodzinie',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context: 'Usłyszysz rozmowę Kasi i Tomka o tym, jaki sport uprawiają ich rodziny i znajomi.',
    transcript: [
      'Tomek: Kasiu, słyszałem, że twój brat zaczął grać w tenisa?',
      'Kasia: Nie, Michał grał w tenisa w szkole, ale teraz codziennie biega. Mówi, że to tanie i zdrowe.',
      'Tomek: A twoja siostra? Ona chyba lubi wodę.',
      'Kasia: Tak, Ola dwa razy w tygodniu chodzi na basen. Pływa już bardzo dobrze.',
      'Tomek: Moja mama też chciała pływać, ale w końcu zapisała się na jogę. Chodzi na zajęcia w poniedziałki.',
      'Kasia: A twój tata? Dalej jeździ na nartach?',
      'Tomek: Zimą tak, ale teraz jest lato, więc jeździ na rowerze do pracy. Codziennie dwadzieścia kilometrów!',
      'Kasia: Super. A pani Nowak, twoja sąsiadka? Widziałam ją z rakietą.',
      'Tomek: Tak, pani Nowak gra w tenisa z mężem w każdą sobotę.',
      'Kasia: Może my też zaczniemy coś trenować? Na przykład siatkówkę?',
      'Tomek: Dobry pomysł, pomyślę o tym!',
    ].join('\n'),
    options: SPORTS,
    questions: rows('listening-pl-a2-zadanie3-001', [
      {
        person: 'brat Kasi',
        correctAnswer: 0,
        explanation: '„Michał grał w tenisa w szkole, ale teraz codziennie biega.”',
      },
      {
        person: 'siostra Kasi',
        correctAnswer: 3,
        explanation: '„Ola dwa razy w tygodniu chodzi na basen.”',
      },
      {
        person: 'mama Tomka',
        correctAnswer: 1,
        explanation: '„Moja mama … zapisała się na jogę.”',
      },
      {
        person: 'tata Tomka',
        correctAnswer: 6,
        explanation: '„Teraz jest lato, więc jeździ na rowerze do pracy.”',
      },
      {
        person: 'pani Nowak',
        correctAnswer: 5,
        explanation: '„Pani Nowak gra w tenisa z mężem w każdą sobotę.”',
      },
    ]),
  },
  {
    id: 'listening-pl-a2-zadanie4-001',
    title: 'Zadanie IV: Wiadomości na sekretarce',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context: 'Usłyszysz pięć wiadomości nagranych na sekretarce.',
    transcript: [
      'Kasia: Cześć Ola, tu Kasia. Niestety nie mogę jutro przyjść na kawę, bo muszę zostać dłużej w pracy. Może spotkamy się w piątek?',
      'Pan Wiśniewski: Dzień dobry, tu Jan Wiśniewski z przychodni. Pani wizyta u lekarza nie jest w środę o dziesiątej, tylko w środę o dwunastej. Dziękuję i do widzenia.',
      'Tomek: Hej, tu Tomek. W sobotę robię imprezę urodzinową u mnie w domu. Zaczynamy o ósmej wieczorem. Przyjdź koniecznie!',
      'Pani Kowalska: Dzień dobry, mówi Kowalska z biblioteki. Przypominam, że musi pani oddać dwie książki do końca tygodnia.',
      'Marek: Cześć, tu Marek. Zepsuł mi się komputer, a jutro muszę wysłać ważny projekt. Pomożesz mi? Zadzwoń, proszę, jak najszybciej.',
    ].join('\n'),
    options: PURPOSES,
    questions: rows('listening-pl-a2-zadanie4-001', [
      {
        person: 'Wiadomość 1',
        correctAnswer: 3,
        explanation: 'Kasia nie może jutro przyjść na kawę.',
      },
      {
        person: 'Wiadomość 2',
        correctAnswer: 5,
        explanation: 'Wizyta nie jest o dziesiątej, tylko o dwunastej.',
      },
      {
        person: 'Wiadomość 3',
        correctAnswer: 0,
        explanation: 'Tomek zaprasza na imprezę urodzinową.',
      },
      {
        person: 'Wiadomość 4',
        correctAnswer: 1,
        explanation: 'Pani z biblioteki przypomina o oddaniu książek.',
      },
      { person: 'Wiadomość 5', correctAnswer: 4, explanation: 'Marek pyta: „Pomożesz mi?”.' },
    ]),
  },
  {
    id: 'listening-pl-a2-zadanie5-001',
    title: 'Zadanie V: Koncert w parku',
    testingPart: 5,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context: 'Usłyszysz informację o koncercie w parku.',
    transcript:
      'Spiker: Zapraszamy na wielki koncert muzyki filmowej w Parku Miejskim w Toruniu! Koncert odbędzie się w sobotę dwudziestego czerwca. Początek o godzinie dziewiętnastej trzydzieści, ale park otwieramy już o osiemnastej. Zagra dla państwa orkiestra, w której jest sześćdziesięciu pięciu muzyków. Bilety kosztują czterdzieści złotych, a dla dzieci i studentów – dwadzieścia pięć złotych. Dzieci poniżej siedmiu lat wchodzą za darmo. To już dziesiąty koncert w naszym parku – pierwszy był w dwa tysiące siedemnastym roku. Bilety można kupić w kasie parku albo przez internet. Serdecznie zapraszamy!',
    content: [
      'Koncert muzyki filmowej',
      '',
      'Data koncertu: (1) ____',
      'Początek koncertu: godz. (2) ____',
      'Liczba muzyków: (3) ____',
      'Cena biletu dla studenta: (4) ____ zł',
      'Rok pierwszego koncertu: (5) ____',
    ].join('\n'),
    questions: rows('listening-pl-a2-zadanie5-001', [
      {
        question: 'Data koncertu',
        accepted: [
          '20 czerwca',
          'dwudziestego czerwca',
          '20.06',
          '20 VI',
          'sobota, 20 czerwca',
          'w sobotę 20 czerwca',
        ],
        explanation: '„Koncert odbędzie się w sobotę dwudziestego czerwca.”',
      },
      {
        question: 'Początek koncertu',
        accepted: [
          '19:30',
          '19.30',
          '19 30',
          'dziewiętnasta trzydzieści',
          'dziewiętnastej trzydzieści',
        ],
        explanation:
          '„Początek o godzinie dziewiętnastej trzydzieści” – o osiemnastej otwierają park.',
      },
      {
        question: 'Liczba muzyków',
        accepted: [
          '65',
          '65 muzyków',
          'sześćdziesiąt pięć',
          'sześćdziesięciu pięciu',
          'sześćdziesięciu pięciu muzyków',
        ],
        explanation: '„Orkiestra, w której jest sześćdziesięciu pięciu muzyków.”',
      },
      {
        question: 'Cena biletu dla studenta',
        accepted: ['25', '25 zł', '25 złotych', 'dwadzieścia pięć', 'dwadzieścia pięć złotych'],
        explanation:
          '„Dla dzieci i studentów – dwadzieścia pięć złotych”; czterdzieści złotych to bilet normalny.',
      },
      {
        question: 'Rok pierwszego koncertu',
        accepted: [
          '2017',
          '2017 r.',
          '2017 roku',
          'w 2017 roku',
          'dwa tysiące siedemnasty',
          'dwa tysiące siedemnastym',
        ],
        explanation: '„Pierwszy był w dwa tysiące siedemnastym roku.”',
      },
    ]),
  },
]

const MOCK_JOBS = [
  'aktor',
  'fryzjer',
  'kucharz',
  'lekarz',
  'nauczyciel',
  'policjant',
  'programista',
]

const MOCK_PURPOSES = [
  'Ktoś prosi o telefon.',
  'Ktoś dziękuje za pomoc.',
  'Ktoś zaprasza na obiad.',
  'Ktoś informuje, że coś jest gotowe do odbioru.',
  'Ktoś przypomina o ważnym terminie.',
  'Ktoś odwołuje swoją obecność.',
]

/**
 * Original exam-only listening for mock Set 1, one per task. Not official tasks; hidden from
 * practice lists. Unlike the practice seeds they carry an `audio` map: `pnpm stack:seed-audio`
 * synthesises those WAVs with the Polish voices, so the bundled set plays without TTS.
 */
const mockListening: ListeningPlExercise[] = [
  {
    id: 'mock-pl-a2-set1-listening-zadanie1',
    title: 'Zadanie I: Kto mówi? Gdzie?',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-10-04',
    examOnly: true,
    items: items('mock-pl-a2-set1-listening-zadanie1', [
      {
        transcript:
          'Mężczyzna: Proszę usiąść na krześle. Jak krótko mam obciąć? Może trochę z boku?',
        question: WHO,
        options: ['fryzjer', 'lekarz', 'kelner'],
        correctAnswer: 0,
        explanation: 'Mężczyzna pyta, jak krótko obciąć włosy – to fryzjer.',
      },
      {
        transcript: 'Kobieta: Dzień dobry, mam dla pani paczkę. Proszę tu podpisać.',
        question: WHO,
        options: ['sprzedawczyni', 'listonoszka', 'nauczycielka'],
        correctAnswer: 1,
        explanation: 'Kobieta przynosi paczkę i prosi o podpis – to listonoszka.',
      },
      {
        transcript:
          'Mężczyzna: Proszę pokazać prawo jazdy i dowód rejestracyjny. Jechał pan za szybko.',
        question: WHO,
        options: ['mechanik', 'policjant', 'kierowca'],
        correctAnswer: 1,
        explanation:
          'Mężczyzna sprawdza dokumenty kierowcy, który jechał za szybko – to policjant.',
      },
      {
        transcript:
          'Kobieta: Ten pokój ma widok na morze. Śniadanie jest od siódmej do dziesiątej. Tu jest pana klucz.',
        question: WHO,
        options: ['sprzedawczyni', 'przewodniczka', 'recepcjonistka'],
        correctAnswer: 2,
        explanation:
          'Kobieta daje gościowi klucz do pokoju i mówi o śniadaniu – to recepcjonistka w hotelu.',
      },
      {
        transcript:
          'Kobieta: Poproszę bilet ulgowy na film o osiemnastej. Czy są jeszcze miejsca w środku sali?',
        question: WHERE,
        options: ['w kinie', 'w teatrze', 'na dworcu'],
        correctAnswer: 0,
        explanation: 'Kobieta kupuje bilet na film – jest w kinie.',
      },
      {
        transcript: 'Mężczyzna: Chciałbym otworzyć konto i zamówić kartę płatniczą.',
        question: WHERE,
        options: ['na poczcie', 'w banku', 'w urzędzie'],
        correctAnswer: 1,
        explanation: 'Konto i kartę płatniczą zakładamy w banku.',
      },
      {
        transcript: 'Kobieta: Dwa kilo ziemniaków, kilo marchewki i pęczek pietruszki, proszę.',
        question: WHERE,
        options: ['w piekarni', 'w aptece', 'na targu'],
        correctAnswer: 2,
        explanation: 'Kobieta kupuje warzywa – jest na targu.',
      },
      {
        transcript:
          'Mężczyzna: Proszę państwa, po prawej stronie widzimy Wawel. Za chwilę wejdziemy na dziedziniec zamku.',
        question: WHERE,
        options: ['na wycieczce', 'w szkole', 'w szpitalu'],
        correctAnswer: 0,
        explanation: 'Przewodnik pokazuje grupie zamek – to wycieczka.',
      },
      {
        transcript: 'Kobieta: Przepraszam, gdzie mogę odebrać bagaż z lotu z Londynu?',
        question: WHERE,
        options: ['w hotelu', 'na lotnisku', 'na dworcu kolejowym'],
        correctAnswer: 1,
        explanation: 'Bagaż z lotu odbieramy na lotnisku.',
      },
      {
        transcript: 'Mężczyzna: Poproszę dwie kawy z mlekiem i dwa kawałki szarlotki na wynos.',
        question: WHERE,
        options: ['w kiosku', 'w kinie', 'w kawiarni'],
        correctAnswer: 2,
        explanation: 'Mężczyzna zamawia kawę i ciasto – jest w kawiarni.',
      },
    ]),
  },
  {
    id: 'mock-pl-a2-set1-listening-zadanie2',
    title: 'Zadanie II: Zmiany w komunikacji',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-10-04',
    examOnly: true,
    context: 'Usłyszysz komunikat w radiu o zmianach w komunikacji miejskiej w Poznaniu.',
    transcript:
      'Spiker: Uwaga, pasażerowie! Od poniedziałku dwunastego października zmienia się rozkład jazdy tramwajów w centrum Poznania. Z powodu remontu ulicy Głogowskiej tramwaje linii pięć i osiem przez trzy tygodnie będą jeździły objazdem przez ulicę Hetmańską. W tym czasie na ulicę Głogowską dojedzie autobus zastępczy, który będzie kursował co dziesięć minut. Bilety na tramwaje są ważne także w autobusach zastępczych. W weekendy tramwaje będą jeździły rzadziej, co dwadzieścia minut. Szczegółowy rozkład jazdy można znaleźć na stronie internetowej miasta i na przystankach. Przepraszamy za utrudnienia.',
    questions: rows('mock-pl-a2-set1-listening-zadanie2', [
      {
        question: 'Zmiany zaczynają się w poniedziałek.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: '„Od poniedziałku dwunastego października zmienia się rozkład jazdy.”',
      },
      {
        question: 'Remont ulicy potrwa trzy miesiące.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: 'Tramwaje będą jeździły objazdem „przez trzy tygodnie”.',
      },
      {
        question: 'Autobus zastępczy jeździ co dziesięć minut.',
        options: TRUE_FALSE,
        correctAnswer: 0,
        explanation: '„Autobus zastępczy, który będzie kursował co dziesięć minut.”',
      },
      {
        question: 'Na autobus zastępczy trzeba kupić osobny bilet.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: '„Bilety na tramwaje są ważne także w autobusach zastępczych.”',
      },
      {
        question: 'W weekendy tramwaje jeżdżą częściej.',
        options: TRUE_FALSE,
        correctAnswer: 1,
        explanation: '„W weekendy tramwaje będą jeździły rzadziej, co dwadzieścia minut.”',
      },
    ]),
  },
  {
    id: 'mock-pl-a2-set1-listening-zadanie3',
    title: 'Zadanie III: Spotkanie klasowe',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-10-04',
    examOnly: true,
    context: 'Usłyszysz rozmowę Ewy i Marka o tym, gdzie pracują dziś ich koledzy ze szkoły.',
    transcript: [
      'Marek: Ewa, widziałaś zdjęcia ze spotkania naszej klasy? Wszyscy tak się zmienili!',
      'Ewa: Tak! Wiesz, że Kuba jest teraz kucharzem? Ma własną restaurację w Gdyni.',
      'Marek: Naprawdę? W szkole chciał być aktorem. A co robi Ola?',
      'Ewa: Ola skończyła medycynę i pracuje jako lekarz w szpitalu dziecięcym.',
      'Marek: Super. A Tomek? Pamiętam, że zawsze siedział przy komputerze.',
      'Ewa: No właśnie, jest programistą w dużej firmie w Krakowie.',
      'Marek: A pani Kowalczyk, nasza wychowawczyni? Dalej uczy?',
      'Ewa: Nie, już nie pracuje w szkole. Otworzyła z córką salon fryzjerski!',
      'Marek: Niesamowite. A Bartek? Mówił, że będzie policjantem jak jego tata.',
      'Ewa: Zmienił zdanie. Uczy matematyki w naszej starej szkole!',
      'Marek: To zabawne. Muszę do niego zadzwonić.',
    ].join('\n'),
    options: MOCK_JOBS,
    questions: rows('mock-pl-a2-set1-listening-zadanie3', [
      {
        person: 'Kuba',
        correctAnswer: 2,
        explanation: '„Kuba jest teraz kucharzem” – aktorem chciał być tylko w szkole.',
      },
      {
        person: 'Ola',
        correctAnswer: 3,
        explanation: '„Ola … pracuje jako lekarz w szpitalu dziecięcym.”',
      },
      {
        person: 'Tomek',
        correctAnswer: 6,
        explanation: '„Jest programistą w dużej firmie w Krakowie.”',
      },
      {
        person: 'pani Kowalczyk',
        correctAnswer: 1,
        explanation: '„Otworzyła z córką salon fryzjerski.”',
      },
      {
        person: 'Bartek',
        correctAnswer: 4,
        explanation: '„Zmienił zdanie. Uczy matematyki” – policjantem nie został.',
      },
    ]),
  },
  {
    id: 'mock-pl-a2-set1-listening-zadanie4',
    title: 'Zadanie IV: Wiadomości na sekretarce',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-10-04',
    examOnly: true,
    context: 'Usłyszysz pięć wiadomości nagranych na sekretarce.',
    transcript: [
      'Ania: Cześć Kasiu, tu Ania. Dziękuję ci bardzo za pomoc przy przeprowadzce! Bez ciebie nie dałabym rady. Jesteś super!',
      'Pan Lis: Dzień dobry, mówi Robert Lis z warsztatu samochodowego. Pana samochód jest już gotowy. Może go pan odebrać dzisiaj do osiemnastej.',
      'Magda: Hej, tu Magda. Niestety jestem chora i nie przyjdę jutro na lekcję angielskiego. Przepraszam!',
      'Pani Wójcik: Dzień dobry, tu Wójcik ze szkoły językowej. Proszę oddzwonić pod numer dwadzieścia dwa, trzysta trzydzieści cztery, pięćdziesiąt pięć, sześćdziesiąt sześć. Mamy pytanie w sprawie pani kursu.',
      'Kuba: Cześć, tu Kuba. Pamiętaj, że jutro o dziewiątej mamy egzamin z historii. Weź ze sobą dowód osobisty!',
    ].join('\n'),
    options: MOCK_PURPOSES,
    questions: rows('mock-pl-a2-set1-listening-zadanie4', [
      {
        person: 'Wiadomość 1',
        correctAnswer: 1,
        explanation: 'Ania dziękuje za pomoc przy przeprowadzce.',
      },
      {
        person: 'Wiadomość 2',
        correctAnswer: 3,
        explanation: 'Samochód jest gotowy i można go odebrać.',
      },
      {
        person: 'Wiadomość 3',
        correctAnswer: 5,
        explanation: 'Magda jest chora i nie przyjdzie na lekcję.',
      },
      {
        person: 'Wiadomość 4',
        correctAnswer: 0,
        explanation: 'Pani ze szkoły językowej prosi o telefon.',
      },
      {
        person: 'Wiadomość 5',
        correctAnswer: 4,
        explanation: 'Kuba przypomina o jutrzejszym egzaminie.',
      },
    ]),
  },
  {
    id: 'mock-pl-a2-set1-listening-zadanie5',
    title: 'Zadanie V: Wycieczka do Zakopanego',
    testingPart: 5,
    difficulty: 'A2',
    createdAt: '2026-10-04',
    examOnly: true,
    context: 'Usłyszysz informację o wycieczce autokarowej.',
    transcript:
      'Spiker: Zapraszamy na wycieczkę autokarową do Zakopanego! Wyjeżdżamy w sobotę czternastego listopada o szóstej czterdzieści pięć spod Dworca Głównego. Wycieczka kosztuje sto dwadzieścia złotych za osobę, a dzieci do lat dziesięciu płacą połowę. W autokarze są pięćdziesiąt dwa miejsca, więc warto zapisać się szybko. W Zakopanem zwiedzimy między innymi Muzeum Tatrzańskie, założone w tysiąc osiemset osiemdziesiątym ósmym roku. Powrót planujemy około dwudziestej drugiej. Zapisy przyjmujemy pod numerem telefonu biura podróży. Do zobaczenia!',
    content: [
      'Wycieczka do Zakopanego',
      '',
      'Data wyjazdu: (1) ____',
      'Godzina wyjazdu: (2) ____',
      'Cena dla dorosłego: (3) ____ zł',
      'Liczba miejsc w autokarze: (4) ____',
      'Rok założenia muzeum: (5) ____',
    ].join('\n'),
    questions: rows('mock-pl-a2-set1-listening-zadanie5', [
      {
        question: 'Data wyjazdu',
        accepted: [
          '14 listopada',
          'czternastego listopada',
          '14.11',
          '14 XI',
          'sobota, 14 listopada',
          'w sobotę 14 listopada',
        ],
        explanation: '„Wyjeżdżamy w sobotę czternastego listopada.”',
      },
      {
        question: 'Godzina wyjazdu',
        accepted: [
          '6:45',
          '6.45',
          '6 45',
          '06:45',
          'szósta czterdzieści pięć',
          'szóstej czterdzieści pięć',
        ],
        explanation:
          '„O szóstej czterdzieści pięć spod Dworca Głównego”; powrót jest około dwudziestej drugiej.',
      },
      {
        question: 'Cena dla dorosłego',
        accepted: ['120', '120 zł', '120 złotych', 'sto dwadzieścia', 'sto dwadzieścia złotych'],
        explanation: '„Sto dwadzieścia złotych za osobę”; dzieci płacą połowę.',
      },
      {
        question: 'Liczba miejsc w autokarze',
        accepted: ['52', '52 miejsca', 'pięćdziesiąt dwa', 'pięćdziesiąt dwa miejsca'],
        explanation: '„W autokarze są pięćdziesiąt dwa miejsca.”',
      },
      {
        question: 'Rok założenia muzeum',
        accepted: [
          '1888',
          '1888 r.',
          '1888 roku',
          'w 1888 roku',
          'tysiąc osiemset osiemdziesiąty ósmy',
          'tysiąc osiemset osiemdziesiątym ósmym',
        ],
        explanation: '„Muzeum Tatrzańskie, założone w tysiąc osiemset osiemdziesiątym ósmym roku.”',
      },
    ]),
  },
]

export const mockListeningPlSeeds: ListeningPlExercise[] = mockListening.map(withSeedAudio)
