import { buildSeedListeningAudioMap } from '../listening-audio'
// Original exam-only recordings. Item transcripts are played individually in tasks I and II.
type Item = [string, string, string[], number, string]
type Question = [string, string[], number, string]
function itemTask(part: number, title: string, rows: Item[]) {
  const id = `mock-certpol-pl-b1-set1-listening-part${part}`
  const items = rows.map((row, index) => ({
    id: `${id}-q${index + 1}`,
    context: title,
    transcript: row[0],
    question: row[1],
    options: row[2],
    correctAnswer: row[3],
    explanation: row[4],
  }))
  return {
    id,
    title,
    content: 'Proszę wysłuchać nagrań i wybrać poprawne odpowiedzi.',
    items,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    audio: buildSeedListeningAudioMap({ id, items }),
  }
}
function sharedTask(
  part: number,
  title: string,
  content: string,
  transcript: string,
  rows: Question[]
) {
  const id = `mock-certpol-pl-b1-set1-listening-part${part}`
  return {
    id,
    title,
    content,
    transcript,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    audio: buildSeedListeningAudioMap({ id }),
    questions: rows.map((row, index) => ({
      id: `${id}-q${index + 1}`,
      question: row[0],
      options: row[1],
      correctAnswer: row[2],
      explanation: row[3],
    })),
  }
}
const people = ['Osoba 1', 'Osoba 2', 'Osoba 3', 'Osoba 4']
const trips = [
  'A · rezerwacja przez internet',
  'B · wyjazd z noclegiem',
  'C · własne jedzenie',
  'D · udział bez wcześniejszych zapisów',
  'E · wypożyczenie sprzętu w cenie',
  'F · oferta tylko dla dorosłych',
]
export const mockListeningSeeds: Record<string, unknown>[] = [
  itemTask(1, 'Słuchanie I · Codzienne komunikaty', [
    [
      'Przepraszam, ten stolik jest zarezerwowany od siedemnastej. Do tego czasu może pani spokojnie przy nim usiąść.',
      'Gość może korzystać ze stolika…',
      ['do siedemnastej', 'dopiero po siedemnastej', 'przez całą noc'],
      0,
      'Rezerwacja zaczyna się o siedemnastej.',
    ],
    [
      'Nie znalazłem pańskiego szalika w autobusie. Kierowca z porannej zmiany jeszcze sprawdzi drugi pojazd i zadzwoni do pana.',
      'Rozmówca…',
      ['znalazł szalik', 'obiecuje dalsze poszukiwania', 'odmawia pomocy'],
      1,
      'Szalik nie został znaleziony, poszukiwania trwają.',
    ],
    [
      'W tym tygodniu zajęcia kończą się pół godziny wcześniej. Nauczyciel musi przygotować salę na zebranie.',
      'Uczniowie…',
      ['rozpoczną później', 'nie mają zajęć', 'wyjdą wcześniej'],
      2,
      'Zmienia się godzina zakończenia, nie rozpoczęcia.',
    ],
    [
      'Czy mogłabyś odebrać moje zamówienie? Nie zdążę przed zamknięciem, a sklep nie przechowuje paczek dłużej niż tydzień.',
      'Ta osoba…',
      ['prosi o przysługę', 'składa nowe zamówienie', 'chce zwrócić zakup'],
      0,
      'Prosi o odebranie paczki w jej imieniu.',
    ],
    [
      'Nigdy wcześniej nie prowadziłam zebrania. Trochę się stresuję, ale przygotowałam plan i chcę spróbować.',
      'Kobieta…',
      ['rezygnuje z zebrania', 'podejmuje nowe zadanie mimo obaw', 'jest bardzo doświadczona'],
      1,
      'Stres nie przeszkadza jej podjąć zadania.',
    ],
    [
      'Uwaga, peron drugi jest czasowo zamknięty. Pociąg do Gdyni odjedzie z peronu czwartego o planowanej godzinie.',
      'Podróżni powinni…',
      ['poczekać na późniejszy pociąg', 'zmienić cel podróży', 'przejść na inny peron'],
      2,
      'Zmieniono peron, a nie godzinę odjazdu.',
    ],
    [
      'Jeżeli kupi pani oba zeszyty, drugi będzie kosztował połowę ceny. Rabat naliczamy przy kasie.',
      'Sprzedawca przedstawia…',
      ['promocję', 'reklamację', 'zakaz'],
      0,
      'Drugi zeszyt jest tańszy przy zakupie dwóch.',
    ],
    [
      'Ten przepis wychodzi mi zawsze, ale dziś nie mam cytryny. Spróbuję zastąpić ją pomarańczą.',
      'Osoba zamierza…',
      ['zrezygnować z gotowania', 'użyć innego składnika', 'kupić gotowe danie'],
      1,
      'Pomarańcza zastąpi cytrynę.',
    ],
    [
      'Nie otwieraj teraz okna. Na ulicy malują pasy i zapach farby jest naprawdę mocny.',
      'Mówiący chce…',
      ['przewietrzyć pokój', 'wyjść na ulicę', 'uniknąć nieprzyjemnego zapachu'],
      2,
      'Prosi o pozostawienie zamkniętego okna z powodu farby.',
    ],
    [
      'To miłe, że pamiętaliście o moich urodzinach. Nie spodziewałem się tylu wiadomości!',
      'Mężczyzna wyraża…',
      ['wdzięczność i zaskoczenie', 'niezadowolenie', 'wątpliwość co do daty'],
      0,
      'Cieszy się z wiadomości, których się nie spodziewał.',
    ],
    [
      'Chciałbym przesunąć wizytę na przyszły tydzień. Dziś nie mogę wyjść wcześniej z pracy.',
      'Mężczyzna prosi o…',
      ['zwolnienie z pracy', 'zmianę terminu wizyty', 'przyjęcie bez kolejki'],
      1,
      'Chce przyjść w przyszłym tygodniu.',
    ],
    [
      'Pamiętajcie, żeby podpisać pudełka. Inaczej po przeprowadzce długo będziemy szukać talerzy.',
      'Osoba radzi…',
      ['kupić nowe talerze', 'zostawić pudełka otwarte', 'opisać zawartość pudełek'],
      2,
      'Podpisy ułatwią znalezienie przedmiotów.',
    ],
  ]),
  itemTask(2, 'Słuchanie II · Ustalenia i decyzje', [
    [
      'Pani: Wyruszymy o ósmej? Pan: Kierowca może przyjechać dopiero o dziewiątej. Pani: Dobrze, ale bądźmy na miejscu kwadrans przed nim. Pan: Zgoda.',
      'Kiedy spotkają się rozmówcy?',
      ['o ósmej', 'o ósmej czterdzieści pięć', 'o dziewiątej piętnaście'],
      1,
      'Spotkanie jest kwadrans przed dziewiątą.',
    ],
    [
      'Pan: Zapiszesz się na kurs online? Pani: Wolałabym zajęcia w sali, ale dojazd zajmuje godzinę. Wybiorę internet, żeby mieć więcej czasu dla dzieci.',
      'Kobieta wybiera kurs online ze względu na…',
      ['oszczędność czasu', 'niższą cenę', 'brak sali'],
      0,
      'Unika długiego dojazdu, aby spędzać czas z dziećmi.',
    ],
    [
      'Pani: Zamówimy deser? Pan: Nie mam już ochoty na jedzenie. Weźmy tylko herbatę. Pani: Dla mnie z cytryną, proszę.',
      'Co zamówią?',
      ['deser i herbatę', 'sam deser', 'tylko herbatę'],
      2,
      'Rezygnują z deseru.',
    ],
    [
      'Pan: Dlaczego nie oddałaś kurtki? Pani: Zamek był zepsuty, ale krawcowa naprawiła go za dziesięć złotych. Teraz mogę ją nosić.',
      'Kobieta…',
      ['kupiła inną kurtkę', 'naprawiła kurtkę', 'czeka na zwrot pieniędzy'],
      1,
      'Krawcowa naprawiła zamek.',
    ],
    [
      'Pani: Znalazłeś mieszkanie blisko centrum? Pan: Tak, lecz było głośne. Wybrałem mniejsze na spokojnej ulicy. Do pracy dojadę tramwajem.',
      'Co było najważniejsze przy wyborze?',
      ['spokojna okolica', 'duży metraż', 'brak dojazdu'],
      0,
      'Odrzucił hałaśliwe mieszkanie i wybrał spokojną ulicę.',
    ],
    [
      'Pan: Wystawa była ciekawa? Pani: Eksponaty świetne, ale opisy za małe. Dobrze, że przewodniczka wszystko wyjaśniła.',
      'Kobieta krytykuje…',
      ['przewodniczkę', 'eksponaty', 'czytelność opisów'],
      2,
      'Opisy były zbyt małe, a przewodniczka pomogła.',
    ],
    [
      'Pani: Mogę zapłacić kartą? Pan: Terminal nie działa. Może pani zrobić przelew albo wrócić z gotówką. Pani: Zapłacę przelewem teraz.',
      'Jak zapłaci kobieta?',
      ['kartą', 'przelewem', 'gotówką'],
      1,
      'Wybiera przelew.',
    ],
  ]),
  sharedTask(
    3,
    'Słuchanie III · Klub gier',
    'Proszę wysłuchać rozmowy o klubie gier i ocenić pięć zdań.',
    `Pani: Jak powstał pana klub gier planszowych?\nPan: Po zmianie pracy wracałem wcześniej do domu, ale brakowało mi kontaktu z ludźmi. Zacząłem spotykać się z dwoma sąsiadami. Graliśmy przy kuchennym stole. Potem znajomi zapraszali kolejne osoby i mieszkanie stało się za małe.\nPani: Czy wynajęliście własny lokal?\nPan: Nie. Dyrektorka domu kultury udostępniła nam salę w czwartki. Korzystamy z niej bez opłat, pod warunkiem że sami sprzątamy po spotkaniu. Początkowo chcieliśmy spotykać się w piątki, ale sala była wtedy zajęta przez chór.\nPani: Kto może dołączyć?\nPan: Każdy, również osoba bez doświadczenia. Na początku wyjaśniamy zasady i wybieramy krótsze gry. Nie trzeba przynosić własnego zestawu, bo mamy już ponad trzydzieści gier. Kilka kupiliśmy, resztę podarowali mieszkańcy. Nie gramy o pieniądze.\nPani: Co z uczestnikami, którzy nie znają dobrze polskiego?\nPan: Zapraszamy ich chętnie. Mamy też gry bez długich tekstów. Jedna studentka uczy się u nas nowych słów i pomaga później tłumaczyć zasady innym.\nPani: Jakie są plany?\nPan: Chcemy zorganizować otwarte popołudnie dla rodzin. Nie będzie to turniej, tylko okazja do poznania różnych gier. Data nie jest jeszcze ustalona, ponieważ czekamy na odpowiedź domu kultury.`,
    [
      [
        'Pierwsze spotkania odbywały się w mieszkaniu organizatora.',
        ['Tak', 'Nie'],
        0,
        'Grupa grała przy jego kuchennym stole.',
      ],
      [
        'Klub płaci za korzystanie z sali.',
        ['Tak', 'Nie'],
        1,
        'Sala jest bezpłatna, grupa musi sprzątać.',
      ],
      [
        'Spotkania są organizowane w czwartki.',
        ['Tak', 'Nie'],
        0,
        'W piątki sala jest zajęta przez chór.',
      ],
      [
        'Nowy uczestnik musi przynieść własną grę.',
        ['Tak', 'Nie'],
        1,
        'Klub ma ponad trzydzieści gier.',
      ],
      [
        'Termin popołudnia dla rodzin jest już ustalony.',
        ['Tak', 'Nie'],
        1,
        'Organizator czeka na odpowiedź domu kultury.',
      ],
    ]
  ),
  sharedTask(
    4,
    'Słuchanie IV · Praca zdalna',
    'Proszę dopasować siedem opinii do czterech osób. Osobę można wybrać kilka razy.',
    `Pan: Osoba pierwsza. Pracuję w domu trzy dni w tygodniu. Najbardziej cieszę się z tego, że nie muszę stać w korkach. Dzięki temu rano mam czas na spokojne śniadanie. Trudniej mi jednak skończyć o ustalonej godzinie. Gdy komputer jest obok, często sprawdzam wiadomości jeszcze po kolacji.\nPani: Osoba druga. W domu nie mam oddzielnego pokoju. Rozmowy rodziny przeszkadzają mi, zwłaszcza podczas spotkań. Dlatego dwa razy w tygodniu korzystam z sali do pracy w centrum. Płacę za miejsce, ale mogę się tam skupić i spotykam innych ludzi.\nPan: Osoba trzecia. Praca zdalna pozwoliła mi przeprowadzić się bliżej rodziców. Nie muszę już mieszkać w dużym mieście. Niestety nasze łącze bywa słabe i czasem rozmowa się urywa. Przy ważnych spotkaniach jadę do biura w pobliskiej miejscowości.\nPani: Osoba czwarta. Początkowo miałam problemy z planowaniem. Teraz zapisuję zadania na następny dzień i robię krótkie przerwy. Tęsknię jednak za zwykłymi rozmowami z kolegami w kuchni. Raz w miesiącu cały zespół spotyka się osobiście i to bardzo poprawia naszą współpracę.`,
    [
      ['Ceni brak codziennych dojazdów.', people, 0, 'Osoba pierwsza nie stoi w korkach.'],
      [
        'Ma kłopot z zakończeniem pracy na czas.',
        people,
        0,
        'Osoba pierwsza czyta wiadomości po kolacji.',
      ],
      [
        'W domu przeszkadzają jej rozmowy innych.',
        people,
        1,
        'Osoba druga nie ma oddzielnego pokoju.',
      ],
      ['Płaci za miejsce poza mieszkaniem.', people, 1, 'Osoba druga korzysta z płatnej sali.'],
      [
        'Dzięki pracy zdalnej mieszka bliżej rodziny.',
        people,
        2,
        'Osoba trzecia przeprowadziła się blisko rodziców.',
      ],
      [
        'Narzeka na jakość połączenia internetowego.',
        people,
        2,
        'Osoba trzecia opisuje urywające się rozmowy.',
      ],
      [
        'Brakuje jej nieformalnych rozmów z zespołem.',
        people,
        3,
        'Osoba czwarta tęskni za rozmowami w kuchni.',
      ],
    ]
  ),
  sharedTask(
    5,
    'Słuchanie V · Wycieczki weekendowe',
    'Proszę dopasować cechy do pięciu propozycji. Jedna cecha jest zbędna.',
    `Przedstawiamy pięć propozycji na weekend. Pierwsza to spacer po starym mieście. Nie prowadzimy zapisów: wystarczy przyjść pod ratusz o dziesiątej. Mogą dołączyć całe rodziny. Druga propozycja to spływ kajakowy. W opłacie są kajak, kamizelka i transport na miejsce startu. Przed wypłynięciem instruktor wyjaśnia zasady bezpieczeństwa. Trzecia to wyprawa do obserwatorium. Liczba miejsc jest ograniczona, dlatego bilet trzeba wcześniej kupić na naszej stronie internetowej. Pracownicy pokażą teleskop i opowiedzą o nocnym niebie. Czwarta oferta to piesza wycieczka po lesie. Na trasie nie ma restauracji ani sklepów, więc każdy zabiera kanapki i napój. Odpoczniemy przy małym jeziorze. Piąta propozycja to zwiedzanie zamku i okolicznych wsi. Wracamy dopiero następnego dnia, a w cenie jest pokój w pensjonacie oraz śniadanie. Wszystkie wyjazdy są otwarte dla młodzieży i dorosłych.`,
    [
      ['Spacer po starym mieście', trips, 3, 'Można przyjść bez zapisów.'],
      ['Spływ kajakowy', trips, 4, 'Sprzęt jest uwzględniony w opłacie.'],
      ['Wyprawa do obserwatorium', trips, 0, 'Bilety trzeba kupić na stronie internetowej.'],
      ['Piesza wycieczka po lesie', trips, 2, 'Uczestnik musi zabrać kanapki i napój.'],
      ['Zwiedzanie zamku i wsi', trips, 1, 'Oferta obejmuje nocleg w pensjonacie.'],
    ]
  ),
]
