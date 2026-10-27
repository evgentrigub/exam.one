/** Original app-authored telc Deutsch B2 mock Set 1 content (exam-only); not official examination material. */

const M1 = 'telc-b2-mock-reading-1'
const M1_HEADLINES = [
  'a · Schulessen wird teurer: Eltern protestieren',
  'b · Auf dem Rad zur Arbeit: länger unterwegs, aber entspannter',
  'c · Bus auf Bestellung: Auf dem Land steigen wieder mehr Menschen ein',
  'd · E-Roller-Anbieter ziehen sich aus der Innenstadt zurück',
  'e · Großer Andrang: Fördergeld für Reparaturen fast aufgebraucht',
  'f · Dorfbewohner kämpfen für den Erhalt ihrer Bahnstrecke',
  'g · Schluss mit Rollern auf dem Gehweg: Feste Parkzonen eingeführt',
  'h · Immer mehr Elektrogeräte gehen kurz nach Ende der Garantie kaputt',
  'i · Wer selbst entscheidet, wie viel auf den Teller kommt, lässt weniger übrig',
  'j · Neue Radwege: Autofahrer fürchten längere Staus',
]

const M2 = 'telc-b2-mock-reading-2'

const M3 = 'telc-b2-mock-reading-3'
const M3_ADS = [
  'a · Fitnesswerk – Bootcamp im Park',
  'b · Grundschule am Weiher – Lesepaten gesucht',
  'c · Kinderkleiderbasar St. Paul',
  'd · Fahrschule Kurvenreich',
  'e · Gemeinschaftsgarten Wurzelwerk',
  'f · Lernbrücke – Online-Nachhilfe',
  'g · Gesundheitszentrum Sonnenhang',
  'h · Kochschule Grünzeug',
  'i · Babysitter-Vermittlung Kleine Hände',
  'j · Umweltamt – Handysammlung',
  'k · Lernstudio Abc',
  'l · Stadtwerke Talheim – Energieberatung',
  'x · Keine passende Anzeige',
]

const M4 = 'telc-b2-mock-reading-4'

const M5 = 'telc-b2-mock-reading-5'
const M5_BANK = [
  'abgeben',
  'abholen',
  'aufmerksam',
  'aufmerksamer',
  'aufnehmen',
  'erfahren',
  'Fazit',
  'Gesetz',
  'gewohnt',
  'gewöhnt',
  'machen',
  'nehmen',
  'Regelung',
  'schenken',
  'umzugehen',
]

