/** Original app-authored telc Deutsch B2 mock Set 1 content (exam-only); not official examination material. */
import { experienceOption, type ExperienceTopic } from './speaking'

const REPORT =
  'Berichten Sie höchstens anderthalb Minuten: Wann und wo war das? Was ist passiert? Warum ist Ihnen das in Erinnerung geblieben?'

const topics: ExperienceTopic[] = [
  {
    theme: 'Ein Buch',
    report: `Erzählen Sie von einem Buch, das Sie gern gelesen oder abgebrochen haben. ${REPORT}`,
    questions: [
      'Partner: Wie findest du normalerweise neue Bücher – durch Empfehlungen oder zufällig?',
      'Partner: Hast du das Buch jemandem weiterempfohlen?',
    ],
    partner:
      'Ihre Partnerin erzählt: Sie hat ein Sachbuch über Schlaf gelesen. Seitdem schaltet sie abends ihr Handy eine Stunde vor dem Schlafengehen aus und fühlt sich morgens viel fitter.',
  },
  {
    theme: 'Ein Film',
    report: `Erzählen Sie von einem Film, über den Sie lange nachgedacht haben. ${REPORT}`,
    questions: [
      'Partner: Schaust du Filme lieber in der Originalsprache oder synchronisiert?',
      'Partner: Hat der Film deine Meinung zu einem Thema verändert?',
    ],
    partner:
      'Ihr Partner erzählt: Er hat bei einem Filmfestival einen Kurzfilm aus seiner Heimatstadt gesehen. Der Regisseur war im Saal, und danach gab es eine lange Diskussion mit dem Publikum.',
  },
  {
    theme: 'Eine Reise',
    report: `Erzählen Sie von einer Reise, bei der etwas Unerwartetes passiert ist. ${REPORT}`,
    questions: [
      'Partner: Reist du lieber allein oder mit anderen?',
      'Partner: Was nimmst du auf jede Reise mit?',
    ],
    partner:
      'Ihre Partnerin erzählt: Sie wollte eine Woche wandern, aber schon am zweiten Tag hat sie sich den Fuß verletzt. Am Ende hat sie in einem kleinen Dorf einen Töpferkurs gemacht.',
  },
  {
    theme: 'Ein Musikereignis',
    report: `Erzählen Sie von einem Musikereignis, das Ihnen in Erinnerung geblieben ist. ${REPORT}`,
    questions: [
      'Partner: Welche Rolle spielt Musik in deinem Alltag?',
      'Partner: Würdest du für ein Konzert auch in eine andere Stadt fahren?',
    ],
    partner:
      'Ihr Partner erzählt: Er hat bei einem Chorprojekt mit über zweihundert Laiensängern mitgemacht. Die Proben waren anstrengend, aber das Abschlusskonzert war für ihn ein Höhepunkt des Jahres.',
  },
  {
    theme: 'Ein Sportereignis',
    report: `Erzählen Sie von einem Sportereignis, bei dem Sie Zuschauer oder Teilnehmer waren. ${REPORT}`,
    questions: [
      'Partner: Welche Sportarten sind in deinem Heimatland besonders beliebt?',
      'Partner: Findest du, dass Profisportler zu viel Geld verdienen?',
    ],
    partner:
      'Ihre Partnerin erzählt: Ihre Tochter hat bei einem Schwimmwettkampf zum ersten Mal eine Medaille gewonnen. Die ganze Familie stand am Beckenrand und hat so laut gejubelt, dass alle gelacht haben.',
  },
  {
    theme: 'Eine wichtige Person',
    report: `Erzählen Sie von einem Menschen, der Sie in einer wichtigen Phase unterstützt hat. ${REPORT}`,
    questions: [
      'Partner: Wie habt ihr euch kennengelernt?',
      'Partner: Unterstützt du heute selbst jemanden auf ähnliche Weise?',
    ],
    partner:
      'Ihr Partner erzählt: Sein erster Chef hat ihm viel Verantwortung gegeben, obwohl er noch sehr jung war. Dadurch hat er gelernt, Entscheidungen zu treffen und auch Fehler zuzugeben.',
  },
  {
    theme: 'Ein wichtiges Erlebnis',
    report: `Erzählen Sie von einem Erlebnis, auf das Sie stolz sind. ${REPORT}`,
    questions: [
      'Partner: Wer hat dich damals unterstützt?',
      'Partner: Was würdest du anderen raten, die etwas Ähnliches vorhaben?',
    ],
    partner:
      'Ihre Partnerin erzählt: Sie hat mit vierzig Jahren den Führerschein gemacht. Beim ersten Versuch ist sie durchgefallen, beim zweiten hat es geklappt, und heute fährt sie jeden Tag zur Arbeit.',
  },
]

const options = topics.map((topic, index) => experienceOption(`topic${index + 1}`, topic))

