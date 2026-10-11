// Original exam-only Set 1. Reading I–V and Grammar I–VIII retain catalog parts 1–13.
type Choice = [string, string[], number, string]
type Gap = [string, string[], string]
function exercise(
  part: number,
  title: string,
  content: string,
  rows: Choice[] | Gap[],
  typed = false
) {
  const id = `mock-certpol-pl-b1-set1-reading-part${part}`
  return {
    id,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    title,
    content,
    textType: 'article',
    wordCount: content.split(/\s+/).length,
    estimatedReadingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 150)),
    topics: ['życie codzienne'],
    questions: rows.map((row, index) => ({
      id: `${id}-q${index + 1}`,
      textId: id,
      question: row[0],
      ...(typed
        ? { type: 'gap-fill', accepted: row[1], explanation: row[2] }
        : { type: 'selection', options: row[1], correctAnswer: row[2], explanation: row[3] }),
    })),
  }
}
const fragments = [
  'Dlatego zaproponowała, żeby każdy przyniósł jedną niepotrzebną rzecz.',
  'Najpierw trzeba było sprawdzić, czy oddawane przedmioty nadal działają.',
  'Wtedy właścicielka zapisała na kartce, jak należy go obsługiwać.',
  'Dzięki temu osoby nieobecne rano mogły również skorzystać z wymiany.',
  'Jednak zabrakło miejsca na bardzo duże meble.',
  'Zamiast je wyrzucać, przekazano je miejscowej świetlicy.',
  'Po tym doświadczeniu sąsiedzi postanowili spotykać się raz na kwartał.',
  'Ostatecznie wszyscy musieli zapłacić za nowe przedmioty.',
]
const news = [
  'Do domu kultury można teraz dojechać dodatkowym kursem autobusu o godzinie dwudziestej drugiej. Kursuje on w piątki po zakończeniu zajęć.',
  'Pracownicy poradni pomogą bez opłat wypełnić wniosek o stypendium. Pomoc odbywa się w środy, ale trzeba wcześniej umówić godzinę.',
  'Zespół teatralny zaprasza osoby, które chcą pomagać przy kostiumach i scenografii. Nie trzeba występować na scenie ani mieć doświadczenia.',
  'W parku ustawiono sześć stołów do gry w szachy. Figury można wypożyczyć u pracownika kawiarni po okazaniu dokumentu.',
  'Centrum sąsiedzkie otwiera salę dla osób pracujących zdalnie. Miejsca rezerwuje się na maksymalnie trzy godziny, internet jest bezpłatny.',
  'W sobotę specjaliści sprawdzą stan rowerów przed sezonem. Właściciel płaci tylko za nowe części, sama kontrola jest darmowa.',
  'Szkoła zbiera stare mapy i zdjęcia okolicy. Materiały zostaną zeskanowane i zwrócone właścicielom, a kopie trafią do wystawy.',
  'Sklep sportowy obniża ceny nowych rowerów dla klientów zapisanych do programu lojalnościowego.',
]
export const mockReadingSeeds: Record<string, unknown>[] = [
  exercise(
    1,
    'Czytanie I · Informacje w mieście',
    `1. Wejście do poradni od ulicy Lipowej jest zamknięte podczas remontu. Pacjenci korzystają z drzwi od podwórza. Godziny przyjęć pozostają bez zmian.\n\n2. Bilety na koncert są imienne. Można je przekazać innej osobie, ale zmianę nazwiska należy zgłosić najpóźniej dzień przed wydarzeniem. Przy wejściu potrzebny jest dokument.\n\n3. W sobotę sklep przyjmuje używane plecaki w dobrym stanie. Darczyńcy dostaną kupon na następne zakupy. Plecaki zostaną przekazane uczniom, a nie wystawione na sprzedaż.\n\n4. Zajęcia ceramiczne przenosimy na wtorek. Osoby, którym nowy termin nie odpowiada, mogą wybrać inne zajęcia w tej samej cenie albo otrzymać zwrot wpłaty.\n\n5. Prosimy nie zostawiać paczek na klatce schodowej. Kurier powinien zadzwonić do odbiorcy. Jeśli odbiorca jest nieobecny, przesyłkę przyjmuje portier do godziny osiemnastej.`,
    [
      [
        'Pacjenci muszą…',
        ['przyjść później', 'skorzystać z innego wejścia', 'zmienić poradnię'],
        1,
        'Przyjęcia odbywają się jak wcześniej, lecz wejście jest od podwórza.',
      ],
      [
        'Przekazując bilet, trzeba…',
        [
          'poinformować organizatora przed koncertem',
          'dopłacić przy wejściu',
          'oddać dokument nowemu właścicielowi',
        ],
        0,
        'Zmianę nazwiska należy zgłosić dzień wcześniej.',
      ],
      [
        'Sklep organizuje…',
        ['wyprzedaż plecaków', 'naprawę plecaków', 'zbiórkę dla uczniów'],
        2,
        'Plecaki trafią do uczniów.',
      ],
      [
        'Uczestnik, który nie może przyjść we wtorek, ma prawo…',
        ['tylko stracić wpłatę', 'wybrać inne zajęcia lub zwrot', 'żądać zajęć w sobotę'],
        1,
        'Ogłoszenie podaje dwie możliwości.',
      ],
      [
        'Gdy odbiorcy nie ma w domu, paczkę można…',
        ['zostawić pod drzwiami', 'położyć na schodach', 'przekazać portierowi przed osiemnastą'],
        2,
        'Portier przyjmuje przesyłki do godziny osiemnastej.',
      ],
    ]
  ),
  exercise(
    2,
    'Czytanie II · Archiwum dźwięków',
    `Kiedy Tomasz przeprowadził się do Rzeszowa, zauważył, że na starych fotografiach nie da się usłyszeć życia miasta. Zaproponował więc mieszkańcom wspólne archiwum dźwięków. Nie chodziło o profesjonalne nagrania muzyczne, lecz o zwyczajne odgłosy: rozmowy na targu, dzwonek starego tramwaju czy pracę piekarni. Projekt rozpoczął się w marcu w domu kultury.\nNa pierwsze spotkanie przyszło osiem osób. Niektórzy przynieśli drogie mikrofony, ale organizator wyjaśnił, że wystarczy telefon. Najważniejsze było opisanie miejsca i daty nagrania. Głosy ludzi można publikować wyłącznie po uzyskaniu ich zgody. Materiały bez zgody pozostają w prywatnym archiwum właściciela.\nPo dwóch miesiącach grupa miała ponad sto plików. Część z nich nagrali uczniowie, którzy pytali dziadków o dawne zawody. Tomasz szczególnie cenił nagranie warsztatu szewskiego. Szewc opowiedział o narzędziach i pozwolił nagrać swoją pracę. Nie chciał natomiast pokazywać twarzy na zdjęciach.\nW czerwcu otwarto wystawę. Zamiast głośników w sali były słuchawki, żeby zwiedzający mogli wybierać interesujące ich historie i nie przeszkadzać innym. Wstęp był bezpłatny. Osoby, które nie mogły przyjść, znalazły część nagrań na stronie domu kultury. Nie umieszczono tam wszystkich materiałów, bo nie każdy autor zgodził się na publikację w internecie.\nJesienią planowany jest spacer z przewodnikiem po miejscach związanych z nagraniami. Zespół nie zamierza kończyć zbierania plików. Miasto ciągle się zmienia i warto dokumentować także dzisiejsze życie.`,
    [
      [
        'Projekt służy zachowaniu codziennych odgłosów miasta.',
        ['Tak', 'Nie'],
        0,
        'Chodzi o zwyczajne dźwięki, na przykład targ i piekarnię.',
      ],
      [
        'Uczestnicy muszą korzystać z profesjonalnego mikrofonu.',
        ['Tak', 'Nie'],
        1,
        'Organizator mówi, że wystarczy telefon.',
      ],
      [
        'Każde nagranie ludzkiego głosu można opublikować bez pytania.',
        ['Tak', 'Nie'],
        1,
        'Potrzebna jest zgoda nagranej osoby.',
      ],
      [
        'W zbieraniu materiałów pomagali uczniowie.',
        ['Tak', 'Nie'],
        0,
        'Uczniowie rozmawiali z dziadkami o zawodach.',
      ],
      [
        'Szewc zgodził się na zdjęcia swojej twarzy.',
        ['Tak', 'Nie'],
        1,
        'Zgodził się na dźwięk, ale nie zdjęcia twarzy.',
      ],
      [
        'Zwiedzający sami wybierali nagrania do słuchania.',
        ['Tak', 'Nie'],
        0,
        'Słuchawki pozwalały wybierać interesujące historie.',
      ],
      [
        'Po wystawie zespół przestanie zbierać nowe materiały.',
        ['Tak', 'Nie'],
        1,
        'Zespół chce nadal dokumentować zmiany miasta.',
      ],
    ]
  ),
  exercise(
    3,
    'Czytanie III · Wymiana zamiast zakupów',
    `Proszę uzupełnić tekst fragmentami. Jeden fragment jest zbędny.\n\nPo porządkach w mieszkaniu Ewa odkryła, że wiele przedmiotów jest sprawnych, ale już ich nie używa. Jej sąsiedzi mieli podobny problem. (1) ___. Pomysł wspólnej wymiany spodobał się mieszkańcom, więc zarezerwowali salę w klubie.\nNie chcieli, żeby spotkanie zamieniło się w zbiórkę zepsutych rzeczy. (2) ___. Wolontariusze przygotowali gniazdka i baterie do testowania sprzętu. Pewien ekspres do kawy miał kilka nietypowych przycisków. (3) ___. Nowy użytkownik mógł zabrać instrukcję razem z urządzeniem.\nPoczątkowo wymiana miała trwać tylko do południa. Ponieważ część sąsiadów pracowała w sobotę, organizatorzy przedłużyli spotkanie do wieczora. (4) ___. W sali znalazły się książki, lampy, ubrania i dziecięce gry. (5) ___. Osoby z szafami i kanapami zostawiły więc zdjęcia oraz numery telefonu.\nPo zakończeniu zostało kilka gier i książek, których nikt nie zabrał. (6) ___. Jej kierowniczka obiecała, że dzieci będą z nich korzystać podczas zajęć. Uczestnicy byli zadowoleni: zdobyli potrzebne rzeczy bez wydawania pieniędzy i poznali sąsiadów. (7) ___. Następne spotkanie ma odbyć się przed zimą.`,
    fragments
      .slice(0, 7)
      .map(
        (fragment, i) =>
          [
            `Luka ${i + 1}`,
            fragments,
            i,
            `Fragment nawiązuje do poprzedniego zdania: ${fragment}`,
          ] as Choice
      )
  ),
  exercise(
    4,
    'Czytanie IV · Nagłówki wiadomości',
    `Proszę dopasować nagłówki do informacji A–H. Jedna informacja jest zbędna.\n\n${news.map((text, i) => `${String.fromCharCode(65 + i)}. ${text}`).join('\n\n')}`,
    [
      [
        'Powrót z wieczornych zajęć będzie łatwiejszy',
        news,
        0,
        'Nowy kurs autobusu odjeżdża po zakończeniu zajęć.',
      ],
      ['Wsparcie dla kandydatów do stypendium', news, 1, 'Poradnia pomaga wypełniać wnioski.'],
      [
        'Teatr potrzebuje pomocników za kulisami',
        news,
        2,
        'Wolontariusze pomagają z kostiumami i scenografią.',
      ],
      ['Nowe miejsce dla miłośników szachów', news, 3, 'W parku pojawiły się stoły do gry.'],
      ['Biuro na kilka godzin', news, 4, 'Sala służy osobom pracującym zdalnie.'],
      ['Bezpłatna kontrola roweru', news, 5, 'Płatne są jedynie potrzebne części.'],
      ['Pamiątki wrócą do właścicieli', news, 6, 'Szkoła zatrzyma kopie, a oryginały odda.'],
    ]
  ),
  exercise(
    5,
    'Czytanie V · Nocny spacer',
    `Organizatorzy chcieli pokazać mieszkańcom miasto z innej (1) ___. Zamiast zwykłej wycieczki przygotowali spacer po zmroku. Każdy uczestnik miał (2) ___ ze sobą latarkę. Przewodniczka zwracała (3) ___ na detale budynków, których za dnia nikt nie zauważał. Grupa zatrzymała się przy starym kinie, aby poznać jego (4) ___. Następnie uczestnicy musieli (5) ___ zagadkę związaną z nazwą ulicy. Mimo chłodu wszyscy byli w dobrym (6) ___. Na koniec prowadząca podziękowała za (7) ___ w spacerze. Wiele osób wyraziło (8) ___ ponownego spotkania.`,
    [
      [
        'Luka 1',
        ['strony', 'kolejki', 'ceny'],
        0,
        'Pokazać coś z innej strony oznacza nowy punkt widzenia.',
      ],
      ['Luka 2', ['zająć', 'zabrać', 'zdać'], 1, 'Zabrać ze sobą latarkę.'],
      ['Luka 3', ['zgodę', 'przerwę', 'uwagę'], 2, 'Zwracać uwagę na szczegóły.'],
      ['Luka 4', ['historię', 'drogę', 'pogodę'], 0, 'Poznać historię budynku.'],
      ['Luka 5', ['zamknąć', 'rozwiązać', 'zbudować'], 1, 'Rozwiązać zagadkę.'],
      ['Luka 6', ['terminie', 'rozmiarze', 'humorze'], 2, 'Być w dobrym humorze.'],
      ['Luka 7', ['udział', 'adres', 'wygląd'], 0, 'Podziękować za udział.'],
      ['Luka 8', ['koszt', 'chęć', 'zakaz'], 1, 'Wyrazić chęć spotkania.'],
    ]
  ),
  exercise(
    6,
    'Gramatyka I · Weekend u znajomych',
    `W piątek pojechałam do (1) ___, którzy mieszkają pod Toruniem. Ich dom stoi obok (2) ___. Przywitali mnie z (3) ___ i zaprosili do środka. W (4) ___ kuchni pachniało zupą. Pomogłam (5) ___ nakryć do stołu. Po kolacji rozmawialiśmy o (6) ___. Następnego dnia wybraliśmy się na spacer z (7) ___. Zrobiliśmy zdjęcie przy (8) ___. Potem kupiliśmy chleb od (9) ___. Wieczorem podziękowałam gospodarzom za (10) ___.`,
    [
      ['Luka 1', ['znajomi', 'znajomych', 'znajomymi'], 1, 'Do wymaga dopełniacza.'],
      ['Luka 2', ['dużym lesie', 'dużego lasu', 'duży las'], 1, 'Obok wymaga dopełniacza.'],
      ['Luka 3', ['radość', 'radości', 'radością'], 2, 'Z radością: narzędnik.'],
      ['Luka 4', ['jasnej', 'jasną', 'jasna'], 0, 'W kuchni: miejscownik.'],
      ['Luka 5', ['oni', 'ich', 'im'], 2, 'Pomóc komu: celownik.'],
      [
        'Luka 6',
        ['nowym projekcie', 'nowy projekt', 'nowego projektu'],
        0,
        'O projekcie: miejscownik.',
      ],
      [
        'Luka 7',
        ['nasza sąsiadka', 'naszej sąsiadki', 'naszą sąsiadką'],
        2,
        'Z sąsiadką: narzędnik.',
      ],
      ['Luka 8', ['stary most', 'starym moście', 'starego mostu'], 1, 'Przy moście: miejscownik.'],
      [
        'Luka 9',
        ['miejscowy piekarz', 'miejscowemu piekarzowi', 'miejscowego piekarza'],
        2,
        'Od wymaga dopełniacza.',
      ],
      ['Luka 10', ['gościnnością', 'gościnność', 'gościnności'], 1, 'Podziękować za co: biernik.'],
    ]
  ),
  exercise(
    7,
    'Gramatyka II · Przygotowanie kiermaszu',
    `Wyrazy: ponieważ, chociaż, zanim, żeby, więc, albo.\n\nPrzygotowujemy kiermasz, (1) ___ zebrać pieniądze na nowe książki. Marta drukuje plakaty, (2) ___ zna się na grafice. (3) ___ zaczniemy sprzedawać, ustawimy stoły. (4) ___ prognoza zapowiada deszcz, spotkanie odbędzie się pod dachem. Sala jest już zarezerwowana, (5) ___ możemy zaprosić mieszkańców.`,
    [
      ['Luka 1', ['żeby'], 'Cel zbiórki wprowadza żeby.'],
      ['Luka 2', ['ponieważ'], 'Ponieważ wprowadza przyczynę.'],
      ['Luka 3', ['zanim'], 'Ustawienie stołów poprzedza sprzedaż.'],
      ['Luka 4', ['chociaż'], 'Chociaż wprowadza przeciwstawienie.'],
      ['Luka 5', ['więc'], 'Więc wprowadza skutek.'],
    ],
    true
  ),
  exercise(
    8,
    'Gramatyka III · Porównanie mieszkań',
    `Nowe mieszkanie jest (1) ___ niż poprzednie. Z dwoma oknami kuchnia jest teraz (2) ___ od starej. Do pracy mam (3) ___ niż wcześniej, bo biuro jest na końcu ulicy. Spośród wszystkich pokoi salon jest (4) ___. Dzięki spokojnej okolicy śpię (5) ___ niż w centrum.`,
    [
      ['Luka 1', ['duże', 'większe', 'największe'], 1, 'Niż wskazuje stopień wyższy: większe.'],
      [
        'Luka 2',
        ['jaśniejsza', 'jasna', 'najjaśniejsza'],
        0,
        'Porównanie dwóch kuchni: jaśniejsza.',
      ],
      ['Luka 3', ['najbliżej', 'blisko', 'bliżej'], 2, 'Bliżej niż wcześniej.'],
      [
        'Luka 4',
        ['ciepły', 'najcieplejszy', 'cieplejszy'],
        1,
        'Spośród wszystkich: stopień najwyższy.',
      ],
      ['Luka 5', ['dobrze', 'najlepiej', 'lepiej'], 2, 'Lepiej niż w centrum.'],
    ]
  ),
  exercise(
    9,
    'Gramatyka IV · Plan tygodnia',
    `Proszę wpisać czasownik w podanej formie czasu, osoby i rodzaju.\n\nW każdy poniedziałek ja (1) ___ (pracować, teraźniejszy) w biurze, a moja siostra (2) ___ (uczyć się, teraźniejszy) w domu. My zwykle (3) ___ (jeść, teraźniejszy) razem kolację. Czy ty często (4) ___ (czytać, teraźniejszy) wieczorem? Moi rodzice (5) ___ (mieszkać, teraźniejszy) niedaleko. W najbliższą sobotę ja (6) ___ (odwiedzić, przyszły) dziadków. Potem my (7) ___ (obejrzeć, przyszły) nowy film. W niedzielę moja siostra (8) ___ (gotować, przyszły; ona) obiad. Ty (9) ___ (pomóc, przyszły) jej przygotować deser. Wieczorem wszyscy (10) ___ (wrócić, przyszły) do swoich mieszkań.`,
    [
      ['Luka 1', ['pracuję'], 'Pierwsza osoba liczby pojedynczej.'],
      ['Luka 2', ['uczy się'], 'Trzecia osoba liczby pojedynczej z się.'],
      ['Luka 3', ['jemy'], 'Pierwsza osoba liczby mnogiej.'],
      ['Luka 4', ['czytasz'], 'Druga osoba liczby pojedynczej.'],
      ['Luka 5', ['mieszkają'], 'Trzecia osoba liczby mnogiej.'],
      ['Luka 6', ['odwiedzę'], 'Odwiedzić ma prostą formę przyszłą.'],
      ['Luka 7', ['obejrzymy'], 'Przyszły czasownik dokonany, pierwsza osoba mnoga.'],
      ['Luka 8', ['będzie gotować', 'będzie gotowała'], 'Obie konstrukcje przyszłe są poprawne.'],
      ['Luka 9', ['pomożesz'], 'Pomóc: druga osoba czasu przyszłego.'],
      ['Luka 10', ['wrócą'], 'Trzecia osoba mnoga czasu przyszłego.'],
    ],
    true
  ),
  exercise(
    10,
    'Gramatyka V · Pytania o szczegół',
    `Proszę uzupełnić początek pytania o informację w nawiasie kwadratowym.\n\n1. Spotkamy się [przed dworcem]. (1) ___ się spotkamy?\n2. Bilet kosztuje [dwadzieścia złotych]. (2) ___ kosztuje bilet?\n3. Jedziemy [autobusem]. (3) ___ jedziemy?\n4. Ola rozmawia [z koleżanką]. (4) ___ rozmawia Ola?\n5. Zajęcia zaczynają się [o osiemnastej]. (5) ___ zaczynają się zajęcia?`,
    [
      ['Luka 1', ['gdzie', 'w którym miejscu'], 'Pytamy o miejsce spotkania.'],
      ['Luka 2', ['ile'], 'Pytamy o cenę.'],
      ['Luka 3', ['czym', 'jakim środkiem transportu'], 'Pytamy o środek transportu.'],
      ['Luka 4', ['z kim'], 'Pytamy o osobę, z którą rozmawia Ola.'],
      ['Luka 5', ['o której', 'o której godzinie'], 'Pytamy o konkretną godzinę.'],
    ],
    true
  ),
  exercise(
    11,
    'Gramatyka VI · Przekształcanie zdań',
    `Proszę wpisać całe zdanie o tym samym znaczeniu. Należy zachować podany początek i użyć słowa w nawiasie.\n\n1. Nie idę na spacer, bo pada deszcz. Zacznij: „Z powodu”, użyj: „deszczu”. (1) ___\n2. Ten plecak należy do Marty. Zacznij: „To”, użyj: „Marty”. (2) ___\n3. Tomek jest starszy od Adama. Zacznij: „Adam”, użyj: „młodszy”. (3) ___\n4. Proszę, otwórz okno. Zacznij: „Czy”, użyj: „możesz”. (4) ___\n5. Mam ochotę pójść do kina. Zacznij: „Chcę”, użyj: „kina”. (5) ___`,
    [
      [
        'Luka 1',
        ['Z powodu deszczu nie idę na spacer.', 'Z powodu deszczu nie idę na spacer'],
        'Z powodu deszczu wyraża przyczynę.',
      ],
      [
        'Luka 2',
        ['To plecak Marty.', 'To plecak Marty', 'To jest plecak Marty.', 'To jest plecak Marty'],
        'Dopełniacz Marty oznacza właściciela.',
      ],
      [
        'Luka 3',
        [
          'Adam jest młodszy od Tomka.',
          'Adam jest młodszy od Tomka',
          'Adam jest młodszy niż Tomek.',
          'Adam jest młodszy niż Tomek',
        ],
        'Odwrócenie porównania zachowuje znaczenie.',
      ],
      [
        'Luka 4',
        ['Czy możesz otworzyć okno?', 'Czy możesz otworzyć okno'],
        'Pytanie z możesz wyraża prośbę.',
      ],
      [
        'Luka 5',
        ['Chcę pójść do kina.', 'Chcę pójść do kina'],
        'Chcę pójść wyraża ten sam zamiar.',
      ],
    ],
    true
  ),
  exercise(
    12,
    'Gramatyka VII · Organizacja wyjazdu',
    `Co roku (1) ___ (jeździć) nad jezioro. Wczoraj wreszcie (2) ___ bilety na tegoroczny wyjazd. Wcześniej przez tydzień (3) ___ połączeń, ale nic nam nie pasowało. Gdyby hotel miał wolne pokoje, (4) ___ tam na noc. Mamo, (5) ___ proszę do recepcji teraz! Recepcjonistka zwykle (6) ___ na wiadomości w ciągu godziny. Tym razem już (7) ___ rezerwację, więc wszystko jest gotowe. Gdybym miał większy samochód, (8) ___ także rowery. Nie (9) ___ dokumentów, kiedy pakujecie torby! Po powrocie zawsze (10) ___ zdjęcia znajomym.`,
    [
      [
        'Luka 1',
        ['pojechaliśmy', 'jeździmy', 'pojedziemy'],
        1,
        'Co roku oznacza czynność powtarzaną.',
      ],
      [
        'Luka 2',
        ['kupiliśmy', 'kupujemy', 'kupowalibyśmy'],
        0,
        'Wczoraj wreszcie: zakończony zakup.',
      ],
      ['Luka 3', ['znaleźliśmy', 'znajdziemy', 'szukaliśmy'], 2, 'Przez tydzień trwało szukanie.'],
      [
        'Luka 4',
        ['zostajemy', 'zostalibyśmy', 'zostańmy'],
        1,
        'Gdyby wymaga warunkowego zostalibyśmy.',
      ],
      [
        'Luka 5',
        ['zadzwoniła', 'zadzwonisz', 'zadzwoń'],
        2,
        'Bezpośrednia prośba: tryb rozkazujący.',
      ],
      [
        'Luka 6',
        ['odpowiada', 'odpowiedziała', 'odpowiedz'],
        0,
        'Zwykle oznacza powtarzaną czynność.',
      ],
      [
        'Luka 7',
        ['potwierdzałaby', 'potwierdziła', 'potwierdź'],
        1,
        'Już i wszystko gotowe wskazują zakończenie.',
      ],
      ['Luka 8', ['zabiorę', 'zabrałem', 'zabrałbym'], 2, 'Gdybym: pierwsza osoba warunkowego.'],
      [
        'Luka 9',
        ['zapominacie', 'zapominajcie', 'zapomnieliście'],
        1,
        'Zakaz do grupy: nie zapominajcie.',
      ],
      ['Luka 10', ['pokazujemy', 'pokazaliśmy', 'pokazalibyśmy'], 0, 'Zawsze opisuje zwyczaj.'],
    ]
  ),
  exercise(
    13,
    'Gramatyka VIII · Droga na spotkanie',
    `Wyrazy: do, na, od, przez, po, bez.\n\nWyszedłem (1) ___ telefonu i musiałem zapytać przechodnia o godzinę. Poszedłem (2) ___ przystanek niedaleko sklepu. Autobus przejechał (3) ___ tunel. Po wysiadce skierowałem się (4) ___ biblioteki, gdzie czekali znajomi. (5) ___ spotkaniu wypiliśmy razem herbatę.`,
    [
      ['Luka 1', ['bez'], 'Bez telefonu: brak przedmiotu, dopełniacz.'],
      ['Luka 2', ['na'], 'Iść na przystanek.'],
      ['Luka 3', ['przez'], 'Przejechać przez tunel.'],
      ['Luka 4', ['do'], 'Skierować się do biblioteki.'],
      ['Luka 5', ['po'], 'Po spotkaniu: następstwo czasu.'],
    ],
    true
  ),
]
