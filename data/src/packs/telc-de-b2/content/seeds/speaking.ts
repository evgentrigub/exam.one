/** Original app-authored telc Deutsch B2 practice content; not official examination material. */

export interface ExperienceTopic {
  theme: string
  report: string
  questions: [string, string]
  partner: string
}

/** One of the seven fixed telc topics: a report, two partner questions, the partner's report. */
export function experienceOption(id: string, topic: ExperienceTopic): Record<string, unknown> {
  return {
    id,
    theme: topic.theme,
    cards: [
      { segment: 'present', kind: 'presentation', topic: topic.theme, cue: topic.report },
      { segment: 'answer1', kind: 'answer', topic: topic.theme, cue: topic.questions[0] },
      { segment: 'answer2', kind: 'answer', topic: topic.theme, cue: topic.questions[1] },
      {
        segment: 'ask',
        kind: 'ask',
        topic: 'Bericht der Partnerin / des Partners',
        cue: `${topic.partner} Reagieren Sie auf den Bericht und stellen Sie ein oder zwei Fragen.`,
      },
    ],
  }
}

const REPORT =
  'Berichten Sie höchstens anderthalb Minuten. Sie können zum Beispiel erzählen, wann und wo das war, was genau passiert ist, was Sie dabei gedacht oder gefühlt haben und was Sie heute darüber denken.'

const practiceTopics: ExperienceTopic[] = [
  {
    theme: 'Ein Buch',
    report: `Erzählen Sie von einem Buch, das Sie beeindruckt hat. ${REPORT}`,
    questions: [
      'Partner: Liest du lieber gedruckte Bücher oder auf dem Bildschirm? Warum?',
      'Partner: Würdest du dir auch die Verfilmung von dem Buch ansehen?',
    ],
    partner:
      'Ihr Partner erzählt: Er hat einen langen Roman über eine Familie in Hamburg gelesen. Am Anfang fand er ihn langweilig, aber nach hundert Seiten konnte er nicht mehr aufhören.',
  },
  {
    theme: 'Ein Film',
    report: `Erzählen Sie von einem Film, der Ihnen besonders gut oder gar nicht gefallen hat. ${REPORT}`,
    questions: [
      'Partner: Gehst du lieber ins Kino oder schaust du Filme zu Hause?',
      'Partner: Mit wem hast du den Film gesehen, und wie fanden die anderen ihn?',
    ],
    partner:
      'Ihre Partnerin erzählt: Sie hat in einem kleinen Kino einen Dokumentarfilm über Bienen gesehen. Danach hat sie angefangen, auf ihrem Balkon Blumen für Insekten zu pflanzen.',
  },
  {
    theme: 'Eine Reise',
    report: `Erzählen Sie von einer Reise, an die Sie sich gern oder ungern erinnern. ${REPORT}`,
    questions: [
      'Partner: Planst du Reisen lieber genau oder entscheidest du spontan?',
      'Partner: Würdest du noch einmal an diesen Ort fahren?',
    ],
    partner:
      'Ihr Partner erzählt: Er ist mit dem Nachtzug nach Wien gefahren. Der Zug hatte vier Stunden Verspätung, aber er hat im Speisewagen sehr nette Leute kennengelernt.',
  },
  {
    theme: 'Ein Musikereignis',
    report: `Erzählen Sie von einem Konzert, einem Festival oder einem anderen Musikereignis. ${REPORT}`,
    questions: [
      'Partner: Hörst du Musik lieber live oder zu Hause? Warum?',
      'Partner: Machst du selbst Musik oder hast du es einmal versucht?',
    ],
    partner:
      'Ihre Partnerin erzählt: Sie war bei einem Open-Air-Konzert, bei dem es die ganze Zeit geregnet hat. Trotzdem war die Stimmung so gut, dass alle bis zum Schluss geblieben sind.',
  },
  {
    theme: 'Ein Sportereignis',
    report: `Erzählen Sie von einem Sportereignis, das Sie erlebt oder an dem Sie teilgenommen haben. ${REPORT}`,
    questions: [
      'Partner: Treibst du selbst regelmäßig Sport?',
      'Partner: Ist es dir wichtig, live dabei zu sein, oder reicht dir das Fernsehen?',
    ],
    partner:
      'Ihr Partner erzählt: Er ist zum ersten Mal einen Halbmarathon gelaufen. Nach fünfzehn Kilometern wollte er aufgeben, aber die Zuschauer am Rand haben ihn weiter motiviert.',
  },
  {
    theme: 'Eine wichtige Person',
    report: `Erzählen Sie von einer Person, die in Ihrem Leben wichtig war oder ist. ${REPORT}`,
    questions: [
      'Partner: Hast du heute noch Kontakt zu dieser Person?',
      'Partner: Was hast du von ihr gelernt, das dir heute noch hilft?',
    ],
    partner:
      'Ihre Partnerin erzählt: Ihre frühere Nachbarin hat ihr als Kind das Nähen beigebracht. Heute repariert sie fast alle ihre Kleidungsstücke selbst und hat sogar einen kleinen Kurs gegeben.',
  },
  {
    theme: 'Ein wichtiges Erlebnis',
    report: `Erzählen Sie von einem Erlebnis, das für Sie wichtig war. ${REPORT}`,
    questions: [
      'Partner: Hat dich das Erlebnis verändert?',
      'Partner: Würdest du heute in so einer Situation anders handeln?',
    ],
    partner:
      'Ihr Partner erzählt: Er hat nach dem Abitur ein Jahr in einem Kinderheim in Portugal gearbeitet. Dort hat er nicht nur Portugiesisch gelernt, sondern auch entschieden, Lehrer zu werden.',
  },
]