export const mockSpeakingSeeds: Record<string, unknown>[] = [
  {
    id: 'telc-b2-mock-speaking-1',
    title: 'Über Erfahrungen sprechen',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    theme: 'Über Erfahrungen sprechen',
    topicType: 'monologue',
    cards: options[0]!['cards'],
    topicOptions: options,
  },
  {
    id: 'telc-b2-mock-speaking-2',
    title: 'Handys in der Schule',
    testingPart: 2,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    theme: 'Sollen Handys in Schulen verboten werden?',
    topicType: 'discussion',
    stimulus: {
      title: 'Handyverbot an Schulen: Schutz oder Bevormundung?',
      source: 'Zeitungsartikel (für die Übung verfasst)',
      content:
        'Immer mehr Schulen in Europa verbieten Smartphones während des Unterrichts und in den Pausen. Auch hierzulande wird darüber heftig gestritten. Eine Gesamtschule in Norddeutschland hat das Verbot vor zwei Jahren eingeführt und zieht eine positive Bilanz: Die Schülerinnen und Schüler sprächen in den Pausen wieder mehr miteinander, spielten auf dem Schulhof und könnten sich im Unterricht besser konzentrieren. Auch Fälle von Mobbing über soziale Netzwerke seien seltener geworden.\nKritiker halten ein generelles Verbot jedoch für den falschen Weg. Jugendliche müssten lernen, verantwortungsvoll mit digitalen Medien umzugehen, und das gelinge nicht, wenn man die Geräte einfach wegschließe. Viele Lehrkräfte nutzen Smartphones außerdem gezielt im Unterricht, etwa für Umfragen, Recherchen oder Vokabel-Apps. Eltern wiederum wünschen sich häufig, ihre Kinder auf dem Schulweg oder bei Notfällen erreichen zu können.\nZwischen den beiden Positionen gibt es zahlreiche Kompromisse: Manche Schulen erlauben Handys nur in bestimmten Räumen, andere erst ab einer bestimmten Klassenstufe. Wieder andere erarbeiten gemeinsam mit der Schülervertretung Regeln, die regelmäßig überprüft werden. Fachleute betonen, dass Verbote allein wenig bewirken, wenn nicht auch im Unterricht über Medienkompetenz gesprochen wird.',
    },
    cards: [
      {
        segment: 'summary',
        kind: 'presentation',
        topic: 'Handys in der Schule',
        cue: 'Fassen Sie die wichtigsten Argumente des Textes in höchstens einer Minute zusammen. Sagen Sie noch nicht Ihre eigene Meinung.',
      },
      {
        segment: 'turn1',
        kind: 'answer',
        topic: 'Handys in der Schule',
        cue: 'Partner: Ich bin klar für ein Verbot. Kinder sitzen sowieso schon viel zu lange vor dem Bildschirm. Siehst du das auch so?',
      },
      {
        segment: 'turn2',
        kind: 'answer',
        topic: 'Handys in der Schule',
        cue: 'Partner: Wie war das an deiner Schule oder wie ist es heute in deinem Heimatland?',
      },
      {
        segment: 'turn3',
        kind: 'answer',
        topic: 'Handys in der Schule',
        cue: 'Partner: Was hältst du von Regeln, die Schüler und Lehrer gemeinsam festlegen? Wie könnten solche Regeln konkret aussehen?',
      },
    ],
  },
  {
    id: 'telc-b2-mock-speaking-3',
    title: 'Ausflug zum Kursende',
    testingPart: 3,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    theme: 'Einen Kursausflug planen',
    topicType: 'planning',
    stimulus: {
      title: 'Situation',
      content:
        'Ihr Deutschkurs endet in drei Wochen. Zum Abschluss möchte die Gruppe einen gemeinsamen Tagesausflug machen. Sie und Ihre Partnerin oder Ihr Partner sollen ihn planen. Überlegen Sie gemeinsam: Wohin soll der Ausflug gehen? Wie reisen Sie an? Was kostet der Ausflug und wer bezahlt was? Was machen Sie, wenn das Wetter schlecht ist? Wer übernimmt welche Aufgaben?',
    },
    cards: [
      {
        segment: 'turn1',
        kind: 'ask',
        topic: 'Kursausflug',
        cue: 'Eröffnen Sie das Gespräch: Schlagen Sie ein Ziel für den Ausflug vor, begründen Sie Ihren Vorschlag und fragen Sie Ihre Partnerin nach ihrer Meinung.',
      },
      {
        segment: 'turn2',
        kind: 'answer',
        topic: 'Kursausflug',
        cue: 'Partner: Die Idee gefällt mir, aber die Fahrt dorthin ist ziemlich teuer. Nicht alle im Kurs haben viel Geld. Was machen wir da?',
      },
      {
        segment: 'turn3',
        kind: 'answer',
        topic: 'Kursausflug',
        cue: 'Partner: Und wenn es an dem Tag regnet? Wir brauchen auf jeden Fall einen Plan B.',
      },
      {
        segment: 'turn4',
        kind: 'answer',
        topic: 'Kursausflug',
        cue: 'Partner: Gut, ich glaube, wir sind fertig. Fasst du bitte noch einmal zusammen, was wir beschlossen haben und wer was macht?',
      },
    ],
  },
]