export const mockReadingSeeds: Record<string, unknown>[] = [
  {
    id: M1,
    title: 'Unterwegs und Einkaufen: Meldungen aus der Region',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      '1 · Jahrelang fuhren die Linienbusse im Landkreis Hohenstein oft fast leer durch die Dörfer – zu festen Zeiten, die kaum jemandem passten. Seit einem Jahr gibt es stattdessen einen sogenannten Rufbus. Fahrgäste bestellen ihn per App oder Telefon mindestens eine Stunde im Voraus, und ein Kleinbus holt sie an einer Haltestelle in ihrer Nähe ab. Der Fahrpreis entspricht einem normalen Busticket. Das Angebot kommt offenbar gut an: Die Zahl der Fahrgäste hat sich im Vergleich zum alten Linienverkehr mehr als verdreifacht. Besonders ältere Menschen ohne Auto und Jugendliche nutzen den Rufbus, etwa für Arztbesuche oder den Weg zum Sportverein. Der Landkreis will das Modell nun auf weitere Gemeinden ausweiten.\n' +
      '2 · Rund ein Drittel des Mittagessens landete in der Mensa des Schulzentrums Am Kapellenberg in Weidenau früher im Müll. Seit Beginn des Schuljahres dürfen die Schülerinnen und Schüler an der Essensausgabe selbst sagen, ob sie eine kleine, mittlere oder große Portion möchten. Wer danach noch Hunger hat, kann sich kostenlos einen Nachschlag holen. Das Ergebnis überrascht selbst Küchenleiterin Anja Brehm: Die Menge an Essensresten ist um mehr als die Hälfte gesunken. „Früher bekamen alle das Gleiche, egal ob sie Hunger hatten oder nicht“, sagt sie. Der Preis für ein Mittagessen ist trotz der Umstellung gleich geblieben. Inzwischen haben sich mehrere Schulen aus der Region bei ihr gemeldet, um das System zu übernehmen.\n' +
      '3 · Kreuz und quer abgestellte E-Roller auf Gehwegen sorgen in Bad Lennstein seit Langem für Ärger. Vor allem Menschen mit Kinderwagen, Rollstuhl oder Sehbehinderung beschwerten sich immer wieder bei der Stadt. Nun hat der Stadtrat reagiert: In der Innenstadt dürfen die Roller ab dem 1. Juni nur noch an rund 80 markierten Abstellflächen geparkt werden. Wer seine Fahrt woanders beendet, zahlt eine Gebühr, die der Anbieter direkt vom Konto abbucht. Die drei Verleihfirmen, die in der Stadt aktiv sind, haben der Regelung zugestimmt und bleiben weiterhin im Zentrum vertreten. Außerhalb der Innenstadt ändert sich vorerst nichts. Nach einem halben Jahr will die Stadt prüfen, ob die Gehwege tatsächlich freier geworden sind.\n' +
      '4 · Kaputte Waschmaschine, defekter Toaster, Handy mit gesprungenem Display: Wer in Altenmarkt ein Elektrogerät reparieren lässt, statt es wegzuwerfen, bekommt seit März die Hälfte der Kosten erstattet – bis zu 100 Euro pro Gerät. Mit dem sogenannten Reparaturbonus will die Stadt Müll vermeiden und örtliche Werkstätten unterstützen. Die Nachfrage ist jedoch weit größer als erwartet. Schon nach sechs Wochen waren fast 90 Prozent der bereitgestellten 50.000 Euro vergeben, und viele Werkstätten berichten von langen Wartezeiten. Der Stadtrat prüft nun, ob zusätzliches Geld zur Verfügung gestellt werden kann. Bis zu einer Entscheidung werden neue Anträge nur noch auf eine Warteliste gesetzt.\n' +
      '5 · Wer mit dem Fahrrad zur Arbeit fährt, kommt dort in besserer Stimmung an – selbst wenn der Weg länger dauert als mit dem Auto. Zu diesem Ergebnis kommt eine Studie der Hochschule Kirchrode, für die über 1.500 Berufstätige mehrere Wochen lang ein Pendeltagebuch führten. Radfahrerinnen und Radfahrer bewerteten ihren Arbeitsweg deutlich positiver und fühlten sich bei der Ankunft weniger gestresst als Autofahrer, die häufig über Staus und Parkplatzsuche klagten. Interessanterweise galt das auch für Strecken von über zehn Kilometern. Die Forschenden vermuten, dass vor allem die Bewegung an der frischen Luft und das Gefühl, unabhängig vom Verkehr zu sein, eine Rolle spielen.',
    questions: [
      {
        id: `${M1}-q1`,
        textId: M1,
        question: 'Text 1',
        options: M1_HEADLINES,
        correctAnswer: 2,
        explanation:
          'Seit es den Rufbus gibt, „hat sich die Zahl der Fahrgäste … mehr als verdreifacht“. Um eine Bahnstrecke (f) geht es nicht.',
        type: 'matching',
      },
      {
        id: `${M1}-q2`,
        textId: M1,
        question: 'Text 2',
        options: M1_HEADLINES,
        correctAnswer: 8,
        explanation:
          'Die Kinder wählen ihre Portionsgröße selbst, und die Essensreste sind „um mehr als die Hälfte gesunken“. Der Preis ist gleich geblieben, daher passt a nicht.',
        type: 'matching',
      },
      {
        id: `${M1}-q3`,
        textId: M1,
        question: 'Text 3',
        options: M1_HEADLINES,
        correctAnswer: 6,
        explanation:
          'Die Roller dürfen in der Innenstadt nur noch auf markierten Abstellflächen parken. Die Anbieter ziehen sich nicht zurück (d), sondern „bleiben weiterhin im Zentrum vertreten“.',
        type: 'matching',
      },
      {
        id: `${M1}-q4`,
        textId: M1,
        question: 'Text 4',
        options: M1_HEADLINES,
        correctAnswer: 4,
        explanation:
          'Wegen der großen Nachfrage waren nach sechs Wochen „fast 90 Prozent“ des Geldes vergeben. Über die Haltbarkeit von Geräten (h) sagt der Text nichts.',
        type: 'matching',
      },
      {
        id: `${M1}-q5`,
        textId: M1,
        question: 'Text 5',
        options: M1_HEADLINES,
        correctAnswer: 1,
        explanation:
          'Radpendler fühlen sich „weniger gestresst“, auch wenn der Weg länger dauert. Staus werden nur als Klage der Autofahrer erwähnt, neue Radwege (j) gar nicht.',
        type: 'matching',
      },
    ],
    textType: 'article',
    wordCount: 540,
    estimatedReadingTime: 20,
    topics: ['Mobilität', 'Konsum', 'Umwelt'],
  },
  {
    id: M2,
    title: 'Zwei Sprachen, ein Kopf: Was Mehrsprachigkeit für Kinder bedeutet',
    testingPart: 2,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'Zwei Sprachen, ein Kopf: Was Mehrsprachigkeit für Kinder bedeutet\n' +
      'Noch vor wenigen Jahrzehnten bekamen Eltern, die ihre Kinder mit zwei Sprachen großziehen wollten, häufig einen gut gemeinten Rat: Sie sollten sich lieber auf eine Sprache konzentrieren, um das Kind nicht zu verwirren. Kinderärzte und Lehrkräfte befürchteten, dass mehrsprachige Kinder keine der Sprachen richtig lernen würden. Heute sieht die Forschung das völlig anders. „Das kindliche Gehirn ist problemlos in der Lage, zwei oder sogar drei Sprachen gleichzeitig zu erwerben“, sagt die Sprachwissenschaftlerin Prof. Hannah Seidel von der Universität Elmshagen, die seit zwanzig Jahren mehrsprachige Familien begleitet.\n' +
      'Dass mehrsprachige Kinder anfangs manchmal etwas später zu sprechen beginnen oder Wörter aus beiden Sprachen in einem Satz mischen, ist nach Seidels Erfahrung kein Grund zur Sorge. Im Gegenteil: Das Mischen zeige, dass das Kind kreativ mit seinen sprachlichen Mitteln umgehe. Spätestens im Grundschulalter trennten die meisten Kinder die Sprachen ganz selbstverständlich. Wichtig sei allerdings, dass ein Kind jede Sprache regelmäßig und in vielfältigen Situationen höre. Eltern sollten das Mischen auch nicht ständig korrigieren, sondern einfach selbst in der jeweiligen Sprache antworten. Wer eine Sprache nur am Wochenende oder nur beim Telefonat mit den Großeltern erlebe, entwickle darin meist nur einen kleinen Wortschatz.\n' +
      'Viele Familien folgen deshalb der Regel „eine Person – eine Sprache“: Die Mutter spricht zum Beispiel konsequent Türkisch, der Vater Deutsch. Seidel hält dieses Modell für hilfreich, aber nicht für zwingend. Entscheidend sei weniger eine strenge Regel als die Qualität der Gespräche. „Eltern sollten mit ihrem Kind in der Sprache reden, in der sie sich am wohlsten fühlen und ihre Gefühle am besten ausdrücken können“, betont sie. Ein Vater, der sich zwingt, mit seinem Kind in einer Sprache zu sprechen, die er selbst nur unsicher beherrscht, gebe ihm damit oft weniger, als er glaubt.\n' +
      'Über die Vorteile der Mehrsprachigkeit wird in der Wissenschaft allerdings noch gestritten. Einige Studien deuteten darauf hin, dass mehrsprachige Kinder sich besser konzentrieren und schneller zwischen Aufgaben wechseln können, weil ihr Gehirn ständig zwischen zwei Systemen auswählen muss. Neuere Untersuchungen mit größeren Gruppen konnten diesen Effekt jedoch nicht immer bestätigen. Manche Fachleute vermuten, dass früher vor allem Studien mit positiven Ergebnissen veröffentlicht wurden. Unbestritten ist dagegen der praktische Nutzen: Wer mehrere Sprachen spricht, kann sich mit mehr Menschen verständigen, hat oft bessere Chancen auf dem Arbeitsmarkt und lernt später weitere Fremdsprachen leichter.\n' +
      'Ein Problem sehen Fachleute eher im Umgang der Gesellschaft mit bestimmten Sprachen. Während Eltern, die mit ihren Kindern Englisch oder Französisch sprechen, häufig bewundert werden, erleben Familien mit Arabisch, Polnisch oder Russisch nicht selten das Gegenteil. Manche Kinder schämen sich dann für die Sprache ihrer Eltern und weigern sich irgendwann, sie zu sprechen. Seidel plädiert daher dafür, dass Kitas und Schulen Herkunftssprachen sichtbar wertschätzen – etwa durch mehrsprachige Bücher, Lieder oder Elternabende mit Dolmetschern.\n' +
      'In einigen Bundesländern gibt es inzwischen Schulen, an denen zusätzlich Unterricht in der Familiensprache angeboten wird. Die Nachfrage ist groß, doch es fehlt an qualifizierten Lehrkräften. Manche Eltern organisieren deshalb private Gruppen, in denen sich Kinder am Wochenende in ihrer Familiensprache treffen. Für Eltern hat Seidel deshalb einen einfachen Tipp: Gemeinsames Vorlesen, Singen und Erzählen in der Familiensprache sei durch keinen Kurs zu ersetzen. „Kinder lernen eine Sprache nicht, weil sie müssen, sondern weil sie mit Menschen verbunden ist, die ihnen wichtig sind.“',
    questions: [
      {
        id: `${M2}-q1`,
        textId: M2,
        question: 'Was rieten Fachleute Eltern früher?',
        options: [
          'Sie sollten erst nach dem dritten Lebensjahr eine zweite Sprache mit dem Kind sprechen.',
          'Sie sollten sich bei der Erziehung auf eine einzige Sprache beschränken.',
          'Sie sollten sich von Sprachwissenschaftlern beraten lassen.',
        ],
        correctAnswer: 1,
        explanation:
          'Eltern bekamen früher den Rat, sie „sollten sich lieber auf eine Sprache konzentrieren, um das Kind nicht zu verwirren“. Ein bestimmtes Alter wird nicht genannt.',
        type: 'selection',
      },
      {
        id: `${M2}-q2`,
        textId: M2,
        question: 'Wie bewertet Prof. Seidel es, wenn Kinder Wörter aus beiden Sprachen mischen?',
        options: [
          'Als Zeichen dafür, dass das Kind keine der beiden Sprachen richtig beherrscht.',
          'Als Problem, das spätestens in der Grundschule behandelt werden muss.',
          'Als normalen und sogar kreativen Umgang mit der Sprache.',
        ],
        correctAnswer: 2,
        explanation:
          'Das Mischen ist „kein Grund zur Sorge“; es zeige, dass das Kind „kreativ mit seinen sprachlichen Mitteln umgehe“. Im Grundschulalter trennen die Kinder die Sprachen von selbst.',
        type: 'selection',
      },
      {
        id: `${M2}-q3`,
        textId: M2,
        question: 'Was ist nach Seidel bei der Sprachwahl in der Familie am wichtigsten?',
        options: [
          'Dass Eltern die Sprache sprechen, in der sie sich am besten ausdrücken können.',
          'Dass jedes Elternteil streng bei einer einzigen Sprache bleibt.',
          'Dass Eltern mit dem Kind vor allem die Landessprache üben.',
        ],
        correctAnswer: 0,
        explanation:
          'Seidel hält die Regel „eine Person – eine Sprache“ für „nicht zwingend“; Eltern sollten die Sprache wählen, in der sie „ihre Gefühle am besten ausdrücken können“.',
        type: 'selection',
      },
      {
        id: `${M2}-q4`,
        textId: M2,
        question: 'Was sagt der Text über die Vorteile der Mehrsprachigkeit?',
        options: [
          'Neuere Studien haben bewiesen, dass mehrsprachige Kinder sich besser konzentrieren.',
          'Ein Vorteil bei der Konzentration ist umstritten, praktische Vorteile gelten aber als sicher.',
          'Mehrsprachige Menschen haben später oft Schwierigkeiten, weitere Sprachen zu lernen.',
        ],
        correctAnswer: 1,
        explanation:
          'Neuere Untersuchungen konnten den Konzentrationseffekt „nicht immer bestätigen“, „unbestritten“ ist dagegen der praktische Nutzen, etwa auf dem Arbeitsmarkt.',
        type: 'selection',
      },
      {
        id: `${M2}-q5`,
        textId: M2,
        question: 'Welches gesellschaftliche Problem beschreibt der Text?',
        options: [
          'Manche Sprachen werden weniger geschätzt, sodass Kinder sie manchmal ablehnen.',
          'Kitas weigern sich, mehrsprachige Bücher anzuschaffen.',
          'In vielen Familien wird immer seltener Englisch oder Französisch gesprochen.',
        ],
        correctAnswer: 0,
        explanation:
          'Familien mit Arabisch, Polnisch oder Russisch erleben oft wenig Anerkennung; manche Kinder „schämen sich dann für die Sprache ihrer Eltern“. Mehrsprachige Bücher schlägt Seidel als Lösung vor.',
        type: 'selection',
      },
    ],
    textType: 'article',
    wordCount: 541,
    estimatedReadingTime: 25,
    topics: ['Bildung', 'Familie', 'Sprache'],
  },
  {
    id: M3,
    title: 'Kurse, Hilfe und Angebote vor Ort',
    testingPart: 3,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'a · Fitnesswerk – Bootcamp im Park: Bringen Sie sich in Rekordzeit in Form! Unser sechswöchiges Intensivtraining mit Sprints, Sprüngen und Kraftübungen fordert Sie bis an Ihre Grenzen. Dreimal pro Woche um 6.30 Uhr im Rosenpark, bei jedem Wetter. Geeignet für alle, die schon regelmäßig Sport treiben und eine neue Herausforderung suchen. Kosten: 89 Euro für den gesamten Kurs.\n' +
      'b · Grundschule am Weiher – Lesepaten gesucht: Viele unserer Kinder haben zu Hause kaum Gelegenheit, mit Erwachsenen zu lesen. Wer hat Lust, einmal pro Woche eine Stunde mit einem Kind gemeinsam Bücher zu lesen und darüber zu sprechen? Vorkenntnisse sind nicht nötig, wir bereiten Sie in einem kurzen Workshop vor. Die Tätigkeit ist ehrenamtlich. Wir freuen uns besonders über Seniorinnen und Senioren!\n' +
      'c · Kinderkleiderbasar St. Paul: Am Samstag, 14. März, verkaufen Eltern von 10 bis 13 Uhr im Gemeindehaus gut erhaltene Kinderkleidung in den Größen 50 bis 176, außerdem Spielzeug, Bücher und Kinderwagen. Alles zu kleinen Preisen! Für Schwangere öffnen wir bereits um 9.30 Uhr. Kaffee und Kuchen gibt es in der Cafeteria, der Erlös geht an den Kindergarten.\n' +
      'd · Fahrschule Kurvenreich: Führerschein trotz vollem Terminkalender? Kein Problem! Unseren Theorieunterricht bieten wir montags bis donnerstags von 18.30 bis 20 Uhr an, Fahrstunden sind auch abends und samstags möglich. Moderne Fahrzeuge, geduldige Fahrlehrerinnen und faire Preise. Jetzt neu: Lern-App für die Theorieprüfung inklusive. Besuchen Sie uns in der Bahnhofstraße 21.\n' +
      'e · Gemeinschaftsgarten Wurzelwerk: Gemeinsam gärtnern mitten in der Stadt! Auf unserer 2.000 Quadratmeter großen Fläche bauen wir Gemüse, Kräuter und Obst an. Eigene Beete oder Parzellen gibt es bei uns nicht – alles wird gemeinsam geplant, gepflegt und geerntet. Neue Mitgärtnerinnen und Mitgärtner sind jederzeit willkommen. Treffen jeden Samstag ab 10 Uhr, Werkzeug ist vorhanden.\n' +
      'f · Lernbrücke – Online-Nachhilfe: Schwierigkeiten in Mathe, Englisch oder Deutsch? Unsere erfahrenen Lehrkräfte unterstützen Schülerinnen und Schüler der Klassen 5 bis 13 per Videounterricht – bequem von zu Hause aus. Die Termine vereinbaren Sie flexibel, auch am Abend. Die erste Probestunde ist kostenlos. Danach zahlen Sie 22 Euro pro 45 Minuten, ohne lange Vertragsbindung.\n' +
      'g · Gesundheitszentrum Sonnenhang – Sanfter Wiedereinstieg: Sie hatten eine Operation oder Verletzung und möchten wieder aktiv werden? In unseren Kleingruppen trainieren Sie unter Anleitung von Physiotherapeuten Beweglichkeit, Kraft und Gleichgewicht – in Ihrem eigenen Tempo. Kurse dienstags und donnerstags vormittags. Viele Krankenkassen übernehmen einen Teil der Kosten. Bitte bringen Sie eine Bescheinigung Ihres Arztes mit.\n' +
      'h · Kochschule Grünzeug: Gemüse kann mehr! In unseren Wochenendkursen lernen Sie, abwechslungsreiche vegetarische Gerichte aus aller Welt zuzubereiten – vom indischen Curry bis zur italienischen Gemüselasagne. Die Kurse finden samstags von 11 bis 15 Uhr statt, das gemeinsame Essen ist inklusive. Preis: 65 Euro pro Person. Auch als Geschenkgutschein erhältlich.\n' +
      'i · Babysitter-Vermittlung Kleine Hände: Sie brauchen zuverlässige Betreuung für Ihr Kind? Wir vermitteln geprüfte Babysitterinnen und Babysitter mit Erste-Hilfe-Kurs für Kinder. Unsere Betreuungszeiten: montags bis freitags von 7 bis 18 Uhr. Für eine Vermittlungsgebühr von 20 Euro stellen wir Ihnen passende Personen vor. Rufen Sie uns an oder schreiben Sie uns eine E-Mail.\n' +
      'j · Umweltamt – Handysammlung: In alten Mobiltelefonen stecken wertvolle Rohstoffe wie Gold und Kupfer. Werfen Sie Ihr ausgedientes Gerät deshalb nicht in den Hausmüll! Bis Ende Mai können Sie alte Handys in allen Bürgerbüros abgeben. Funktionierende Geräte werden aufbereitet und an gemeinnützige Organisationen gespendet, defekte fachgerecht recycelt. Bitte löschen Sie vorher Ihre persönlichen Daten.\n' +
      'k · Lernstudio Abc: Ihr Kind hat Probleme beim Lesen, Schreiben oder Rechnen? In unserem freundlichen Lernstudio in der Kirchgasse fördern wir Grundschulkinder der Klassen 1 bis 4 in kleinen Gruppen. Hausaufgabenbetreuung gibt es täglich von 13 bis 17 Uhr. Wir arbeiten eng mit Eltern und Lehrkräften zusammen. Vereinbaren Sie gern ein kostenloses Beratungsgespräch.\n' +
      'l · Stadtwerke Talheim – Energieberatung: Hohe Heizkosten? Unsere Energieberaterinnen kommen zu Ihnen nach Hause, prüfen Fenster, Heizung und Stromverbrauch und zeigen Ihnen, wie Sie mit einfachen Mitteln Energie sparen können. Für alle Haushalte in Talheim ist die Beratung kostenlos – egal ob Sie zur Miete wohnen oder Eigentümer sind. Termine vereinbaren Sie telefonisch oder online.',
    questions: [
      {
        id: `${M3}-q1`,
        textId: M3,
        question:
          'Herr Becker, 68, möchte sich ehrenamtlich engagieren und Kindern beim Lesen helfen.',
        options: M3_ADS,
        correctAnswer: 1,
        explanation:
          'Die Grundschule sucht ehrenamtliche Lesepaten und freut sich „besonders über Seniorinnen und Senioren“.',
        type: 'matching',
      },
      {
        id: `${M3}-q2`,
        textId: M3,
        question:
          'Frau Wagner möchte wissen, wie sie in ihrer Mietwohnung Heizkosten sparen kann, ohne für die Beratung zu bezahlen.',
        options: M3_ADS,
        correctAnswer: 11,
        explanation:
          'Die Energieberatung der Stadtwerke ist kostenlos, „egal ob Sie zur Miete wohnen oder Eigentümer sind“.',
        type: 'matching',
      },
      {
        id: `${M3}-q3`,
        textId: M3,
        question:
          'Herr und Frau Hofmann suchen für Samstagabend jemanden, der auf ihre kleine Tochter aufpasst.',
        options: M3_ADS,
        correctAnswer: 12,
        explanation:
          'Die Babysitter-Vermittlung (i) betreut nur „montags bis freitags von 7 bis 18 Uhr“, also nicht am Samstagabend. Keine Anzeige passt.',
        type: 'matching',
      },
      {
        id: `${M3}-q4`,
        textId: M3,
        question:
          'Herr Peters sucht für seinen Sohn, der die neunte Klasse besucht, Mathenachhilfe im Internet.',
        options: M3_ADS,
        correctAnswer: 5,
        explanation:
          'Die Lernbrücke bietet Videounterricht für „Klassen 5 bis 13“. Das Lernstudio (k) arbeitet vor Ort und nur mit Grundschulkindern.',
        type: 'matching',
      },
      {
        id: `${M3}-q5`,
        textId: M3,
        question: 'Jana möchte am Wochenende lernen, fleischlose Gerichte zu kochen.',
        options: M3_ADS,
        correctAnswer: 7,
        explanation:
          'Die Kochschule bietet samstags Kurse für „vegetarische Gerichte aus aller Welt“ an.',
        type: 'matching',
      },
      {
        id: `${M3}-q6`,
        textId: M3,
        question:
          'Frau Schulz möchte nach einer Knieoperation vorsichtig wieder mit Bewegung beginnen.',
        options: M3_ADS,
        correctAnswer: 6,
        explanation:
          'Das Gesundheitszentrum bietet Training nach einer Operation „in Ihrem eigenen Tempo“. Das Bootcamp (a) ist ein Intensivtraining für Geübte.',
        type: 'matching',
      },
      {
        id: `${M3}-q7`,
        textId: M3,
        question:
          'Familie Kim möchte ein eigenes Gartenstück, auf dem sie allein Gemüse anbauen kann.',
        options: M3_ADS,
        correctAnswer: 12,
        explanation:
          'Im Gemeinschaftsgarten (e) gibt es „eigene Beete oder Parzellen … nicht“, alles wird gemeinsam bewirtschaftet. Daher passt keine Anzeige.',
        type: 'matching',
      },
      {
        id: `${M3}-q8`,
        textId: M3,
        question:
          'Herr Lorenz möchte sein altes, noch funktionierendes Handy für einen guten Zweck abgeben.',
        options: M3_ADS,
        correctAnswer: 9,
        explanation:
          'Bei der Handysammlung werden funktionierende Geräte „an gemeinnützige Organisationen gespendet“.',
        type: 'matching',
      },
      {
        id: `${M3}-q9`,
        textId: M3,
        question: 'Frau Kaya arbeitet tagsüber und möchte abends den Führerschein machen.',
        options: M3_ADS,
        correctAnswer: 3,
        explanation:
          'Die Fahrschule bietet Theorieunterricht von 18.30 bis 20 Uhr, und Fahrstunden sind „auch abends“ möglich.',
        type: 'matching',
      },
      {
        id: `${M3}-q10`,
        textId: M3,
        question: 'Herr Müller sucht für seine Kinder preiswerte gebrauchte Kleidung.',
        options: M3_ADS,
        correctAnswer: 2,
        explanation:
          'Auf dem Kinderkleiderbasar gibt es gut erhaltene Kinderkleidung „zu kleinen Preisen“.',
        type: 'matching',
      },
    ],
    textType: 'advertisement',
    wordCount: 668,
    estimatedReadingTime: 25,
    topics: ['Bildung', 'Gesundheit', 'Konsum'],
  },
  {
    id: M4,
    title: 'Beschwerde an die Hausverwaltung: Heizung defekt',
    testingPart: 4,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'Sehr geehrte Frau Albrecht,\n' +
      'ich wende mich heute an Sie, (1) ____ in meiner Wohnung in der Lindenstraße 14 seit über einer Woche die Heizung nicht richtig funktioniert. Die Heizkörper im Wohnzimmer und im Bad bleiben kalt, (2) ____ ich die Thermostate ganz aufdrehe. Bereits am 3. November habe ich den Hausmeister darüber informiert, (3) ____ bisher ist leider nichts passiert.\n' +
      'Da es draußen inzwischen sehr kalt ist, muss ich mit einem kleinen Elektroheizer heizen, (4) ____ hohe Stromkosten verursacht. Außerdem mache ich mir Sorgen, dass sich in den feuchten Räumen bald Schimmel bilden (5) ____.\n' +
      'Ich bitte Sie deshalb, sich so schnell wie möglich (6) ____ die Reparatur zu kümmern. Bitte teilen Sie mir mit, wann ein Techniker vorbeikommen kann. Ich bin werktags ab 16 Uhr zu Hause. Zu anderen Zeiten könnte meine Nachbarin, Frau Demir, (7) ____ Techniker die Wohnung aufschließen, (8) ____ ich ihr rechtzeitig Bescheid gebe.\n' +
      'Darüber hinaus möchte ich Sie fragen, (9) ____ eine Minderung der Miete für den Zeitraum ohne funktionierende Heizung möglich ist. Ich wäre Ihnen dankbar, wenn Sie mir bis Ende der Woche antworten (10) ____.\n' +
      'Mit freundlichen Grüßen\n' +
      'Martin Krause',
    questions: [
      {
        id: `${M4}-q1`,
        textId: M4,
        question: 'Lücke 1',
        options: ['denn', 'deshalb', 'weil'],
        correctAnswer: 2,
        explanation:
          'Das Verb „funktioniert“ steht am Ende, also handelt es sich um einen Nebensatz mit „weil“. „denn“ und „deshalb“ verlangen das Verb an zweiter Stelle.',
        type: 'selection',
      },
      {
        id: `${M4}-q2`,
        textId: M4,
        question: 'Lücke 2',
        options: ['obwohl', 'trotzdem', 'weil'],
        correctAnswer: 0,
        explanation:
          'Die Heizkörper bleiben kalt, obwohl man das Gegenteil erwarten würde: ein Gegensatz im Nebensatz (Verb am Ende), also „obwohl“. „trotzdem“ ist ein Adverb mit Verb an zweiter Stelle.',
        type: 'selection',
      },
      {
        id: `${M4}-q3`,
        textId: M4,
        question: 'Lücke 3',
        options: ['sondern', 'aber', 'sonst'],
        correctAnswer: 1,
        explanation:
          'Ein Gegensatz zwischen zwei Hauptsätzen ohne vorherige Verneinung wird mit „aber“ ausgedrückt. „sondern“ setzt eine Verneinung im ersten Satz voraus.',
        type: 'selection',
      },
      {
        id: `${M4}-q4`,
        textId: M4,
        question: 'Lücke 4',
        options: ['den', 'dem', 'der'],
        correctAnswer: 2,
        explanation:
          'Das Relativpronomen bezieht sich auf „einem kleinen Elektroheizer“ (maskulin) und ist Subjekt des Relativsatzes, also Nominativ: „der“.',
        type: 'selection',
      },
      {
        id: `${M4}-q5`,
        textId: M4,
        question: 'Lücke 5',
        options: ['können', 'könnte', 'gekonnt'],
        correctAnswer: 1,
        explanation:
          'Das Subjekt „Schimmel“ steht im Singular, und es geht um eine Möglichkeit: Konjunktiv II „könnte“. „können“ wäre Plural, „gekonnt“ ein Partizip.',
        type: 'selection',
      },
      {
        id: `${M4}-q6`,
        textId: M4,
        question: 'Lücke 6',
        options: ['um', 'an', 'für'],
        correctAnswer: 0,
        explanation: 'Das Verb lautet „sich kümmern um“ + Akkusativ.',
        type: 'selection',
      },
      {
        id: `${M4}-q7`,
        textId: M4,
        question: 'Lücke 7',
        options: ['Ihren', 'Ihrer', 'Ihrem'],
        correctAnswer: 2,
        explanation:
          '„jemandem etwas aufschließen“: Der Techniker ist Dativobjekt, maskulin Singular, also „Ihrem Techniker“.',
        type: 'selection',
      },
      {
        id: `${M4}-q8`,
        textId: M4,
        question: 'Lücke 8',
        options: ['sofern', 'ob', 'damit'],
        correctAnswer: 0,
        explanation:
          'Der Nebensatz nennt eine Bedingung („unter der Voraussetzung, dass“), daher „sofern“. „damit“ drückt einen Zweck aus, „ob“ leitet eine indirekte Frage ein.',
        type: 'selection',
      },
      {
        id: `${M4}-q9`,
        textId: M4,
        question: 'Lücke 9',
        options: ['dass', 'ob', 'wenn'],
        correctAnswer: 1,
        explanation:
          'Nach „fragen“ folgt eine indirekte Ja-/Nein-Frage; sie wird mit „ob“ eingeleitet.',
        type: 'selection',
      },
      {
        id: `${M4}-q10`,
        textId: M4,
        question: 'Lücke 10',
        options: ['werden', 'wurden', 'würden'],
        correctAnswer: 2,
        explanation:
          'Die höfliche Bitte „Ich wäre Ihnen dankbar, wenn …“ steht im Konjunktiv II; dazu passt „antworten würden“.',
        type: 'selection',
      },
    ],
    textType: 'email',
    wordCount: 189,
    estimatedReadingTime: 10,
    topics: ['Wohnen', 'Beschwerde', 'Mietrecht'],
  },
  {
    id: M5,
    title: 'Handyfreie Pausen: Eine Schule zieht Bilanz',
    testingPart: 5,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'Handyfreie Pausen: Eine Schule zieht Bilanz\n' +
      'Seit einem halben Jahr gilt an der Gesamtschule am Eichenhain in Mühlbach eine klare (1) ____: Während des Unterrichts und in den Pausen bleiben Smartphones ausgeschaltet in der Tasche. Wer sich nicht daran hält, muss sein Gerät bis zum Ende des Schultags im Sekretariat (2) ____.\n' +
      'Anfangs war der Widerstand groß. Viele Jugendliche fürchteten, ohne Handy nichts mehr von ihren Freunden zu (3) ____, und auch einige Eltern hatten Bedenken, ihre Kinder im Notfall nicht erreichen zu können. Die Schulleitung nahm diese Sorgen ernst und richtete ein Telefon im Sekretariat ein, über das Familien jederzeit Kontakt (4) ____ können.\n' +
      'Inzwischen fällt das (5) ____ überwiegend positiv aus. Nach Angaben der Lehrkräfte spielen die Schülerinnen und Schüler in den Pausen wieder mehr Tischtennis, unterhalten sich oder lesen. Auch im Unterricht seien viele deutlich (6) ____ als früher. Eine Befragung ergab, dass sich mehr als die Hälfte der Jugendlichen inzwischen an die neue Regel (7) ____ hat.\n' +
      'Ganz ohne Kritik geht es allerdings nicht. Einige ältere Schüler meinen, man solle ihnen mehr Vertrauen (8) ____, statt alles zu verbieten. Die Schule will deshalb im nächsten Jahr für die Oberstufe eine Ausnahme (9) ____: Dort sollen die Jugendlichen selbst Regeln für die Nutzung entwickeln. Für Schulleiter Peter Volkmann ist klar: „Es geht nicht darum, Technik zu verteufeln, sondern bewusst mit ihr (10) ____.“',
    questions: [
      {
        id: `${M5}-q1`,
        textId: M5,
        question: 'Lücke 1',
        options: M5_BANK,
        correctAnswer: 12,
        explanation:
          'Nach „eine klare“ braucht man ein feminines Nomen; die Schule hat eine „Regelung“ eingeführt. „Gesetz“ ist neutral und wird nicht von einer Schule erlassen.',
        type: 'matching',
      },
      {
        id: `${M5}-q2`,
        textId: M5,
        question: 'Lücke 2',
        options: M5_BANK,
        correctAnswer: 0,
        explanation:
          '„bis zum Ende des Schultags“ zeigt, dass das Handy so lange im Sekretariat bleibt: Man muss es dort „abgeben“, nicht „abholen“.',
        type: 'matching',
      },
      {
        id: `${M5}-q3`,
        textId: M5,
        question: 'Lücke 3',
        options: M5_BANK,
        correctAnswer: 5,
        explanation:
          'Die Jugendlichen fürchten, keine Neuigkeiten mehr zu bekommen: „nichts mehr von jemandem erfahren“.',
        type: 'matching',
      },
      {
        id: `${M5}-q4`,
        textId: M5,
        question: 'Lücke 4',
        options: M5_BANK,
        correctAnswer: 4,
        explanation: 'Die feste Verbindung heißt „Kontakt aufnehmen“, nicht „Kontakt nehmen“.',
        type: 'matching',
      },
      {
        id: `${M5}-q5`,
        textId: M5,
        question: 'Lücke 5',
        options: M5_BANK,
        correctAnswer: 6,
        explanation:
          'Eine Bewertung „fällt positiv aus“; nach einem halben Jahr zieht man ein „Fazit“ (das Fazit, neutral).',
        type: 'matching',
      },
      {
        id: `${M5}-q6`,
        textId: M5,
        question: 'Lücke 6',
        options: M5_BANK,
        correctAnswer: 3,
        explanation:
          'Wegen „als früher“ ist ein Komparativ nötig: „aufmerksamer“. Die Grundform „aufmerksam“ passt nicht zum Vergleich.',
        type: 'matching',
      },
      {
        id: `${M5}-q7`,
        textId: M5,
        question: 'Lücke 7',
        options: M5_BANK,
        correctAnswer: 9,
        explanation:
          'Das reflexive Verb „sich an etwas gewöhnen“ bildet das Perfekt mit „haben“: „hat sich gewöhnt“. „gewohnt sein“ steht mit „sein“.',
        type: 'matching',
      },
      {
        id: `${M5}-q8`,
        textId: M5,
        question: 'Lücke 8',
        options: M5_BANK,
        correctAnswer: 13,
        explanation: 'Die feste Verbindung lautet „jemandem Vertrauen schenken“.',
        type: 'matching',
      },
      {
        id: `${M5}-q9`,
        textId: M5,
        question: 'Lücke 9',
        options: M5_BANK,
        correctAnswer: 10,
        explanation: 'Die feste Verbindung lautet „eine Ausnahme machen“.',
        type: 'matching',
      },
      {
        id: `${M5}-q10`,
        textId: M5,
        question: 'Lücke 10',
        options: M5_BANK,
        correctAnswer: 14,
        explanation:
          'Nach „Es geht darum, … sondern“ folgt eine Infinitivkonstruktion mit „zu“; bei trennbaren Verben steht „zu“ zwischen Präfix und Verb: „umzugehen“.',
        type: 'matching',
      },
    ],
    textType: 'article',
    wordCount: 226,
    estimatedReadingTime: 10,
    topics: ['Medien', 'Schule', 'Jugend'],
  },
]
