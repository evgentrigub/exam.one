import type { StructureText } from '../../../types'

const SCORING_NOTE =
  'Punkty surowe, 1 za każde pytanie. Oficjalny wynik mnoży każdy moduł przez 1,66 (15 → 25 punktów).'

export const pl: StructureText = {
  reading: {
    label: 'Czytanie (Lesen)',
    summary:
      'Trzy krótkie zadania: dwie prywatne wiadomości, wybór właściwej strony internetowej lub ogłoszenia oraz codzienne napisy.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Krótkie prywatne wiadomości',
        format: '5 × Richtig / Falsch',
        short: 'Przeczytaj dwie krótkie wiadomości i zdecyduj, czy 5 stwierdzeń jest prawdziwych.',
        goal: 'Rozumienie najważniejszych faktów w krótkich prywatnych notatkach i e-mailach.',
        skill: 'Czytanie szczegółowe bardzo krótkich tekstów.',
      },
      2: {
        title: 'Strony internetowe i ogłoszenia',
        format: '5 sytuacji · wybierz a lub b',
        short:
          'W każdej sytuacji wybierz, który z dwóch krótkich tekstów zawiera potrzebne ci informacje.',
        goal: 'Odnajdywanie konkretnych informacji w krótkich tekstach codziennych.',
        skill: 'Czytanie selektywne.',
      },
      3: {
        title: 'Napisy i komunikaty',
        format: '5 × Richtig / Falsch',
        short:
          'Przeczytaj pięć napisów i komunikatów i zdecyduj, czy każde stwierdzenie jest prawdziwe.',
        goal: 'Rozumienie napisów publicznych, komunikatów i krótkich instrukcji.',
        skill: 'Czytanie codziennych napisów.',
      },
    },
  },
  listening: {
    label: 'Słuchanie (Hören)',
    summary:
      'Krótkie rozmowy, komunikaty publiczne i wiadomości telefoniczne — do każdego nagrania jedno pytanie.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Krótkie rozmowy',
        format: '6 × wielokrotny wybór (a · b · c) · odtwarzane dwukrotnie',
        short: 'Sześć krótkich rozmów codziennych, do każdej jedno pytanie a/b/c.',
        goal: 'Wychwytywanie liczby, godziny, ceny lub miejsca w krótkiej rozmowie.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
      2: {
        title: 'Komunikaty publiczne',
        format: '4 × Richtig / Falsch · odtwarzane raz',
        short:
          'Cztery komunikaty na dworcu, lotnisku lub w sklepie — czy stwierdzenie jest prawdziwe?',
        goal: 'Rozumienie głównej treści komunikatu publicznego.',
        skill: 'Ocena: prawda / fałsz.',
      },
      3: {
        title: 'Wiadomości telefoniczne',
        format: '5 × wielokrotny wybór (a · b · c) · odtwarzane dwukrotnie',
        short: 'Pięć wiadomości z automatycznej sekretarki, do każdej jedno pytanie a/b/c.',
        goal: 'Notowanie ważnego szczegółu z wiadomości telefonicznej.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
    },
  },
  writing: {
    label: 'Pisanie (Schreiben)',
    summary:
      'Uzupełnij pięć brakujących rubryk w formularzu, a potem napisz krótką wiadomość (ok. 30 słów).',
    scoringNote:
      'Formularz: 1 punkt za każdą rubrykę. Wiadomość: 3 za każdy punkt treści + 1 za powitanie i zakończenie.',
    parts: {
      1: {
        title: 'Wypełnij formularz',
        format: '5 brakujących rubryk',
        short: 'Przeczytaj tekst o przyjacielu i uzupełnij pięć brakujących rubryk w formularzu.',
        goal: 'Wypełnianie formularza prostymi danymi osobowymi.',
        skill: 'Wypełnianie formularzy.',
      },
      2: {
        title: 'Krótka wiadomość',
        format: 'Ok. 30 słów · 3 punkty treści',
        short: 'Napisz krótką wiadomość z powitaniem, trzema punktami treści i zakończeniem.',
        goal: 'Pisanie krótkiej wiadomości prywatnej lub półformalnej.',
        skill: 'Pisanie krótkich tekstów codziennych.',
      },
    },
  },
  speaking: {
    label: 'Mówienie (Sprechen)',
    summary:
      'Przedstaw się, zadawaj pytania i odpowiadaj na nie w dwóch tematach, a także wyrażaj prośby i reaguj na nie.',
    scoringNote: 'Punkty bezpośrednie 3 + 6 + 6 = 15 (oficjalny wynik mnoży się przez 1,66).',
    parts: {
      1: {
        title: 'Przedstaw się',
        format: 'Słowa kluczowe · przeliteruj słowo · podaj liczbę (3 pkt)',
        short:
          'Przedstaw się na podstawie słów kluczowych, potem przeliteruj słowo i podaj liczbę.',
        goal: 'Podawanie podstawowych informacji o sobie.',
        skill: 'Prosta autoprezentacja.',
      },
      2: {
        title: 'Pytania i odpowiedzi',
        format: 'Karty ze słowami na 2 tematy (6 pkt)',
        short: 'Zadaj pytanie na podstawie karty ze słowem, potem odpowiedz na pytanie partnera.',
        goal: 'Pytanie o proste informacje na tematy codzienne i udzielanie ich.',
        skill: 'Zadawanie pytań i odpowiadanie na nie.',
      },
      3: {
        title: 'Prośby',
        format: 'Karty z prośbami, 2 rundy (6 pkt)',
        short: 'Wyraź uprzejmą prośbę na podstawie karty, potem zareaguj na prośbę partnera.',
        goal: 'Wyrażanie codziennych próśb i reagowanie na nie.',
        skill: 'Prośby i reakcje.',
      },
    },
  },
}
