import type { StructureText } from '../../../types'

export const pl: StructureText = {
  listening: {
    label: 'Rozumienie ze słuchu',
    summary:
      'Pięć zadań: kto mówi i gdzie, komunikat radiowy, dialog, wiadomości telefoniczne i liczby do zapisania. Każde nagranie słyszysz dwa razy.',
    scoringNote:
      'Punkty surowe, 1 za pytanie (30). Część pisemną (słuchanie, czytanie i pisanie, 80 punktów) zdaje się z wynikiem 50% jej sumy; na poziomie A2 nie ma minimum dla poszczególnych modułów.',
    parts: {
      1: {
        title: 'Kto mówi? Gdzie?',
        format: 'Zadanie I · 10 krótkich nagrań · a · b · c',
        short: 'Wysłuchaj dziesięciu krótkich nagrań i zdecyduj, kto mówi albo gdzie je słychać.',
        goal: 'Rozpoznawanie mówiącego i sytuacji w krótkich wypowiedziach codziennych.',
        skill: 'Rozpoznawanie sytuacji ze słuchu.',
      },
      2: {
        title: 'Komunikat radiowy',
        format: 'Zadanie II · 5 × prawda / fałsz',
        short:
          'Wysłuchaj komunikatu radiowego i zdecyduj, czy pięć zdań jest prawdziwych, czy fałszywych.',
        goal: 'Rozumienie najważniejszych faktów w komunikacie publicznym.',
        skill: 'Słuchanie ze zrozumieniem szczegółów.',
      },
      3: {
        title: 'Dialog',
        format: 'Zadanie III · 5 osób · 7 opcji, 2 niewykorzystane',
        short: 'Wysłuchaj rozmowy i dopasuj pięć osób do tego, co robią.',
        goal: 'Śledzenie rozmowy i przypisywanie informacji właściwej osobie.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
      4: {
        title: 'Wiadomości telefoniczne',
        format: 'Zadanie IV · 5 wiadomości · 6 opcji, 1 niewykorzystana',
        short:
          'Wysłuchaj pięciu wiadomości z automatycznej sekretarki i dopasuj każdą do tego, co mówi.',
        goal: 'Rozumienie celu krótkich wiadomości telefonicznych.',
        skill: 'Słuchanie ze zrozumieniem ogólnego sensu.',
      },
      5: {
        title: 'Liczby',
        format: 'Zadanie V · 5 luk · data, liczba, godzina lub rok',
        short: 'Wysłuchaj komunikatu i zapisz pięć liczb: daty, godziny, ceny i lata.',
        goal: 'Wychwytywanie i zapisywanie usłyszanych liczb.',
        skill: 'Robienie notatek.',
      },
    },
  },
  reading: {
    label: 'Rozumienie tekstów pisanych i gramatyka',
    summary:
      'Sześć zadań: wybór poprawnej formy, wyrazy z ramki, napisy publiczne, krótkie ogłoszenia, formularz do wypełnienia i podpisy do dopasowania.',
    scoringNote:
      'Punkty surowe (30): 0,5 za lukę w zadaniach I, II i V, 1 za pytanie w zadaniach III, IV i VI. Na poziomie A2 gramatyka jest częścią tego modułu.',
    parts: {
      1: {
        title: 'Poprawna forma',
        format: 'Zadanie I · 10 luk · wybierz 1 z 3 form · po 0,5',
        short: 'Wybierz poprawną formę gramatyczną do każdej z dziesięciu luk w tekście.',
        goal: 'Używanie właściwego przypadka, formy czasownika i formy wyrazu w kontekście.',
        skill: 'Gramatyka w kontekście.',
      },
      2: {
        title: 'Wyrazy z ramki',
        format: 'Zadanie II · 10 luk · 11 wyrazów, 1 niewykorzystany · po 0,5',
        short: 'Uzupełnij dziesięć zdań wyrazami z ramki.',
        goal: 'Wybór wyrazu, który pasuje do znaczenia i gramatyki zdania.',
        skill: 'Słownictwo i gramatyka.',
      },
      3: {
        title: 'Napisy publiczne',
        format: 'Zadanie III · 5 napisów · a · b · c',
        short: 'Przeczytaj pięć napisów publicznych i wybierz, gdzie je widzisz lub co znaczą.',
        goal: 'Rozumienie napisów i krótkich informacji w miejscach codziennego użytku.',
        skill: 'Czytanie krótkich tekstów z życia codziennego.',
      },
      4: {
        title: 'Krótkie ogłoszenia',
        format: 'Zadanie IV · 5 ogłoszeń · a · b · c',
        short: 'Przeczytaj pięć krótkich ogłoszeń i wiadomości i wybierz poprawną odpowiedź.',
        goal: 'Rozumienie głównych informacji w krótkich tekstach użytkowych.',
        skill: 'Wyszukiwanie konkretnych informacji w tekście.',
      },
      5: {
        title: 'Wypełnij formularz',
        format: 'Zadanie V · tekst i formularz · 10 luk · po 0,5',
        short: 'Przeczytaj, co ktoś pisze o sobie, i wypełnij dziesięć pól formularza.',
        goal: 'Odnajdywanie danych osobowych w tekście i poprawne ich zapisywanie.',
        skill: 'Czytanie szczegółowe.',
      },
      6: {
        title: 'Podpisy',
        format: 'Zadanie VI · 5 scen · 6 podpisów, 1 niewykorzystany',
        short: 'Dopasuj pięć scen do opisujących je podpisów.',
        goal: 'Łączenie krótkiego opisu z sytuacją, którą przedstawia.',
        skill: 'Czytanie ze zrozumieniem znaczenia.',
      },
    },
  },
  writing: {
    label: 'Pisanie',
    summary: 'Krótki tekst (pozdrowienia lub wiadomość) i dłuższy tekst (opis lub list).',
    scoringNote:
      'Oficjalnie jeden zestaw dwóch zadań oceniany łącznie: wykonanie zadania 6, bogactwo językowe 7, poprawność językowa 7 (20). W ćwiczeniach każde zadanie jest oceniane według tych samych kryteriów: 2/2/2 i 4/5/5.',
    parts: {
      1: {
        title: 'Krótki tekst',
        format: 'Zadanie a · pozdrowienia lub wiadomość · 10–30 słów',
        short: 'Napisz krótkie pozdrowienia lub SMS na codzienną okazję.',
        goal: 'Napisanie krótkiej wiadomości prywatnej zgodnej z poleceniem.',
        skill: 'Krótkie teksty użytkowe.',
      },
      2: {
        title: 'Dłuższy tekst',
        format: 'Zadanie b · opis lub list · 70–100 słów',
        short: 'Napisz opis osoby, miejsca lub wydarzenia albo krótki list prywatny.',
        goal: 'Napisanie spójnego tekstu, który uwzględnia wszystkie punkty polecenia.',
        skill: 'Pisanie opisowe.',
      },
    },
  },
  speaking: {
    label: 'Mówienie',
    summary:
      'Odpowiedz na pytania egzaminatora o sobie, opisz osobę ze zdjęcia i odegraj z egzaminatorem scenkę.',
    scoringNote:
      'Ćwiczenia, na podstawie twojej transkrypcji: wykonanie zadania 4 + 10 + 10 oraz słownictwo i gramatyka po 6, rozdzielone między zadania (36). Egzamin ocenia też wymowę (0–4), łącznie 40 punktów; do zdania trzeba 50% (20).',
    parts: {
      1: {
        title: 'O sobie',
        format: 'Zadanie 1 · pytania egzaminatora · 4 odpowiedzi',
        short:
          'Odpowiedz na pytania egzaminatora o sobie, swojej rodzinie, zainteresowaniach oraz pracy lub nauce.',
        goal: 'Podawanie prostych informacji o sobie pełnymi zdaniami.',
        skill: 'Odpowiadanie na pytania.',
      },
      2: {
        title: 'Opis zdjęcia',
        format: 'Zadanie 2 · osoba na zdjęciu · monolog',
        short: 'Opisz osobę na zdjęciu: kto to jest, jak wygląda, co robi.',
        goal: 'Opisywanie osoby i sytuacji w krótkim, spójnym monologu.',
        skill: 'Opisywanie.',
      },
      3: {
        title: 'Scenka',
        format: 'Zadanie 3 · sytuacja z egzaminatorem · 4 kwestie',
        short:
          'Odegraj codzienną sytuację: rozpocznij rozmowę, a potem reaguj na to, co mówi egzaminator.',
        goal: 'Zapraszanie, proponowanie, umawianie się i reagowanie w prostej codziennej rozmowie.',
        skill: 'Interakcja.',
      },
    },
  },
}