const practiceOptions = practiceTopics.map((topic, index) =>
  experienceOption(`topic${index + 1}`, topic)
)

export const speakingSeeds: Record<string, unknown>[] = [
  {
    id: 'telc-b2-practice-speaking-1',
    title: 'Über Erfahrungen sprechen',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    theme: 'Über Erfahrungen sprechen',
    topicType: 'monologue',
    cards: practiceOptions[0]!['cards'],
    topicOptions: practiceOptions,
  },
  {
    id: 'telc-b2-practice-speaking-2',
    title: 'Lebensmittel verschenken statt wegwerfen?',
    testingPart: 2,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    theme: 'Sollen Supermärkte Lebensmittel spenden müssen?',
    topicType: 'discussion',
    stimulus: {
      title: 'Gesetz gegen Verschwendung: Pflicht zur Spende für Supermärkte?',
      source: 'Zeitungsartikel (für die Übung verfasst)',
      content:
        'Jedes Jahr landen in Deutschland Millionen Tonnen Lebensmittel im Müll – ein beträchtlicher Teil davon im Handel. Joghurt kurz vor dem Mindesthaltbarkeitsdatum, Brot vom Vortag oder Obst mit kleinen Druckstellen ist oft noch völlig in Ordnung, wird aber trotzdem entsorgt. Einige Politikerinnen und Politiker fordern deshalb ein Gesetz, das große Supermärkte verpflichtet, unverkaufte, aber genießbare Lebensmittel an gemeinnützige Organisationen abzugeben.\nBefürworter verweisen auf Nachbarländer, in denen es solche Regeln bereits gibt. Dort seien die Spenden an Tafeln deutlich gestiegen, und Menschen mit wenig Geld profitierten unmittelbar davon. Außerdem sende ein Gesetz ein klares Signal: Lebensmittel seien zu wertvoll, um sie einfach wegzuwerfen.\nKritiker halten eine Pflicht dagegen für überflüssig. Viele Märkte arbeiteten schon heute freiwillig mit Tafeln zusammen. Ein Gesetz bringe vor allem mehr Bürokratie, denn die Waren müssten sortiert, gekühlt und abgeholt werden. Gerade kleinere Organisationen hätten dafür oft weder genug Fahrzeuge noch ausreichend Personal. Manche Händler befürchten zudem, für die Qualität gespendeter Ware haften zu müssen.\nUmweltverbände sehen das Problem ohnehin früher: Wer weniger bestelle und Preise vor Ladenschluss senke, müsse am Ende auch weniger verschenken. Sie fordern daher, dass auch Verbraucherinnen und Verbraucher ihr Einkaufsverhalten überdenken.',
    },
    cards: [
      {
        segment: 'summary',
        kind: 'presentation',
        topic: 'Lebensmittel spenden',
        cue: 'Fassen Sie die wichtigsten Argumente des Textes in höchstens einer Minute zusammen. Sagen Sie noch nicht Ihre eigene Meinung.',
      },
      {
        segment: 'turn1',
        kind: 'answer',
        topic: 'Lebensmittel spenden',
        cue: 'Partner: Ich finde so ein Gesetz übertrieben. Die Supermärkte spenden doch schon freiwillig. Was meinst du dazu?',
      },
      {
        segment: 'turn2',
        kind: 'answer',
        topic: 'Lebensmittel spenden',
        cue: 'Partner: Wie ist das in deinem Heimatland? Wird dort auch so viel weggeworfen, und gibt es Organisationen wie die Tafeln?',
      },
      {
        segment: 'turn3',
        kind: 'answer',
        topic: 'Lebensmittel spenden',
        cue: 'Partner: Vielleicht können wir uns auf einen Mittelweg einigen. Was wäre für dich eine gute Lösung?',
      },
    ],
  },
  {
    id: 'telc-b2-practice-speaking-3',
    title: 'Abschiedsfeier für einen Kollegen',
    testingPart: 3,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    theme: 'Eine Abschiedsfeier planen',
    topicType: 'planning',
    stimulus: {
      title: 'Situation',
      content:
        'Ein Kollege aus Ihrem Team geht nach zwölf Jahren in Rente. Sie und Ihre Partnerin oder Ihr Partner möchten für ihn eine kleine Abschiedsfeier organisieren. Überlegen Sie gemeinsam: Wann und wo soll die Feier stattfinden? Wer wird eingeladen? Was gibt es zu essen und zu trinken? Was schenken Sie ihm? Wer übernimmt welche Aufgaben?',
    },
    cards: [
      {
        segment: 'turn1',
        kind: 'ask',
        topic: 'Abschiedsfeier',
        cue: 'Eröffnen Sie das Gespräch: Machen Sie erste Vorschläge zu Termin und Ort der Feier und fragen Sie nach der Meinung Ihres Partners.',
      },
      {
        segment: 'turn2',
        kind: 'answer',
        topic: 'Abschiedsfeier',
        cue: 'Partner: Freitagnachmittag finde ich gut. Aber unser Besprechungsraum ist viel zu klein für alle. Hast du eine andere Idee?',
      },
      {
        segment: 'turn3',
        kind: 'answer',
        topic: 'Abschiedsfeier',
        cue: 'Partner: Und was schenken wir ihm? Das Budget ist knapp – jeder kann vielleicht zehn Euro geben.',
      },
      {
        segment: 'turn4',
        kind: 'answer',
        topic: 'Abschiedsfeier',
        cue: 'Partner: Gut, dann haben wir fast alles. Kannst du noch einmal zusammenfassen, wer was erledigt?',
      },
    ],
  },
]
