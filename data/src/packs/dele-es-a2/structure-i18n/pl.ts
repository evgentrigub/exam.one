import type { StructureText } from '../../../types'

export const pl: StructureText = {
  reading: {
    label: 'Czytanie (Comprensión de lectura)',
    summary:
      'Cztery zadania: prywatny list lub e-mail, osiem krótkich ogłoszeń i komunikatów, trzy teksty do dopasowania do stwierdzeń oraz dłuższy tekst narracyjny.',
    scoringNote:
      'Punkty surowe, 1 za pytanie (25). Egzamin łączy czytanie i pisanie w Grupo 1 (50 punktów); aby zdać, trzeba zdobyć 30 punktów w każdej grupie.',
    parts: {
      1: {
        title: 'Prywatny list lub e-mail',
        format: 'Tarea 1 · 1 tekst · 5 pytań · a · b · c',
        short: 'Przeczytaj prywatny list lub e-mail i odpowiedz na pięć pytań na jego temat.',
        goal: 'Rozumienie głównych informacji i szczegółów prywatnej wiadomości.',
        skill: 'Czytanie szczegółowe.',
      },
      2: {
        title: 'Ogłoszenia i komunikaty',
        format: 'Tarea 2 · 8 krótkich tekstów · po 1 pytaniu · a · b · c',
        short:
          'Przeczytaj osiem krótkich ogłoszeń, komunikatów lub wpisów i odpowiedz na jedno pytanie do każdego.',
        goal: 'Odnajdywanie konkretnych informacji w krótkich tekstach publicznych.',
        skill: 'Wyszukiwanie konkretnych informacji w tekście.',
      },
      3: {
        title: 'Trzy teksty',
        format: 'Tarea 3 · 3 teksty · 6 stwierdzeń · A · B · C',
        short:
          'Przeczytaj trzy krótkie teksty i zdecyduj, którego tekstu dotyczy każde z sześciu stwierdzeń.',
        goal: 'Porównywanie podobnych tekstów i ustalanie, gdzie jest każda informacja.',
        skill: 'Wyszukiwanie konkretnych informacji w tekście.',
      },
      4: {
        title: 'Tekst narracyjny',
        format: 'Tarea 4 · 1 tekst · 6 pytań · a · b · c',
        short:
          'Przeczytaj dłuższy tekst (biografię, blog, opowiadanie lub przewodnik) i odpowiedz na sześć pytań.',
        goal: 'Śledzenie dłuższego tekstu narracyjnego i rozumienie jego szczegółów.',
        skill: 'Czytanie szczegółowe.',
      },
    },
  },
  listening: {
    label: 'Słuchanie (Comprensión auditiva)',
    summary:
      'Cztery zadania: sześć krótkich rozmów, sześć fragmentów audycji radiowych, jedna rozmowa do przypisania rozmówcom i siedem krótkich wiadomości. Każde nagranie słyszysz dwa razy.',
    scoringNote:
      'Punkty surowe, 1 za pytanie (25). Egzamin łączy słuchanie i mówienie w Grupo 2 (50 punktów); aby zdać, trzeba zdobyć 30 punktów w każdej grupie.',
    parts: {
      1: {
        title: 'Krótkie rozmowy',
        format: 'Tarea 1 · 6 rozmów · a · b · c',
        short:
          'Wysłuchaj sześciu krótkich rozmów codziennych i odpowiedz na jedno pytanie do każdej.',
        goal: 'Rozumienie kluczowych informacji w krótkich rozmowach twarzą w twarz.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
      2: {
        title: 'Radio',
        format: 'Tarea 2 · 6 fragmentów audycji · a · b · c',
        short:
          'Wysłuchaj sześciu krótkich fragmentów radiowych – wiadomości, reklam, komunikatów – i odpowiedz na jedno pytanie do każdego.',
        goal: 'Rozumienie głównej myśli krótkich tekstów nadawanych w radiu.',
        skill: 'Słuchanie ze zrozumieniem ogólnego sensu i szczegółów.',
      },
      3: {
        title: 'Kto to mówi?',
        format: 'Tarea 3 · 1 rozmowa · 6 stwierdzeń · mężczyzna · kobieta · żadne z nich',
        short:
          'Wysłuchaj rozmowy dwojga przyjaciół i zdecyduj, kto mówi każdą z sześciu rzeczy: mężczyzna, kobieta czy żadne z nich.',
        goal: 'Śledzenie rozmowy i przypisywanie informacji właściwemu rozmówcy.',
        skill: 'Wyszukiwanie konkretnych informacji ze słuchu.',
      },
      4: {
        title: 'Wiadomości',
        format: 'Tarea 4 · 7 wiadomości · 10 stwierdzeń, 3 niewykorzystane',
        short:
          'Wysłuchaj siedmiu krótkich wiadomości i komunikatów i dopasuj każdą z nich do tego, co mówi.',
        goal: 'Rozumienie celu krótkich wiadomości i komunikatów.',
        skill: 'Słuchanie ze zrozumieniem ogólnego sensu.',
      },
    },
  },
  writing: {
    label: 'Pisanie (Expresión e interacción escritas)',
    summary:
      'Odpowiedź na krótką wiadomość (60–70 słów) i tekst o życiu codziennym lub biografia (70–80 słów).',
    scoringNote:
      'W ćwiczeniach każde zadanie jest oceniane na dwóch skalach egzaminu, po 0–3: wykonanie zadania (cumplimiento de la tarea) i użycie języka (uso de la lengua). Egzamin waży użycie języka na 66%, a wykonanie zadania na 34% i przelicza wynik na 25 punktów (×25/3); w ćwiczeniach widzisz surowe poziomy, gdzie 2 oznacza osiągnięcie A2.',
    parts: {
      1: {
        title: 'Odpowiedź na wiadomość',
        format: 'Tarea 1 · e-mail, notatka lub wpis · 60–70 słów',
        short:
          'Przeczytaj krótką wiadomość od przyjaciela i napisz odpowiedź, która odnosi się do każdego punktu.',
        goal: 'Napisanie prywatnej wiadomości, w której odpowiadasz, informujesz i proponujesz.',
        skill: 'Interakcja pisemna.',
      },
      2: {
        title: 'Życie codzienne lub biografia',
        format: 'Tarea 2 · Opción A lub B · 70–80 słów',
        short:
          'Napisz o doświadczeniu z twojego codziennego życia (Opción A) albo biografię lub historię na podstawie podanych informacji (Opción B).',
        goal: 'Napisanie spójnego tekstu o przeszłości i teraźniejszości.',
        skill: 'Wypowiedź pisemna.',
      },
    },
  },
  speaking: {
    label: 'Mówienie (Expresión e interacción orales)',
    summary:
      'Krótka prezentacja na dany temat, opis sceny i odgrywanie ról z egzaminatorem w tej scenie. Na egzaminie masz 12 minut na przygotowanie.',
    scoringNote:
      'Ćwiczenia, na podstawie twojej transkrypcji: każde zadanie na dwóch skalach egzaminu, po 0–3: wykonanie zadania i użycie języka (18). Egzamin ocenia też cały test globalnie i przelicza wynik na 25 punktów; w ćwiczeniach widzisz surowe poziomy, gdzie 2 oznacza osiągnięcie A2.',
    parts: {
      1: {
        title: 'Prezentacja',
        format: 'Tarea 1 · temat · 5 punktów · monolog',
        short: 'Wygłoś krótką prezentację o sobie na dany temat, uwzględniając punkty z karty.',
        goal: 'Mówienie o własnym życiu w krótkim, spójnym monologu.',
        skill: 'Wypowiedź ustna.',
      },
      2: {
        title: 'Opis sceny',
        format: 'Tarea 2 · scena · pytania naprowadzające · monolog',
        short: 'Opisz codzienną scenę: ludzi, miejsce, co robią i jak się czują.',
        goal: 'Opisywanie ludzi i sytuacji z pomocą pytań naprowadzających.',
        skill: 'Opisywanie.',
      },
      3: {
        title: 'Odgrywanie ról',
        format: 'Tarea 3 · sytuacja z egzaminatorem · 4 kwestie',
        short: 'Odegraj z egzaminatorem sytuację ze sceny: odpowiadaj, pytaj i reaguj.',
        goal: 'Udział w prostej codziennej transakcji lub rozmowie.',
        skill: 'Interakcja ustna.',
      },
    },
  },
}
