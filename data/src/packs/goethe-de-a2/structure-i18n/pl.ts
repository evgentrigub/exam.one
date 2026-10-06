import type { StructureText } from '../../../types'

const SCORING_NOTE = 'Punkty surowe (Messpunkte) × 1,25 → punkty wyniku.'

export const pl: StructureText = {
  reading: {
    label: 'Czytanie (Lesen)',
    summary:
      'Cztery krótkie teksty o rosnącym stopniu trudności. Czytasz, aby zrozumieć ogólny sens i szczegóły, oraz dopasowujesz oferty do osób.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Artykuł lub tekst prasowy',
        format: '5 × wielokrotny wybór (a · b · c)',
        short: 'Przeczytaj krótki artykuł (~200 słów) i odpowiedz na 5 pytań a/b/c.',
        goal: 'Rozumienie głównych myśli i kluczowych szczegółów tekstu informacyjnego.',
        skill: 'Czytanie szczegółowe autentycznych tekstów codziennych.',
      },
      2: {
        title: 'Tablica informacyjna / rozkład',
        format: '5 sytuacji · wybierz miejsce (a · b · c)',
        short:
          'Znajdź informację na tablicy informacyjnej lub w rozkładzie — wybierz właściwe piętro lub miejsce.',
        goal: 'Szybkie odnajdywanie jednej konkretnej informacji na codziennych tablicach i oznaczeniach.',
        skill: 'Czytanie selektywne / przeglądowe.',
      },
      3: {
        title: 'List prywatny lub e-mail',
        format: '5 × wielokrotny wybór (a · b · c)',
        short: 'Przeczytaj prywatny e-mail (~230 słów) i odpowiedz na 5 pytań a/b/c.',
        goal: 'Uchwycenie intencji, uczuć i szczegółów w korespondencji prywatnej.',
        skill: 'Czytanie korespondencji prywatnej.',
      },
      4: {
        title: 'Dopasowywanie ogłoszeń',
        format: 'Dopasuj ogłoszenia a–f do 5 osób (jedna odpowiedź to zawsze "x")',
        short:
          'Dopasuj właściwe ogłoszenie do każdej osoby — dla jednej zawsze brak dopasowania (x).',
        goal: 'Łączenie potrzeb każdej osoby z odpowiednią ofertą.',
        skill: 'Dopasowywanie i wnioskowanie pod presją czasu.',
      },
    },
  },
  listening: {
    label: 'Słuchanie (Hören)',
    summary:
      'Cztery nagrania — komunikaty, długi dialog z dopasowywaniem, krótkie wymiany zdań i wywiad.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Komunikaty i wiadomości głosowe',
        format: '5 × wielokrotny wybór (a · b · c) · odtwarzane dwukrotnie',
        short: 'Krótkie komunikaty i wiadomości — 5 pytań, nagranie odtwarzane dwukrotnie.',
        goal: 'Wychwytywanie kluczowych informacji w krótkich wiadomościach mówionych.',
        skill: 'Szczegółowe słuchanie krótkich nagrań.',
      },
      2: {
        title: 'Jeden długi dialog z dopasowywaniem',
        format: 'Dopasuj 5 osób do 9 opcji · odtwarzane raz',
        short: 'Jeden długi dialog — dopasuj osoby do opcji, 9 do wyboru, odtwarzany raz.',
        goal: 'Śledzenie dłuższej rozmowy i przypisywanie właściwego szczegółu każdej osobie.',
        skill: 'Dopasowywanie podczas słuchania.',
      },
      3: {
        title: 'Dialogi codzienne',
        format: '5 × wielokrotny wybór (a · b · c) · odtwarzane raz',
        short: 'Krótkie rozmowy codzienne — 5 pytań wielokrotnego wyboru, odtwarzane raz.',
        goal: 'Rozumienie krótkich wymian zdań w codziennych sytuacjach.',
        skill: 'Ogólny sens i szczegóły w rozmowie.',
      },
      4: {
        title: 'Wywiad radiowy',
        format: '5 × Ja / Nein · odtwarzane dwukrotnie',
        short:
          'Wywiad radiowy — zdecyduj, czy 5 stwierdzeń jest prawdziwych (Ja / Nein), odtwarzany dwukrotnie.',
        goal: 'Rozumienie opinii i wypowiedzi w dłuższym wywiadzie.',
        skill: 'Ocena: prawda / fałsz.',
      },
    },
  },
  writing: {
    label: 'Pisanie (Schreiben)',
    summary: 'Dwa krótkie teksty: swobodna wiadomość do przyjaciela i uprzejmy formalny e-mail.',
    scoringNote:
      'Maks. 20 punktów surowych × 1,25. Tekst poniżej minimalnej liczby słów daje 0 punktów za tę część.',
    parts: {
      1: {
        title: 'Wiadomość nieformalna / SMS',
        format: 'Nieformalnie "du" · 20–30 słów',
        short: 'Napisz krótką, nieformalną wiadomość do przyjaciela na "du", z 3 punktami treści.',
        goal: 'Przekazywanie prostych informacji osobistych w swobodnym rejestrze.',
        skill: 'Nieformalne pisanie codzienne.',
      },
      2: {
        title: 'E-mail półformalny / formalny',
        format: 'Formalnie "Sie" · 30–40 słów',
        short: 'Napisz uprzejmy e-mail na "Sie", z powitaniem, pożegnaniem i 3 punktami treści.',
        goal: 'Uprzejma prośba lub odpowiedź w rejestrze formalnym.',
        skill: 'Korespondencja formalna.',
      },
    },
  },
  speaking: {
    label: 'Mówienie (Sprechen)',
    summary:
      'Egzamin w parach w trzech etapach: krótki wywiad, monolog o sobie i wspólne planowanie.',
    scoringNote: 'Punkty bezpośrednie 4 + 8 + 8 + 5 za wymowę = 25 (bez mnożnika × 1,25).',
    parts: {
      1: {
        title: 'Wywiad',
        format: 'Zadawanie 4 pytań z kart i odpowiadanie na nie (4 pkt)',
        short: 'Zadaj partnerowi 4 pytania z kart i odpowiedz na pytania, które ci zada.',
        goal: 'Wymiana informacji osobistych w prostym wywiadzie.',
        skill: 'Zadawanie pytań i odpowiadanie na nie.',
      },
      2: {
        title: 'Monolog',
        format: 'Wypowiedź na temat z 4 słowami kluczowymi + pytania dodatkowe (8 pkt)',
        short:
          'Opowiedz o sobie na dany temat, korzystając z 4 słów kluczowych, potem odpowiedz na pytania egzaminatora.',
        goal: 'Spójne mówienie na znane, osobiste tematy.',
        skill: 'Spójna, uporządkowana wypowiedź.',
      },
      3: {
        title: 'Dialog i planowanie',
        format: 'Wspólne planowanie z kalendarzem z zajętymi terminami (8 pkt)',
        short:
          'Zaplanuj z partnerem wspólną aktywność, korzystając z osobistego kalendarza z zajętymi terminami.',
        goal: 'Negocjowanie i uzgadnianie ustaleń z partnerem.',
        skill: 'Negocjowanie w interakcji.',
      },
    },
  },
}
