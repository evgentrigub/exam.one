import type { StructureText } from '../../../types'

export const pl: StructureText = {
  reading: {
    label: 'Czytanie',
    summary:
      'Pięć części: krótkie ogłoszenia, dopasowywanie pytań do trzech tekstów, dłuższy artykuł i dwa teksty z lukami.',
    scoringNote:
      'Punkty surowe, 1 za pytanie (30). W testach próbnych ok. 20/30 to 120 na Cambridge English Scale (Grade C), a 28/30 to 140 (Grade A).',
    parts: {
      1: {
        title: 'Krótkie teksty',
        format: '6 ogłoszeń i wiadomości · A · B · C',
        short: 'Przeczytaj sześć krótkich ogłoszeń i wiadomości i wybierz, co mówi każde z nich.',
        goal: 'Rozumienie głównej treści napisów, notatek i krótkich e-maili.',
        skill: 'Czytanie krótkich tekstów z życia codziennego.',
      },
      2: {
        title: 'Trzy teksty',
        format: '7 pytań · dopasuj do tekstu A · B · C',
        short:
          'Przeczytaj trzy krótkie teksty na jeden temat i zdecyduj, który tekst odpowiada na każde pytanie.',
        goal: 'Odnajdywanie konkretnych informacji i szczegółów w trzech tekstach.',
        skill: 'Czytanie przeglądowe i dopasowywanie wielokrotne.',
      },
      3: {
        title: 'Dłuższy tekst',
        format: '5 × wielokrotny wybór (A · B · C)',
        short: 'Przeczytaj artykuł z czasopisma i odpowiedz na pięć pytań.',
        goal: 'Rozumienie głównych myśli i szczegółów dłuższego tekstu.',
        skill: 'Czytanie szczegółowe.',
      },
      4: {
        title: 'Luki z wyborem odpowiedzi',
        format: '6 luk · wybierz A · B · C',
        short: 'Wybierz właściwe słowo do każdej z sześciu luk w krótkim tekście informacyjnym.',
        goal: 'Używanie właściwego słowa w kontekście: słownictwo i trochę gramatyki.',
        skill: 'Słownictwo w kontekście.',
      },
      5: {
        title: 'Luki otwarte',
        format: '6 luk · wpisz jedno słowo',
        short: 'Wpisz jedno słowo w każdą z sześciu luk w e-mailu.',
        goal: 'Poprawne używanie słów gramatycznych: przyimków, zaimków, czasowników i łączników.',
        skill: 'Gramatyka i struktura.',
      },
    },
  },
  writing: {
    label: 'Pisanie',
    summary:
      'Napisz krótki e-mail lub notatkę (Part 6) i krótką historyjkę na podstawie trzech obrazków (Part 7).',
    scoringNote:
      'Każde zadanie: treść, organizacja i język, po 0–5 (15). W testach próbnych ok. 18/30 to 120 na skali, a 26/30 to 140.',
    parts: {
      1: {
        title: 'E-mail lub notatka',
        format: 'Reading & Writing Part 6 · 25+ słów · 3 punkty',
        short:
          'Napisz e-mail lub notatkę (co najmniej 25 słów), która obejmuje wszystkie trzy punkty.',
        goal: 'Napisanie krótkiej wiadomości codziennej ze wszystkimi wymaganymi informacjami.',
        skill: 'Pisanie kierowane.',
      },
      2: {
        title: 'Historyjka obrazkowa',
        format: 'Reading & Writing Part 7 · 35+ słów · 3 obrazki',
        short: 'Napisz krótką historyjkę (co najmniej 35 słów) do trzech obrazków.',
        goal: 'Opowiedzenie prostej, spójnej historii obejmującej wszystkie trzy obrazki.',
        skill: 'Pisanie narracyjne.',
      },
    },
  },
  listening: {
    label: 'Słuchanie',
    summary:
      'Krótkie rozmowy, wypowiedź z notatkami do uzupełnienia, dłuższa rozmowa, krótkie nagrania i zadanie na dopasowywanie. Każde nagranie słyszysz dwa razy.',
    scoringNote:
      'Punkty surowe, 1 za pytanie (25). W testach próbnych ok. 17/25 to 120 na skali, a 23/25 to 140.',
    parts: {
      1: {
        title: 'Krótkie rozmowy',
        format: '5 × wielokrotny wybór (A · B · C)',
        short: 'Pięć krótkich rozmów, do każdej jedno pytanie.',
        goal: 'Wychwytywanie kluczowych informacji: godzin, cen, miejsc, rzeczy.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
      2: {
        title: 'Notatki',
        format: '5 luk · słowo, liczba, data lub godzina',
        short: 'Wysłuchaj wypowiedzi i uzupełnij pięć notatek.',
        goal: 'Zapisywanie kluczowych faktów, w tym literowanych nazw i liczb.',
        skill: 'Robienie notatek.',
      },
      3: {
        title: 'Dłuższa rozmowa',
        format: '5 × wielokrotny wybór (A · B · C)',
        short: 'Wysłuchaj rozmowy dwóch osób i odpowiedz na pięć pytań.',
        goal: 'Śledzenie rozmowy, w tym tego, co myśli każdy z rozmówców.',
        skill: 'Słuchanie ze zrozumieniem szczegółów i opinii.',
      },
      4: {
        title: 'Krótkie nagrania',
        format: '5 × wielokrotny wybór (A · B · C)',
        short: 'Pięć krótkich nagrań, do każdego jedno pytanie o główną myśl.',
        goal: 'Rozumienie głównej myśli, powodu lub uczucia w krótkim nagraniu.',
        skill: 'Słuchanie ze zrozumieniem ogólnego sensu.',
      },
      5: {
        title: 'Dopasowywanie',
        format: '5 pozycji · 8 opcji, 3 niewykorzystane',
        short: 'Wysłuchaj rozmowy i dopasuj pięć osób do właściwej opcji.',
        goal: 'Uważne śledzenie rozmowy i dopasowywanie informacji.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
    },
  },
  speaking: {
    label: 'Mówienie',
    summary: 'Odpowiedz na pytania egzaminatora o sobie, a potem omów zestaw obrazków.',
    scoringNote:
      'Ćwiczenia: gramatyka i słownictwo, komunikacja interaktywna oraz ogólne wykonanie zadania, po 0–5 za każdą część, na podstawie twojej transkrypcji. Egzamin ocenia też wymowę i przelicza skale na 45 punktów; ok. 27/45 to 120 na skali.',
    parts: {
      1: {
        title: 'Wywiad',
        format: 'Pytania egzaminatora · 5 odpowiedzi',
        short: 'Odpowiedz na pytania egzaminatora o sobie i na codzienny temat.',
        goal: 'Podawanie informacji o sobie i krótkie mówienie na tematy codzienne.',
        skill: 'Odpowiadanie na pytania.',
      },
      2: {
        title: 'Dyskusja',
        format: 'Obrazki · opinie · pytania dodatkowe',
        short:
          'Powiedz, co myślisz o kilku aktywnościach, zapytaj partnera i odpowiedz na pytania dodatkowe.',
        goal: 'Wyrażanie opinii i pytanie o nie oraz mówienie, co wolisz i dlaczego.',
        skill: 'Rozmowa o upodobaniach i preferencjach.',
      },
    },
  },
}
