import type {
  SpeakingCardsTopic,
  SpeakingKeywordTopic,
} from '../../../goethe-de-a2/content/types/speaking'

/**
 * Original Polish A2 speaking seeds, one per task, in the format of the 2018 sample. Not
 * official tasks. Solo practice: the examiner's questions and role-play lines are fixed
 * `answer` cards marked `speaker: 'examiner'`; the photo of task 2 is described in words.
 */
export const speakingPlSeeds: (SpeakingCardsTopic | SpeakingKeywordTopic)[] = [
  {
    id: 'speaking-pl-a2-zadanie1-001',
    theme: 'O sobie · Praca i czas wolny',
    topicType: 'interview',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    cards: [
      { segment: 'question1', kind: 'answer', speaker: 'examiner', topic: 'Praca i czas wolny', cue: 'Jak się Pan / Pani nazywa i skąd Pan / Pani pochodzi?' },
      { segment: 'question2', kind: 'answer', speaker: 'examiner', topic: 'Praca i czas wolny', cue: 'Gdzie Pan / Pani pracuje albo studiuje?' },
      { segment: 'question3', kind: 'answer', speaker: 'examiner', topic: 'Praca i czas wolny', cue: 'Co Pan / Pani lubi robić w wolnym czasie?' },
      { segment: 'question4', kind: 'answer', speaker: 'examiner', topic: 'Praca i czas wolny', cue: 'Proszę opowiedzieć, jak wygląda Pana / Pani typowy weekend.' },
    ],
  },
  {
    id: 'speaking-pl-a2-zadanie2-001',
    theme: 'Zdjęcie: młoda kobieta w żółtym płaszczu siedzi jesienią na ławce w parku, pije kawę z kubka i czyta książkę.',
    topicType: 'photo',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    keywords: [
      'Kto to jest? Ile może mieć lat?',
      'Jak wygląda? Co ma na sobie?',
      'Co robi i gdzie jest?',
      'Jak się czuje? Dlaczego tak myślisz?',
    ],
  },
  {
    id: 'speaking-pl-a2-zadanie3-001',
    theme: 'Zaproś kolegę lub koleżankę na wycieczkę rowerową. Zaproponuj dzień, godzinę i miejsce spotkania i powiedz, co trzeba zabrać.',
    topicType: 'roleplay',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    cards: [
      { segment: 'opening', kind: 'ask', topic: 'Wycieczka rowerowa', cue: 'zaproszenie na wycieczkę rowerową' },
      { segment: 'reply1', kind: 'answer', speaker: 'examiner', topic: 'Wycieczka rowerowa', cue: 'O, fajny pomysł! A kiedy chcesz jechać?' },
      { segment: 'reply2', kind: 'answer', speaker: 'examiner', topic: 'Wycieczka rowerowa', cue: 'Dobrze, pasuje mi. Gdzie i o której się spotkamy?' },
      { segment: 'reply3', kind: 'answer', speaker: 'examiner', topic: 'Wycieczka rowerowa', cue: 'Świetnie. Co mam ze sobą zabrać?' },
    ],
  },
]
