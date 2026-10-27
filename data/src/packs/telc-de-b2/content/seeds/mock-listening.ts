/** Original app-authored telc Deutsch B2 mock Set 1 content (exam-only); not official examination material. */
export const mockListeningSeeds: Record<string, unknown>[] = [
  {
    id: 'telc-b2-mock-listening-1',
    title: 'Nachrichten am Morgen',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'Sie hören eine Nachrichtensendung. Sie hören die Sendung nur einmal. Entscheiden Sie, ob die Aussagen richtig oder falsch sind.',
    transcript: [
      'Guten Morgen, meine Damen und Herren. Hier sind die Nachrichten.',
      'Immer mehr Menschen in Deutschland engagieren sich ehrenamtlich. Das geht aus einer Umfrage hervor, die ein Forschungsinstitut im Auftrag mehrerer Stiftungen durchgeführt hat. Danach ist inzwischen fast jeder Zweite über 14 Jahre in einem Verein, einer Initiative oder einem sozialen Projekt aktiv, deutlich mehr als noch vor zehn Jahren. Besonders stark gestiegen ist der Anteil bei jungen Erwachsenen. Die Studie zeigt allerdings auch ein Problem: Immer weniger Menschen sind bereit, langfristig Verantwortung zu übernehmen, etwa im Vorstand eines Sportvereins. Viele Vereine suchen deshalb dringend nach Nachwuchs für ihre Führungsämter. Die Forscher empfehlen, solche Ämter stärker aufzuteilen und zeitlich zu begrenzen, um sie attraktiver zu machen.',
      'Die Zahl der Bäckereien in Deutschland ist erneut gesunken. Wie der Branchenverband mitteilte, haben im vergangenen Jahr rund 500 Betriebe aufgegeben. Als wichtigste Gründe nennt der Verband die hohen Energiekosten und den Mangel an Fachkräften. Es gibt aber auch eine gute Nachricht: Die Zahl der neuen Ausbildungsverträge ist zum ersten Mal seit Jahren wieder gestiegen, und zwar um acht Prozent. Der Verband führt das unter anderem auf Videos in sozialen Netzwerken zurück, in denen junge Bäckerinnen und Bäcker von ihrem Arbeitsalltag erzählen. Viele Betriebe bieten Auszubildenden inzwischen außerdem flexiblere Arbeitszeiten an, damit der Beruf mit seinen frühen Schichten attraktiver wird.',
      'Ein europäischer Forschungssatellit ist heute in den frühen Morgenstunden erfolgreich ins All gestartet. Gebaut wurde er unter anderem in Werken in Deutschland und Italien. Der Satellit soll in den kommenden sieben Jahren messen, wie feucht die Böden auf der ganzen Welt sind. Die Daten sollen unter anderem helfen, Dürren früher zu erkennen. Auch die Landwirtschaft soll davon profitieren: Bauern können mit den Informationen besser planen, wann und wie viel sie ihre Felder bewässern müssen. Die ersten Messergebnisse werden im kommenden Frühjahr erwartet. Der Start war ursprünglich schon für das vergangene Jahr vorgesehen, musste aber wegen technischer Probleme mehrmals verschoben werden.',
      'Bei der diesjährigen Insektenzählung haben Naturfreunde mehr Schmetterlinge beobachtet als im Vorjahr. Rund zwanzigtausend Freiwillige hatten im Juli eine Stunde lang in Gärten, Parks und auf Balkonen alle Insekten notiert, die sie entdecken konnten. Fachleute führen das Plus vor allem auf den warmen und trockenen Sommer zurück. Sie warnen jedoch davor, das Ergebnis überzubewerten. Langfristig gehe die Zahl der Insekten weiter zurück, vor allem, weil Wiesen mit blühenden Pflanzen fehlen und auf vielen Feldern Pflanzenschutzmittel eingesetzt werden. Die Organisatoren rufen deshalb dazu auf, im eigenen Garten Ecken mit Wildblumen stehen zu lassen.',
      'Der diesjährige Preis für das beste literarische Debüt geht an Miriam Okafor. Die einunddreißigjährige Autorin erhält die Auszeichnung für ihren ersten Roman „Die Stunde nach Mitternacht“. Darin erzählt sie von einer jungen Krankenpflegerin und ihren Nachtschichten in einer Großstadtklinik. Okafor arbeitet selbst seit zehn Jahren in der Pflege und hat das Buch nach eigenen Angaben vor allem in ihren Pausen geschrieben. Die Jury lobte die genaue Sprache und den Humor des Romans. Der Preis ist mit fünfzehntausend Euro dotiert und wird im Dezember verliehen. Der Roman steht bereits seit mehreren Wochen auf den Bestsellerlisten.',
      'Der Stadtmarathon in Kaltenbach beginnt am Sonntag eine Stunde früher als ursprünglich geplant. Die Veranstalter reagieren damit auf die Wettervorhersage, die für den Nachmittag Temperaturen von über 30 Grad ankündigt. Der Startschuss fällt nun bereits um 7 Uhr 30. Außerdem wird es entlang der Strecke doppelt so viele Wasserstellen geben wie sonst. Rund sechstausend Läuferinnen und Läufer haben sich angemeldet. Wer wegen der Hitze lieber nicht teilnehmen möchte, kann seine Startnummer kostenlos auf das nächste Jahr übertragen lassen. Die Straßen in der Innenstadt bleiben am Sonntag von 6 bis 14 Uhr für den Autoverkehr gesperrt.',
    ].join('\n'),
    questions: [
      {
        id: 'telc-b2-mock-listening-1-q1',
        question:
          'Nach der Umfrage engagieren sich heute weniger Menschen freiwillig als vor zehn Jahren.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Die Umfrage zeigt das Gegenteil: Fast jeder Zweite ist aktiv, deutlich mehr als noch vor zehn Jahren.',
      },
      {
        id: 'telc-b2-mock-listening-1-q2',
        question:
          'Im Bäckerhandwerk haben mehr junge Leute eine Ausbildung begonnen als im Jahr davor.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Trotz der Schließungen ist die Zahl der neuen Ausbildungsverträge um acht Prozent gestiegen.',
      },
      {
        id: 'telc-b2-mock-listening-1-q3',
        question: 'Die Messungen des Satelliten sollen auch Landwirten bei ihrer Arbeit helfen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Mit den Daten zur Bodenfeuchte sollen Bauern besser planen können, wann und wie viel sie ihre Felder bewässern.',
      },
      {
        id: 'telc-b2-mock-listening-1-q4',
        question: 'Die ausgezeichnete Autorin hat zum ersten Mal einen Roman veröffentlicht.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Miriam Okafor erhält den Debütpreis für ihren ersten Roman „Die Stunde nach Mitternacht“.',
      },
      {
        id: 'telc-b2-mock-listening-1-q5',
        question: 'Wegen der erwarteten Hitze wird der Marathon später gestartet als vorgesehen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Der Lauf beginnt wegen der Hitze eine Stunde früher, nämlich schon um 7 Uhr 30.',
      },
    ],
    audio: { shared: '/audio/listening/telc-de-b2/telc-b2-mock-listening-1/shared.wav' },
  },
  {
    id: 'telc-b2-mock-listening-2',
    title: 'Arbeiten in der alten Dorfschule',
    testingPart: 2,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'Sie hören ein Interview. Sie hören das Interview nur einmal. Entscheiden Sie beim Hören, ob die Aussagen richtig oder falsch sind.',
    transcript: [
      'Moderatorin: Guten Morgen und willkommen bei „Land und Leute“. Immer mehr Menschen arbeiten zumindest an einigen Tagen nicht mehr im Büro ihres Arbeitgebers. Doch nicht jeder möchte dafür am Küchentisch sitzen. In Oberwiesen, einem Dorf mit knapp 900 Einwohnern, gibt es deshalb seit drei Jahren ein Gemeinschaftsbüro für alle, die von dort aus arbeiten wollen. Gegründet hat es Herr Brandner, der heute bei uns im Studio ist. Guten Morgen, Herr Brandner.',
      'Herr Brandner: Guten Morgen, ich freue mich, hier zu sein.',
      'Moderatorin: Herr Brandner, Ihr Büro hat einen ziemlich ungewöhnlichen Standort.',
      'Herr Brandner: Das stimmt. Wir sitzen in der alten Dorfschule. Dort wurde schon seit über zehn Jahren nicht mehr unterrichtet, weil es einfach zu wenige Kinder gab. Das Gebäude stand leer, und die Gemeinde wusste nicht so recht, was sie damit anfangen sollte. Wir haben es dann gemietet und gemeinsam mit vielen Freiwilligen renoviert. In den ehemaligen Klassenzimmern stehen heute Schreibtische.',
      'Moderatorin: Wie sind Sie überhaupt auf die Idee gekommen?',
      'Herr Brandner: Aus eigener Erfahrung. Ich habe jahrelang als Ingenieur in der Stadt gearbeitet und bin jeden Tag mehr als eine Stunde hin und eine Stunde zurück gefahren. Das waren im Jahr Hunderte Stunden im Auto. Als mein Arbeitgeber dann Homeoffice erlaubt hat, war ich zuerst begeistert. Nach ein paar Wochen allein zu Hause habe ich aber gemerkt, dass mir etwas fehlt.',
      'Moderatorin: Wer nutzt Ihr Büro heute?',
      'Herr Brandner: Wir haben 20 Arbeitsplätze und ungefähr 35 Mitglieder, die unterschiedlich oft kommen. Ehrlich gesagt hatte ich erwartet, dass vor allem Selbstständige kommen, also Grafikerinnen, Übersetzer oder Programmierer. Das war ein Irrtum. Etwa drei Viertel unserer Mitglieder sind ganz normale Angestellte von Firmen aus der Stadt, die zwei oder drei Tage pro Woche nicht pendeln wollen.',
      'Moderatorin: Aber warum arbeiten diese Leute nicht einfach zu Hause?',
      'Herr Brandner: Das werde ich oft gefragt. Die häufigste Antwort unserer Mitglieder ist: Zu Hause verschwimmt alles. Nebenbei läuft die Waschmaschine, die Kinder kommen aus der Schule, und abends sitzt man doch wieder am Laptop. Bei uns schließt man die Tür hinter sich und hat Feierabend. Dazu kommt, dass man hier Kollegen trifft, auch wenn sie für ganz andere Firmen arbeiten. Man trinkt zusammen Kaffee und hilft sich gegenseitig.',
      'Moderatorin: Was kostet so ein Arbeitsplatz?',
      'Herr Brandner: Ein fester Schreibtisch kostet 150 Euro im Monat, ein einzelner Tag 15 Euro. Interessant ist, dass inzwischen mehrere Arbeitgeber diese Kosten für ihre Mitarbeiter übernehmen. Für die Firmen ist das immer noch günstiger als ein Büroplatz in der Stadt.',
      'Moderatorin: Auf dem Land ist das Internet ja oft ein Problem. Wie war das bei Ihnen?',
      'Herr Brandner: Oh, das war am Anfang wirklich ein Drama. Im ersten Jahr hatten wir nur eine sehr langsame Leitung. Videokonferenzen sind ständig abgebrochen, und einige Mitglieder haben deshalb wieder gekündigt. Erst nach langen Verhandlungen mit dem Anbieter und mit Unterstützung der Gemeinde haben wir einen Glasfaseranschluss bekommen. Seitdem läuft alles problemlos.',
      'Moderatorin: Wie sieht denn ein typischer Tag bei Ihnen aus?',
      'Herr Brandner: Die Ersten kommen gegen halb acht, oft nachdem sie ihre Kinder in den Kindergarten gebracht haben. Mittags gehen viele zusammen essen, und gegen fünf wird es langsam ruhig. Abends ist das Haus dann meistens leer, außer wenn wir Veranstaltungen haben.',
      'Moderatorin: Hat das Büro auch etwas im Dorf verändert?',
      'Herr Brandner: Ich denke, sehr viel. Früher war Oberwiesen tagsüber praktisch leer, weil alle zur Arbeit weggefahren sind. Jetzt sind mittags Menschen auf der Straße. Die Bäckerei hat einen Mittagstisch eingeführt, weil unsere Mitglieder dort essen. Und wir kennen mindestens vier junge Familien, die zurück ins Dorf gezogen sind, weil sie hier arbeiten können, ohne jeden Tag zu pendeln.',
      'Moderatorin: Gab es im Dorf denn auch Vorbehalte?',
      'Herr Brandner: Natürlich. Manche ältere Einwohner haben am Anfang gesagt: Was wollen diese Computerleute in unserer Schule? Das war auch verständlich, viele von ihnen sind dort selbst zur Schule gegangen. Wir haben dann angefangen, das Haus abends für alle zu öffnen. Einmal im Monat gibt es zum Beispiel eine Sprechstunde, in der unsere Mitglieder Seniorinnen und Senioren bei Fragen zum Smartphone oder zum Online-Banking helfen. Die ist jedes Mal voll.',
      'Moderatorin: Und wirtschaftlich? Trägt sich das Projekt?',
      'Herr Brandner: Gerade so. Die Einnahmen decken die Miete und die laufenden Kosten, aber Gewinn machen wir keinen. Viel Arbeit, etwa die Organisation oder kleinere Reparaturen, erledigen Mitglieder ehrenamtlich. Ohne dieses Engagement würde es nicht funktionieren.',
      'Moderatorin: Andere Gemeinden überlegen, etwas Ähnliches aufzubauen. Was würden Sie ihnen raten?',
      'Herr Brandner: Erstens: klein anfangen. Man braucht keinen Neubau, ein paar Räume reichen völlig. Zweitens, und das ist mir das Wichtigste: Man muss die Menschen im Ort von Anfang an mitnehmen. Wenn die Dorfbewohner das Gefühl haben, dass ihnen etwas von außen aufgezwungen wird, hat das Projekt keine Chance. Und drittens sollte man sich nicht nur auf Fördergelder verlassen. Die laufen irgendwann aus.',
      'Moderatorin: Herr Brandner, herzlichen Dank für diese Einblicke.',
      'Herr Brandner: Sehr gern.',
    ].join('\n'),
    questions: [
      {
        id: 'telc-b2-mock-listening-2-q1',
        question:
          'Das Gemeinschaftsbüro befindet sich in einem Gebäude, in dem früher Kinder unterrichtet wurden.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Das Büro ist in der alten Dorfschule untergebracht, in der seit über zehn Jahren kein Unterricht mehr stattfindet.',
      },
      {
        id: 'telc-b2-mock-listening-2-q2',
        question: 'Herr Brandner hatte selbst nie einen weiten Weg zur Arbeit.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Er ist jahrelang täglich mehr als eine Stunde in jede Richtung in die Stadt gefahren.',
      },
      {
        id: 'telc-b2-mock-listening-2-q3',
        question: 'Die meisten Mitglieder arbeiten selbstständig.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Etwa drei Viertel der Mitglieder sind Angestellte von Firmen aus der Stadt; Herr Brandner hatte sich mit den Selbstständigen geirrt.',
      },
      {
        id: 'telc-b2-mock-listening-2-q4',
        question:
          'Viele Mitglieder kommen, weil sie zu Hause Beruf und Privatleben nur schwer trennen können.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Die häufigste Antwort ist, dass zu Hause alles verschwimmt; im Büro schließt man die Tür und hat Feierabend.',
      },
      {
        id: 'telc-b2-mock-listening-2-q5',
        question: 'Manche Firmen bezahlen ihren Angestellten den Platz im Gemeinschaftsbüro.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Laut Herrn Brandner übernehmen inzwischen mehrere Arbeitgeber die Kosten für ihre Mitarbeiter.',
      },
      {
        id: 'telc-b2-mock-listening-2-q6',
        question: 'Schon bei der Eröffnung hatte das Büro eine schnelle Internetverbindung.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Im ersten Jahr gab es nur eine sehr langsame Leitung; der Glasfaseranschluss kam erst nach langen Verhandlungen.',
      },
      {
        id: 'telc-b2-mock-listening-2-q7',
        question:
          'Herr Brandner meint, dass das Büro für das Leben im Dorf bisher kaum etwas verändert hat.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Er sieht große Veränderungen: Menschen auf der Straße, einen Mittagstisch in der Bäckerei und zurückgezogene junge Familien.',
      },
      {
        id: 'telc-b2-mock-listening-2-q8',
        question: 'Inzwischen gibt es im Büro auch ein Angebot speziell für ältere Dorfbewohner.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Einmal im Monat helfen Mitglieder Seniorinnen und Senioren in einer Sprechstunde bei Fragen zum Smartphone oder Online-Banking.',
      },
      {
        id: 'telc-b2-mock-listening-2-q9',
        question: 'Mit dem Projekt wird mittlerweile ein deutlicher Gewinn erzielt.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Die Einnahmen decken gerade so Miete und laufende Kosten; einen Gewinn macht das Projekt nicht.',
      },
      {
        id: 'telc-b2-mock-listening-2-q10',
        question:
          'Herr Brandner empfiehlt anderen Gemeinden, die Einwohner früh in die Planung einzubeziehen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation: 'Als wichtigsten Rat nennt er, die Menschen im Ort von Anfang an mitzunehmen.',
      },
    ],
    audio: { shared: '/audio/listening/telc-de-b2/telc-b2-mock-listening-2/shared.wav' },
  },
  {
    id: 'telc-b2-mock-listening-3',
    title: 'Ansagen, Hinweise und Anrufe',
    testingPart: 3,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    examOnly: true,
    content:
      'Sie hören fünf kurze Texte. Sie hören jeden Text nur einmal. Entscheiden Sie, ob die Aussagen richtig oder falsch sind.',
    items: [
      {
        id: 'telc-b2-mock-listening-3-i1',
        context: 'Sie hören eine Durchsage am Flughafen.',
        transcript:
          'Sie hören eine Durchsage am Flughafen. Ihre Aufmerksamkeit bitte. Eine Information für die Passagiere des Fluges 2315 nach Lissabon, planmäßiger Abflug 11 Uhr 40. Ihr Flug wird heute nicht von Flugsteig B 12, sondern von Flugsteig C 4 abgefertigt. Das Einsteigen beginnt voraussichtlich um 11 Uhr 10. Bitte begeben Sie sich bereits jetzt zu Flugsteig C 4, der Weg dorthin dauert etwa zehn Minuten. Halten Sie bitte Ihre Bordkarte und Ihren Ausweis bereit. Vielen Dank.',
        question: 'Die Fluggäste nach Lissabon müssen zu einem anderen Flugsteig gehen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Der Flug wird nicht wie geplant an Flugsteig B 12, sondern an Flugsteig C 4 abgefertigt.',
      },
      {
        id: 'telc-b2-mock-listening-3-i2',
        context: 'Sie hören eine Nachricht auf dem Anrufbeantworter.',
        transcript:
          'Sie hören eine Nachricht auf dem Anrufbeantworter. Guten Tag, Frau Yilmaz, hier spricht Martin Groß von der Hausverwaltung Ahornweg. Ich möchte Sie darüber informieren, dass am kommenden Dienstag im ganzen Haus das Wasser abgestellt wird, und zwar von 8 bis etwa 13 Uhr. Im Keller werden neue Leitungen verlegt. Bitte füllen Sie sich vorher etwas Wasser ab. Außerdem brauchen die Handwerker Platz für ihre Fahrzeuge. Fahren Sie Ihr Auto deshalb bitte spätestens am Montagabend aus dem Innenhof. Vielen Dank für Ihr Verständnis und auf Wiederhören.',
        question: 'Frau Yilmaz soll ihr Auto erst am Dienstagmorgen aus dem Hof fahren.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Das Auto muss spätestens am Montagabend aus dem Innenhof gefahren werden, weil die Handwerker am Dienstag Platz brauchen.',
      },
      {
        id: 'telc-b2-mock-listening-3-i3',
        context: 'Sie hören eine Meldung im Radio.',
        transcript:
          'Sie hören eine Meldung im Radio. Ein Hinweis für alle Fahrgäste der S-Bahn-Linie 3: An den nächsten beiden Wochenenden ist die Strecke zwischen dem Hauptbahnhof und Neudorf wegen Bauarbeiten gesperrt. Von Freitagabend 22 Uhr bis Montagmorgen 4 Uhr fahren stattdessen Busse. Sie halten an allen Stationen, am Hauptbahnhof allerdings nicht am gewohnten Platz, sondern auf der Rückseite des Bahnhofs. Planen Sie bitte etwa 20 Minuten mehr Zeit ein. Fahrräder können in den Ersatzbussen leider nicht mitgenommen werden.',
        question: 'Fahrgäste müssen mit etwa einer halben Stunde zusätzlicher Fahrzeit rechnen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Die Meldung empfiehlt, etwa 20 Minuten mehr Zeit einzuplanen, nicht eine halbe Stunde.',
      },
      {
        id: 'telc-b2-mock-listening-3-i4',
        context: 'Sie hören eine Ansage am Telefon.',
        transcript:
          'Sie hören eine Ansage am Telefon. Herzlich willkommen bei der Volkshochschule Kaltenbach. Unser neues Programm für das Herbstsemester ist erschienen. Anmeldungen sind ab dem ersten September möglich, am einfachsten über unsere Internetseite. Wenn Sie einen Sprachkurs besuchen möchten und Ihr Niveau nicht kennen, drücken Sie bitte die 1, um einen Termin für einen Einstufungstest zu vereinbaren. Für Fragen zu Gebühren und Ermäßigungen drücken Sie die 2. Für alle anderen Anliegen drücken Sie die 3. Unsere Geschäftsstelle ist dienstags und donnerstags von 9 bis 12 Uhr persönlich für Sie da.',
        question: 'Wer sein Sprachniveau feststellen lassen möchte, soll die Taste 1 wählen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Mit der 1 vereinbart man einen Termin für einen Einstufungstest, wenn man sein Niveau nicht kennt.',
      },
      {
        id: 'telc-b2-mock-listening-3-i5',
        context: 'Sie hören eine Nachricht auf dem Anrufbeantworter.',
        transcript:
          'Sie hören eine Nachricht auf dem Anrufbeantworter. Hallo Lena, hier ist Jonas. Es geht um meinen Umzug am Samstag. Es gibt zwei kleine Änderungen: Wir fangen nicht um 9 an, sondern schon um 8, weil der Transporter nur bis mittags gemietet ist. Und wir treffen uns nicht bei mir in der alten Wohnung, denn die Möbel stehen schon alle bei meinen Eltern. Komm also bitte direkt zu meinen Eltern in die Gartenstraße 14. Für Frühstück und Kaffee ist gesorgt. Ruf mich doch kurz zurück, ob das für dich klappt. Danke dir!',
        question: 'Die Helfer treffen sich am Samstag vor der bisherigen Wohnung von Jonas.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Jonas sagt ausdrücklich, dass man sich nicht in seiner alten Wohnung trifft, sondern bei seinen Eltern in der Gartenstraße 14.',
      },
    ],
    audio: {
      items: {
        'telc-b2-mock-listening-3-i1':
          '/audio/listening/telc-de-b2/telc-b2-mock-listening-3/telc-b2-mock-listening-3-i1.wav',
        'telc-b2-mock-listening-3-i2':
          '/audio/listening/telc-de-b2/telc-b2-mock-listening-3/telc-b2-mock-listening-3-i2.wav',
        'telc-b2-mock-listening-3-i3':
          '/audio/listening/telc-de-b2/telc-b2-mock-listening-3/telc-b2-mock-listening-3-i3.wav',
        'telc-b2-mock-listening-3-i4':
          '/audio/listening/telc-de-b2/telc-b2-mock-listening-3/telc-b2-mock-listening-3-i4.wav',
        'telc-b2-mock-listening-3-i5':
          '/audio/listening/telc-de-b2/telc-b2-mock-listening-3/telc-b2-mock-listening-3-i5.wav',
      },
    },
  },
]
