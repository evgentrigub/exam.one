import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import { buildSeedListeningAudioMap } from '~/utils/listening/audioUrls'

/**
 * Default A2-level German listening exercises (Goethe-Institut, modular 2024 format).
 * One exercise per Teil (1-4), each distinguished by `testingPart`:
 * - Teil 1: five short monologues (Durchsagen/Radio/Anrufbeantworter), 3-option MCQ each
 * - Teil 2: one dialogue with five person-to-option matching tasks (9 options)
 * - Teil 3: five short dialogues, 3-option MCQ each
 * - Teil 4: one radio interview with five true/false statements
 *
 * Audio maps point at pre-generated Kokoro WAVs (martin/bernd/victoria/eva) under public/audio/listening/a2/.
 * Dialogue transcripts use Role: labels so multi-voice generation can assign male/female speakers.
 * Regenerate with: `FORCE=1 pnpm generate:listening-audio` after `pnpm tts:up`.
 */
const listeningSeedsWithoutAudio: ListeningA2Exercise[] = [
  {
    id: 'listening-a2-teil1-001',
    title: 'Teil 1: Durchsagen und Ansagen verstehen',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-06-14',
    items: [
      {
        id: 'listening-a2-teil1-001-i1',
        context: 'Sie hören den Wetterbericht im Radio.',
        transcript:
          'Und nun das Wetter für morgen, Samstag. Am Vormittag scheint zuerst noch die Sonne, doch am Nachmittag ziehen dunkle Wolken auf und es bleibt grau. Erst gegen Abend beginnt es zu regnen, und in der Nacht wird es mit fünf Grad ziemlich kalt. Am Sonntag bleibt es dann trocken.',
        question: 'Wie wird das Wetter am Samstagnachmittag?',
        options: ['Sonnig', 'Bewölkt', 'Regnerisch'],
        correctAnswer: 1,
        explanation:
          'Die Sonne scheint nur am Vormittag, der Regen kommt erst am Abend. Am Nachmittag ziehen dunkle Wolken auf, also ist es bewölkt.'
      },
      {
        id: 'listening-a2-teil1-001-i2',
        context: 'Sie hören eine Verkehrsmeldung im Radio.',
        transcript:
          'Hier eine wichtige Meldung für Bremen. Die Hauptstraße in der Innenstadt bleibt wegen Bauarbeiten noch bis Freitag gesperrt. Autofahrer nehmen bitte die Umleitung über den Ring. Die Buslinie fünf fährt heute ganz normal, aber die Linie acht fällt den ganzen Tag aus. Planen Sie bitte mehr Zeit ein.',
        question: 'Welcher Bus fährt heute nicht?',
        options: ['Die Linie fünf', 'Die Linie acht', 'Der Ring'],
        correctAnswer: 1,
        explanation:
          'Die Linie fünf fährt normal, der Ring ist die Umleitung für Autos. Nur die Linie acht fällt den ganzen Tag aus.'
      },
      {
        id: 'listening-a2-teil1-001-i3',
        context: 'Sie hören eine Durchsage am Bahnhof.',
        transcript:
          'Achtung, eine Information für die Reisenden auf Gleis drei. Der Intercity nach München, Abfahrt vierzehn Uhr zwanzig, hat heute etwa zwanzig Minuten Verspätung. Reisende nach Hamburg fahren heute bitte von Gleis sieben. Der Zug nach Köln fällt leider aus. Wir bitten um Ihr Verständnis und wünschen eine gute Reise.',
        question: 'Welcher Zug fällt heute aus?',
        options: ['Der Zug nach München', 'Der Zug nach Hamburg', 'Der Zug nach Köln'],
        correctAnswer: 2,
        explanation:
          'Der Zug nach München hat nur Verspätung, der Zug nach Hamburg fährt von einem anderen Gleis. Nur der Zug nach Köln fällt aus.'
      },
      {
        id: 'listening-a2-teil1-001-i4',
        context: 'Sie hören eine Durchsage am Flughafen.',
        transcript:
          'Sehr geehrte Fluggäste des Fluges nach Wien. Das Boarding beginnt jetzt am Ausgang B zwölf. Bitte halten Sie Ihre Bordkarte und Ihren Reisepass bereit. Passagiere mit kleinen Kindern dürfen zuerst einsteigen. Der Flug nach Rom verspätet sich leider um eine Stunde. Wir danken für Ihre Geduld.',
        question: 'Wer darf zuerst in das Flugzeug einsteigen?',
        options: ['Passagiere nach Rom', 'Passagiere mit kleinen Kindern', 'Passagiere mit einem Reisepass'],
        correctAnswer: 1,
        explanation:
          'Der Flug nach Rom hat Verspätung, einen Reisepass brauchen alle. Zuerst einsteigen dürfen aber nur Passagiere mit kleinen Kindern.'
      },
      {
        id: 'listening-a2-teil1-001-i5',
        context: 'Sie hören den Anrufbeantworter einer Arztpraxis.',
        transcript:
          'Guten Tag, Sie haben die Praxis Doktor Schmidt erreicht. Unsere Praxis ist von Montag bis Donnerstag von acht bis sechzehn Uhr für Sie geöffnet. Am Freitag sind wir nur bis zwölf Uhr da. In dringenden Notfällen wählen Sie bitte die einhundertzwölf. Wir wünschen Ihnen einen schönen Tag.',
        question: 'Bis wann ist die Praxis am Freitag geöffnet?',
        options: ['Bis acht Uhr', 'Bis zwölf Uhr', 'Bis sechzehn Uhr'],
        correctAnswer: 1,
        explanation:
          'Um acht Uhr öffnet die Praxis, bis sechzehn Uhr ist sie von Montag bis Donnerstag offen. Am Freitag ist sie nur bis zwölf Uhr geöffnet.'
      }
    ]
  },

  {
    id: 'listening-a2-teil2-001',
    title: 'Teil 2: Ein Gespräch über den Arbeitsweg verstehen',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-06-14',
    context: 'Wie kommen die Personen heute zur Arbeit?',
    transcript:
      'Mann: Sag mal, wie kommt ihr eigentlich morgens alle ins Büro? Frau: Na ja, das ist ganz unterschiedlich. Anna wohnt ja gleich um die Ecke, die kommt einfach zu Fuß. Das dauert nur zehn Minuten. Mann: Ach so. Und Bernd? Der wohnt doch außerhalb der Stadt, oder? Frau: Genau. Bernd ist früher immer mit dem Auto gefahren, aber das wurde ihm zu teuer. Jetzt nimmt er jeden Morgen den Zug. Mann: Wirklich? Praktisch. Und Clara? Frau: Clara hat sich letztes Jahr ein tolles Fahrrad gekauft. Bei gutem Wetter fährt sie immer damit. Aber wenn es regnet, steigt sie in den Bus. Und heute regnet es ja stark. Mann: Stimmt, dann kommt Clara heute bestimmt mit dem Bus. Und David, fährt der immer noch Motorrad? Frau: Nein, das Motorrad hat er schon verkauft. Er fährt jetzt mit der U-Bahn, das geht viel schneller. Mann: Und du, Eva, wie kommst du? Frau: Ich nehme normalerweise die Straßenbahn. Aber mein Auto ist gerade in der Werkstatt, äh, nein, die Straßenbahn meine ich nicht. Heute hat mich ein Taxi gebracht. Mann: Oh je, das ist aber teuer! Frau: Ja, aber wirklich nur für heute.',
    options: ['das Auto', 'der Bus', 'das Fahrrad', 'zu Fuß', 'die U-Bahn', 'der Zug', 'das Motorrad', 'das Taxi', 'die Straßenbahn'],
    questions: [
      {
        id: 'listening-a2-teil2-001-q1',
        person: 'Anna',
        correctAnswer: 3,
        explanation: 'Anna wohnt gleich um die Ecke und kommt deshalb zu Fuß; der Weg dauert nur zehn Minuten.'
      },
      {
        id: 'listening-a2-teil2-001-q2',
        person: 'Bernd',
        correctAnswer: 5,
        explanation: 'Bernd ist früher mit dem Auto gefahren, aber das war zu teuer. Jetzt nimmt er jeden Morgen den Zug.'
      },
      {
        id: 'listening-a2-teil2-001-q3',
        person: 'Clara',
        correctAnswer: 1,
        explanation: 'Clara fährt nur bei gutem Wetter mit dem Fahrrad. Weil es heute stark regnet, kommt sie mit dem Bus.'
      },
      {
        id: 'listening-a2-teil2-001-q4',
        person: 'David',
        correctAnswer: 4,
        explanation: 'David hat sein Motorrad schon verkauft und fährt jetzt mit der U-Bahn, weil das schneller ist.'
      },
      {
        id: 'listening-a2-teil2-001-q5',
        person: 'Eva',
        correctAnswer: 7,
        explanation: 'Eva nimmt normalerweise die Straßenbahn, aber ihr Auto ist in der Werkstatt. Heute hat sie ein Taxi gebracht.'
      }
    ]
  },

  {
    id: 'listening-a2-teil3-001',
    title: 'Teil 3: Kurze Alltagsgespräche verstehen',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-06-14',
    items: [
      {
        id: 'listening-a2-teil3-001-i1',
        question: 'Was kauft die Frau?',
        transcript:
          'Verkäuferin: Suchen Sie etwas Bestimmtes? Frau: Ja, ich brauche etwas Warmes für den Winter. Verkäuferin: Wie wäre es mit diesem roten Mantel? Frau: Der ist schön, aber zu dick und zu warm. Und einen Pullover habe ich schon genug zu Hause. Ich nehme lieber die blaue Jacke dort. Verkäuferin: Eine gute Wahl!',
        options: ['Einen Mantel', 'Einen Pullover', 'Eine Jacke'],
        correctAnswer: 2,
        explanation:
          'Der Mantel ist der Frau zu dick und zu warm, einen Pullover hat sie schon genug. Sie nimmt am Ende die blaue Jacke.'
      },
      {
        id: 'listening-a2-teil3-001-i2',
        question: 'Was bestellt der Mann?',
        transcript:
          'Kellner: Was möchten Sie essen? Mann: Ich hätte gern die Pizza. Kellner: Tut mir leid, Pizza haben wir heute leider nicht mehr. Mann: Oh, schade. Dann nehme ich den Fisch. Kellner: Möchten Sie Salat oder Pommes dazu? Mann: Salat bitte, keine Pommes. Kellner: Gern, kommt sofort.',
        options: ['Pizza', 'Fisch', 'Pommes'],
        correctAnswer: 1,
        explanation:
          'Pizza gibt es heute nicht mehr, Pommes will der Mann ausdrücklich nicht. Er bestellt den Fisch mit Salat.'
      },
      {
        id: 'listening-a2-teil3-001-i3',
        question: 'Was ist kaputt und muss repariert werden?',
        transcript:
          'Techniker: Guten Tag, was kann ich für Sie tun? Mann: Mein Laptop ist kaputt, er geht gar nicht mehr an. Techniker: Und Ihr Handy, funktioniert das? Mann: Ja, das Handy ist in Ordnung. Auch der Drucker macht keine Probleme. Nur der Laptop streikt. Techniker: Gut, ich sehe ihn mir an.',
        options: ['Das Handy', 'Der Laptop', 'Der Drucker'],
        correctAnswer: 1,
        explanation:
          'Das Handy funktioniert und der Drucker macht keine Probleme. Nur der Laptop geht nicht mehr an und muss repariert werden.'
      },
      {
        id: 'listening-a2-teil3-001-i4',
        question: 'Welchen Film wollen sie zusammen sehen?',
        transcript:
          'Mann: Wollen wir heute den Actionfilm um acht sehen? Frau: Ach nein, Actionfilme mag ich überhaupt nicht. Mann: Und die Komödie? Frau: Die habe ich leider schon gestern gesehen. Lass uns lieber den neuen Krimi anschauen. Mann: Okay, der Krimi klingt wirklich gut.',
        options: ['Den Actionfilm', 'Die Komödie', 'Den Krimi'],
        correctAnswer: 2,
        explanation:
          'Die Frau mag keine Actionfilme, und die Komödie hat sie schon gestern gesehen. Sie einigen sich auf den neuen Krimi.'
      },
      {
        id: 'listening-a2-teil3-001-i5',
        question: 'Wie fährt die Frau nach Hause?',
        transcript:
          'Mann: Soll ich dich mit dem Auto nach Hause bringen? Frau: Danke, das ist wirklich nicht nötig. Mann: Nimmst du dann den Bus? Frau: Nein, der fährt um diese Zeit nicht mehr. Ich gehe heute zu Fuß, das Wetter ist so schön. Mann: Na gut, dann bis morgen!',
        options: ['Mit dem Auto', 'Mit dem Bus', 'Zu Fuß'],
        correctAnswer: 2,
        explanation:
          'Das Auto lehnt die Frau ab, und der Bus fährt um diese Zeit nicht mehr. Bei schönem Wetter geht sie zu Fuß.'
      }
    ]
  },

  {
    id: 'listening-a2-teil4-001',
    title: 'Teil 4: Ein Radiointerview über Bewegung verstehen',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-06-14',
    context:
      'Sie hören ein Interview im Radio. Eine Moderatorin spricht mit der Sportwissenschaftlerin Frau Müller über Bewegung und Gesundheit.',
    transcript:
      'Moderatorin: Herzlich willkommen zu unserer Sendung. Heute spreche ich mit Frau Müller, einer Sportwissenschaftlerin. Frau Müller, wie wichtig ist Bewegung für unsere Gesundheit? Frau Müller: Bewegung ist sehr wichtig. Viele Menschen glauben, man muss jeden Tag ins Fitnessstudio gehen. Das stimmt aber nicht. Schon dreißig Minuten Spazierengehen pro Tag sind völlig genug. Moderatorin: Das klingt ja einfach. Bewegen sich die Deutschen denn genug? Frau Müller: Leider nein. Viele sitzen den ganzen Tag im Büro und bewegen sich viel zu wenig. Besonders junge Leute verbringen zu viel Zeit am Computer. Moderatorin: Was empfehlen Sie diesen Menschen? Frau Müller: Am besten fährt man mit dem Fahrrad zur Arbeit oder nimmt die Treppe statt den Aufzug. Schon kleine Veränderungen helfen sehr. Moderatorin: Und muss man dafür viel Geld ausgeben? Frau Müller: Überhaupt nicht. Laufen und Spazierengehen kosten nichts. Man braucht keine teure Ausrüstung. Moderatorin: Und das Alter? Ist Sport nur etwas für junge Menschen? Frau Müller: Nein, im Gegenteil. Gerade ältere Menschen sollten aktiv bleiben. Es ist nie zu spät, mit Sport anzufangen. Moderatorin: Vielen Dank für das interessante Gespräch, Frau Müller. Frau Müller: Sehr gern.',
    questions: [
      {
        id: 'listening-a2-teil4-001-q1',
        statement: 'Wer gesund bleiben will, muss laut Frau Müller jeden Tag ins Fitnessstudio gehen.',
        correctAnswer: false,
        explanation:
          'Frau Müller sagt, dieser Glaube stimme nicht. Schon dreißig Minuten Spazierengehen pro Tag seien genug.',
        type: 'true_false'
      },
      {
        id: 'listening-a2-teil4-001-q2',
        statement: 'Ein halbstündiger Spaziergang am Tag reicht schon aus.',
        correctAnswer: true,
        explanation:
          "Das ist eine Umschreibung ihrer Aussage: 'Schon dreißig Minuten Spazierengehen pro Tag sind völlig genug.'",
        type: 'true_false'
      },
      {
        id: 'listening-a2-teil4-001-q3',
        statement: 'Die meisten Deutschen bewegen sich ausreichend.',
        correctAnswer: false,
        explanation:
          "Das Gegenteil ist gemeint: Frau Müller sagt 'Leider nein' und betont, dass sich viele viel zu wenig bewegen.",
        type: 'true_false'
      },
      {
        id: 'listening-a2-teil4-001-q4',
        statement: 'Für mehr Bewegung braucht man keine teure Ausrüstung.',
        correctAnswer: true,
        explanation: 'Frau Müller erklärt, Laufen und Spazierengehen kosteten nichts und man brauche keine teure Ausrüstung.',
        type: 'true_false'
      },
      {
        id: 'listening-a2-teil4-001-q5',
        statement: 'Ältere Menschen sollten besser keinen Sport mehr treiben.',
        correctAnswer: false,
        explanation:
          'Das ist das Gegenteil ihrer Aussage. Sie sagt, gerade ältere Menschen sollten aktiv bleiben; es sei nie zu spät anzufangen.',
        type: 'true_false'
      }
    ]
  }
]

export const defaultListeningTopics: ListeningA2Exercise[] = listeningSeedsWithoutAudio.map(
  (exercise) => {
    const audio = buildSeedListeningAudioMap(exercise)
    return audio ? { ...exercise, audio } : exercise
  },
)

/**
 * Dedicated Set 1 exercises. The audio map deliberately references the bundled
 * seed WAVs, so the first mock set remains usable offline without duplicating
 * identical binary assets.
 */
export const mockExamListeningTopics: ListeningA2Exercise[] = defaultListeningTopics.map(
  (exercise): ListeningA2Exercise => ({
    ...exercise,
    id: `mock-a2-set1-listening-teil${exercise.testingPart}`,
    title: `Modellprüfung Set 1 · ${exercise.title}`,
    examOnly: true,
  }),
)

export const allDefaultListeningTopics: ListeningA2Exercise[] = [
  ...defaultListeningTopics,
  ...mockExamListeningTopics,
]
