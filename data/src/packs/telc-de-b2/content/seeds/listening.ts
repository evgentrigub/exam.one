/** Original app-authored telc Deutsch B2 practice content; not official examination material. */
export const listeningSeeds: Record<string, unknown>[] = [
  {
    id: 'telc-b2-practice-listening-1',
    title: 'Nachrichten am Abend',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'Sie hören eine Nachrichtensendung. Sie hören die Sendung nur einmal. Entscheiden Sie, ob die Aussagen richtig oder falsch sind.',
    transcript: [
      'Guten Abend, meine Damen und Herren. Hier sind die Nachrichten.',
      'Schülerinnen und Schüler sollen im ganzen Land ab dem nächsten Schuljahr kostenlos mit Bus und Bahn fahren können. Das hat die Landesregierung heute in der Hauptstadt angekündigt. Bisher zahlen Familien für ein Schülerticket je nach Wohnort bis zu 40 Euro im Monat. Der Verkehrsminister sprach von einer spürbaren Entlastung für Eltern und von einem Beitrag zum Klimaschutz, weil weniger Kinder mit dem Auto zur Schule gebracht würden. Die Opposition begrüßte die Pläne grundsätzlich, kritisierte aber die Finanzierung. Ein Teil der Kosten soll nämlich bei den Städten und Gemeinden bleiben, die schon jetzt über leere Kassen klagen. Nach Schätzungen des Ministeriums kostet das Vorhaben jährlich rund 200 Millionen Euro.',
      'Die Fahrradbranche hat im vergangenen Jahr deutlich weniger Räder verkauft als im Jahr zuvor. Nach Angaben des Branchenverbands ging der Absatz um rund 12 Prozent zurück. Als Gründe nannte der Verband die gestiegenen Preise und die allgemeine Kaufzurückhaltung der Verbraucher. Außerdem hätten sich in den Rekordjahren davor sehr viele Menschen bereits ein neues Rad angeschafft. Viele Händler hätten deshalb noch volle Lager und böten ihre Räder derzeit mit hohen Rabatten an. Nur bei den Elektrorädern blieb die Nachfrage stabil. Für das kommende Jahr ist der Verband dennoch optimistisch und rechnet mit einer leichten Erholung des Marktes.',
      'Ein kurzer Mittagsschlaf kann das Gedächtnis älterer Menschen stärken. Zu diesem Ergebnis kommt eine Studie der Universität Greifenau. Die Forscherinnen und Forscher hatten ein Jahr lang rund 800 Männer und Frauen über 65 begleitet. Wer regelmäßig 20 bis 30 Minuten am Mittag schlief, schnitt bei Gedächtnistests besser ab als Teilnehmer ohne Mittagsruhe. Wer dagegen länger als eine Stunde schlief, erzielte sogar schlechtere Ergebnisse als die Vergleichsgruppe. Die Wissenschaftler empfehlen deshalb, den Mittagsschlaf auf eine halbe Stunde zu begrenzen. Warum zu langes Schlafen am Tag schadet, ist allerdings noch nicht abschließend geklärt.',
      'In der Stadt Brunnfeld dürfen ab dem kommenden Frühjahr am Wochenende keine Autos mehr in die Altstadt fahren. Das hat der Stadtrat gestern Abend mit knapper Mehrheit beschlossen. Ausnahmen gelten für Anwohner, für den Lieferverkehr am frühen Morgen und für Menschen mit Behinderung. Die Stadt erhofft sich weniger Lärm, bessere Luft und mehr Platz für Fußgänger. Einige Einzelhändler befürchten dagegen, dass Kundinnen und Kunden aus dem Umland künftig wegbleiben. Für Besucher sollen am Stadtrand zusätzliche Parkplätze entstehen, von denen aus kostenlose Busse ins Zentrum fahren. Die Regelung soll zunächst ein Jahr lang getestet werden.',
      'Die Ausstellung „Alltag in Dingen“ im Stadtmuseum Hallerbach wird bis Ende Januar verlängert. Eigentlich hätte die Schau über die Geschichte der Haushaltsgeräte an diesem Sonntag schließen sollen. Seit der Eröffnung im Sommer kamen jedoch mehr als sechzigtausend Besucherinnen und Besucher, fast doppelt so viele wie erwartet. Besonders beliebt ist ein Raum, in dem die Gäste alte Waschmaschinen, Kaffeemühlen und Bügeleisen selbst ausprobieren dürfen. Für Schulklassen bietet das Museum in den kommenden Wochen zusätzliche Führungen an. Der Eintritt für Kinder und Jugendliche bleibt weiterhin frei.',
      'Die Handballerinnen aus Rosental haben zum ersten Mal in der Vereinsgeschichte den deutschen Pokal gewonnen. Im Finale setzten sie sich am Nachmittag mit 28 zu 26 gegen den Titelverteidiger durch. Lange hatte das Team mit bis zu fünf Toren zurückgelegen, erst in den letzten zehn Minuten gelang die Wende. Die Trainerin sprach nach dem Spiel von einem historischen Tag für den ganzen Ort. Rund dreitausend Fans wollen die Mannschaft heute Abend bei ihrer Rückkehr auf dem Marktplatz empfangen. Viel Zeit zum Feiern bleibt den Spielerinnen allerdings nicht: Schon am Mittwoch steht das nächste Ligaspiel auf dem Programm.',
    ].join('\n'),
    questions: [
      {
        id: 'telc-b2-practice-listening-1-q1',
        question:
          'Kinder und Jugendliche sollen bald für Fahrten mit öffentlichen Verkehrsmitteln zur Schule nichts mehr bezahlen müssen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Die Landesregierung kündigt an, dass Schülerinnen und Schüler ab dem nächsten Schuljahr kostenlos mit Bus und Bahn fahren können.',
      },
      {
        id: 'telc-b2-practice-listening-1-q2',
        question: 'Im letzten Jahr wurden mehr Fahrräder verkauft als im Jahr davor.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Laut Branchenverband ging der Absatz um rund 12 Prozent zurück, es wurden also weniger Räder verkauft.',
      },
      {
        id: 'telc-b2-practice-listening-1-q3',
        question:
          'Laut der Studie nützt ein Mittagsschlaf dem Gedächtnis umso mehr, je länger er dauert.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Nur ein kurzer Schlaf von 20 bis 30 Minuten wirkt positiv; wer länger als eine Stunde schläft, schneidet sogar schlechter ab.',
      },
      {
        id: 'telc-b2-practice-listening-1-q4',
        question: 'Die Ausstellung im Stadtmuseum ist länger zu sehen als ursprünglich vorgesehen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Die Schau hätte an diesem Sonntag enden sollen, wird wegen des großen Andrangs aber bis Ende Januar verlängert.',
      },
      {
        id: 'telc-b2-practice-listening-1-q5',
        question:
          'Die Mannschaft aus Rosental hat das Endspiel nach einem Rückstand für sich entschieden.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Das Team lag lange mit bis zu fünf Toren hinten, drehte das Spiel in den letzten zehn Minuten und gewann mit 28 zu 26.',
      },
    ],
    audio: { shared: '/audio/listening/telc-de-b2/telc-b2-practice-listening-1/shared.wav' },
  },
  {
    id: 'telc-b2-practice-listening-2',
    title: 'Reparieren statt wegwerfen',
    testingPart: 2,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'Sie hören ein Interview. Sie hören das Interview nur einmal. Entscheiden Sie beim Hören, ob die Aussagen richtig oder falsch sind.',
    transcript: [
      'Moderator: Guten Tag und herzlich willkommen zu „Menschen im Gespräch“. Wenn heute ein Toaster streikt oder eine Lampe nicht mehr leuchtet, landet das Gerät oft sofort im Müll. Meine Gesprächspartnerin sieht das anders: Frau Albrecht hat vor sechs Jahren in Hallerbach ein Reparaturcafé gegründet. Herzlich willkommen, Frau Albrecht.',
      'Frau Albrecht: Vielen Dank für die Einladung.',
      'Moderator: Wie sind Sie denn auf diese Idee gekommen?',
      'Frau Albrecht: Ehrlich gesagt aus Ärger. Mein Wasserkocher war damals gerade zwei Jahre alt, als er plötzlich nicht mehr funktionierte. Ich habe beim Hersteller angerufen, und dort hat man mir erklärt, eine Reparatur lohne sich nicht, ich solle mir einfach ein neues Gerät kaufen. Das wollte ich nicht hinnehmen. Ein Nachbar, der früher Elektriker war, hat sich den Kocher dann angesehen, und nach zehn Minuten war das Problem gelöst. Da dachte ich: So etwas müsste es für alle geben.',
      'Moderator: Und wie läuft das bei Ihnen heute ab?',
      'Frau Albrecht: Wir treffen uns an jedem ersten Samstag im Monat im Gemeindehaus, von 14 bis 18 Uhr. Inzwischen machen etwa 15 Helferinnen und Helfer mit, alle ehrenamtlich. Viele sind tatsächlich im Ruhestand, also ehemalige Elektriker, eine Schneiderin, ein Feinmechaniker. Aber es kommen auch immer mehr junge Leute dazu, zum Beispiel zwei Studenten der Elektrotechnik, die sich besonders gut mit Computern auskennen.',
      'Moderator: Was kostet eine Reparatur bei Ihnen?',
      'Frau Albrecht: Nichts, jedenfalls nicht verpflichtend. Wir haben eine Spendenkasse, und die meisten Besucher geben gern etwas hinein. Von dem Geld kaufen wir Werkzeug und kleine Ersatzteile wie Schrauben oder Sicherungen. Größere Teile müssen die Leute natürlich selbst bezahlen.',
      'Moderator: Kommen denn auch Menschen, die sich ein neues Gerät gar nicht leisten könnten?',
      'Frau Albrecht: Ja, durchaus. Für manche Familien mit wenig Geld ist eine kaputte Waschmaschine eine echte Katastrophe. Wenn wir da helfen können, ist das für mich der schönste Teil unserer Arbeit. Aber die meisten kommen aus Überzeugung, weil sie weniger Müll produzieren und Ressourcen schonen wollen.',
      'Moderator: Was bringen die Menschen am häufigsten mit?',
      'Frau Albrecht: Ganz oben auf der Liste stehen Lampen, Kaffeemaschinen und Staubsauger. Danach kommt Kleidung, also Hosen mit Löchern oder Jacken mit kaputtem Reißverschluss. Schwierig wird es bei Smartphones. Viele Modelle sind so verklebt, dass man sie kaum öffnen kann, ohne etwas zu beschädigen. Da müssen wir leider oft passen.',
      'Moderator: Und wie oft gelingt es, dass ein Gerät wieder funktioniert?',
      'Frau Albrecht: Wir führen darüber genau Buch. In ungefähr zwei von drei Fällen gehen die Leute mit einem funktionierenden Gegenstand nach Hause. Auf diese Quote sind wir ziemlich stolz.',
      'Moderator: Das klingt nach einem praktischen Service. Man gibt sein Gerät ab, und Ihre Leute kümmern sich darum?',
      'Frau Albrecht: Nein, genau das wollen wir nicht. Bei uns gibt es keinen Abgabeschalter. Wer kommt, setzt sich mit an den Tisch und repariert gemeinsam mit einem Helfer. Die Leute sollen sehen, wie ihr Gerät aufgebaut ist, und beim nächsten Mal vielleicht selbst etwas machen können. Wir sind eine Werkstatt zum Mitmachen, kein Reparaturdienst.',
      'Moderator: Sie nennen sich Reparaturcafé. Gibt es denn auch Kaffee?',
      'Frau Albrecht: Natürlich, und Kuchen, den Ehrenamtliche backen. Das ist übrigens keine Nebensache. Während man wartet, kommt man miteinander ins Gespräch. Wir haben einige ältere Stammgäste, die allein leben und manchmal mit einer Kleinigkeit kommen, die eigentlich gar nicht kaputt ist. Ich glaube, für sie ist der Nachmittag bei uns vor allem eine Gelegenheit, unter Menschen zu sein.',
      'Moderator: In Hallerbach gibt es ja auch ein Fachgeschäft für Reparaturen. Wie hat man dort auf Ihr Angebot reagiert?',
      'Frau Albrecht: Am Anfang war der Inhaber ziemlich skeptisch. Er hatte Angst, wir würden ihm die Kunden wegnehmen. Wir haben uns dann zusammengesetzt und offen geredet. Heute schicken wir ihm alle Fälle, bei denen wir nicht weiterkommen oder für die man Spezialgeräte braucht. Er sagt inzwischen selbst, dass er dadurch sogar neue Kunden gewonnen hat. Aus der Konkurrenz ist also eine echte Zusammenarbeit geworden.',
      'Moderator: Auf europäischer Ebene wird seit einiger Zeit über ein Recht auf Reparatur diskutiert. Hersteller sollen verpflichtet werden, Geräte so zu bauen, dass man sie reparieren kann. Hilft Ihnen das?',
      'Frau Albrecht: Grundsätzlich finde ich das sehr gut, das geht in die richtige Richtung. Aber in der Praxis merken wir davon noch wenig. Das größte Problem sind die Preise für Ersatzteile. Wenn ein neuer Akku für einen Staubsauger fast so viel kostet wie das ganze Gerät, dann entscheiden sich die meisten eben doch für den Neukauf. Da muss sich dringend etwas ändern.',
      'Moderator: Zum Schluss: Wie geht es mit Ihrem Café weiter? Wollen Sie wachsen?',
      'Frau Albrecht: Uns fragen oft Leute aus den Nachbarorten, ob wir nicht auch bei ihnen ein Café eröffnen könnten. Aber dafür fehlen uns ganz einfach die Helfer. Ein zweites Café wird es deshalb vorerst nicht geben. Stattdessen wollen wir im nächsten Jahr an die Schulen gehen und dort Reparaturkurse anbieten. Wenn Jugendliche früh lernen, wie man mit einem Schraubenzieher umgeht, ist das die beste Investition in die Zukunft.',
      'Moderator: Frau Albrecht, vielen Dank für das Gespräch und weiterhin viel Erfolg.',
      'Frau Albrecht: Ich danke Ihnen.',
    ].join('\n'),
    questions: [
      {
        id: 'telc-b2-practice-listening-2-q1',
        question:
          'Den Anstoß für das Reparaturcafé gab ein defektes Gerät von Frau Albrecht selbst.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Ihr eigener Wasserkocher ging kaputt, und der Hersteller riet vom Reparieren ab; daraus entstand die Idee.',
      },
      {
        id: 'telc-b2-practice-listening-2-q2',
        question:
          'Im Reparaturcafé helfen ausschließlich Menschen, die nicht mehr berufstätig sind.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Viele Helfer sind zwar im Ruhestand, es machen aber auch immer mehr junge Leute mit, zum Beispiel zwei Studenten.',
      },
      {
        id: 'telc-b2-practice-listening-2-q3',
        question: 'Wer etwas reparieren lassen möchte, muss dafür einen festen Betrag bezahlen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Die Reparatur kostet nichts; es gibt nur eine freiwillige Spendenkasse. Lediglich größere Ersatzteile zahlen die Besucher selbst.',
      },
      {
        id: 'telc-b2-practice-listening-2-q4',
        question: 'Bei Smartphones stößt das Team häufig an seine Grenzen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Frau Albrecht sagt, viele Smartphones seien so verklebt, dass man sie kaum öffnen könne, und man müsse dort oft passen.',
      },
      {
        id: 'telc-b2-practice-listening-2-q5',
        question: 'Bei mehr als der Hälfte der mitgebrachten Dinge ist die Reparatur erfolgreich.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'In etwa zwei von drei Fällen nehmen die Besucher einen funktionierenden Gegenstand mit nach Hause.',
      },
      {
        id: 'telc-b2-practice-listening-2-q6',
        question: 'Die Besucher lassen ihre Geräte da und holen sie später repariert wieder ab.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Es gibt keinen Abgabeschalter; die Besucher reparieren gemeinsam mit einem Helfer am Tisch.',
      },
      {
        id: 'telc-b2-practice-listening-2-q7',
        question: 'Für einige ältere Gäste ist vor allem der Kontakt zu anderen Menschen wichtig.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Frau Albrecht glaubt, dass manche allein lebende Stammgäste vor allem kommen, um unter Menschen zu sein.',
      },
      {
        id: 'telc-b2-practice-listening-2-q8',
        question:
          'Der Inhaber des örtlichen Reparaturgeschäfts betrachtet das Café bis heute als Konkurrenz.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Er war nur am Anfang skeptisch; heute arbeitet er mit dem Café zusammen und hat dadurch sogar neue Kunden gewonnen.',
      },
      {
        id: 'telc-b2-practice-listening-2-q9',
        question: 'Frau Albrecht ist der Meinung, dass Ersatzteile noch immer zu viel kosten.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Sie nennt die Preise für Ersatzteile das größte Problem und sagt, hier müsse sich dringend etwas ändern.',
      },
      {
        id: 'telc-b2-practice-listening-2-q10',
        question:
          'Im nächsten Jahr soll in einem Nachbarort ein zweites Reparaturcafé eröffnet werden.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Für ein zweites Café fehlen die Helfer; stattdessen plant das Team für das nächste Jahr Reparaturkurse an Schulen.',
      },
    ],
    audio: { shared: '/audio/listening/telc-de-b2/telc-b2-practice-listening-2/shared.wav' },
  },
  {
    id: 'telc-b2-practice-listening-3',
    title: 'Durchsagen und Nachrichten im Alltag',
    testingPart: 3,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'Sie hören fünf kurze Texte. Sie hören jeden Text nur einmal. Entscheiden Sie, ob die Aussagen richtig oder falsch sind.',
    items: [
      {
        id: 'telc-b2-practice-listening-3-i1',
        context: 'Sie hören eine Durchsage am Bahnhof.',
        transcript:
          'Sie hören eine Durchsage am Bahnhof. Achtung an Gleis 3. Der Regionalexpress nach Erfurt, planmäßige Abfahrt 16 Uhr 12, fährt heute nicht von Gleis 3, sondern von Gleis 7 ab. Grund dafür ist eine Störung an einer Weiche. Der Zug hat voraussichtlich 15 Minuten Verspätung. Reisende in Richtung Gotha und Erfurt werden gebeten, sich zu Gleis 7 zu begeben. Bitte beachten Sie außerdem: Die Wagen der ersten Klasse halten heute im vorderen Bereich des Bahnsteigs. Wir bitten um Entschuldigung.',
        question: 'Der Zug nach Erfurt fährt heute an einem anderen Gleis ab als gewöhnlich.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Der Regionalexpress fährt wegen einer Weichenstörung nicht von Gleis 3, sondern von Gleis 7 ab.',
      },
      {
        id: 'telc-b2-practice-listening-3-i2',
        context: 'Sie hören eine Nachricht auf dem Anrufbeantworter.',
        transcript:
          'Sie hören eine Nachricht auf dem Anrufbeantworter. Guten Tag, Herr Lorenz, hier ist Petra Wendt von der Autowerkstatt Seidel. Es geht um Ihren Wagen, den Sie uns am Montag gebracht haben. Leider ist das Ersatzteil für die Bremsen nicht wie versprochen gestern geliefert worden, es kommt erst morgen früh. Ihr Auto ist deshalb nicht wie besprochen am Mittwoch fertig, sondern erst am Donnerstag. Sie können es dann ab 14 Uhr bei uns abholen, wir haben bis 19 Uhr geöffnet. Wenn Sie Fragen haben, rufen Sie mich gern zurück. Auf Wiederhören.',
        question: 'Herr Lorenz kann seinen Wagen am Donnerstagnachmittag abholen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Wegen des verspäteten Ersatzteils ist das Auto erst am Donnerstag fertig und kann ab 14 Uhr abgeholt werden.',
      },
      {
        id: 'telc-b2-practice-listening-3-i3',
        context: 'Sie hören eine Verkehrsmeldung im Radio.',
        transcript:
          'Sie hören eine Verkehrsmeldung im Radio. Und nun zur Verkehrslage. Auf der Autobahn 7 wird ab heute Abend zwischen dem Kreuz Lindhausen und der Anschlussstelle Brunnfeld die Fahrbahn erneuert. In Richtung Norden ist die Strecke deshalb in den nächsten fünf Nächten jeweils von 21 Uhr bis 5 Uhr morgens voll gesperrt. Tagsüber steht ein Fahrstreifen zur Verfügung. Eine Umleitung über die Bundesstraße 27 ist ausgeschildert. Rechnen Sie in den Nachtstunden mit bis zu 30 Minuten Verzögerung.',
        question: 'Die Autobahn ist in Richtung Norden auch tagsüber komplett gesperrt.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Die Vollsperrung gilt nur nachts von 21 bis 5 Uhr; tagsüber ist ein Fahrstreifen befahrbar.',
      },
      {
        id: 'telc-b2-practice-listening-3-i4',
        context: 'Sie hören eine Ansage am Telefon.',
        transcript:
          'Sie hören eine Ansage am Telefon. Willkommen beim Bürgeramt der Stadt Hallerbach. Unsere Servicezeiten sind montags bis freitags von 8 bis 16 Uhr, donnerstags bis 18 Uhr. Wenn Sie einen Termin für einen Personalausweis oder einen Reisepass vereinbaren möchten, drücken Sie bitte die 1. Für Fragen zur Anmeldung oder Ummeldung Ihres Wohnsitzes drücken Sie die 2. Für alle anderen Anliegen bleiben Sie bitte in der Leitung. Übrigens können Sie Termine rund um die Uhr auch bequem auf unserer Internetseite buchen. Dort finden Sie auch eine Liste der Unterlagen, die Sie mitbringen müssen.',
        question: 'Einen Termin beim Bürgeramt kann man nur telefonisch vereinbaren.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 1,
        explanation:
          'Die Ansage weist darauf hin, dass man Termine jederzeit auch auf der Internetseite des Bürgeramts buchen kann.',
      },
      {
        id: 'telc-b2-practice-listening-3-i5',
        context: 'Sie hören einen Veranstaltungshinweis im Radio.',
        transcript:
          'Sie hören einen Veranstaltungshinweis im Radio. Eine wichtige Information für alle, die heute Abend zum Sommerkonzert in den Stadtpark von Rosental wollen: Wegen der angekündigten Gewitter findet das Konzert nicht im Freien statt, sondern in der Stadthalle am Marktplatz. Beginn ist wie geplant um 20 Uhr, Einlass ab 19 Uhr. Bereits gekaufte Eintrittskarten gelten auch in der Stadthalle. Weil es dort weniger Plätze gibt, bleibt die Abendkasse allerdings geschlossen. Die Veranstalter bitten außerdem, mit Bus oder Bahn anzureisen, da es rund um die Halle kaum Parkplätze gibt.',
        question:
          'Wer bereits eine Karte gekauft hat, kann damit auch das Konzert in der Stadthalle besuchen.',
        options: ['Richtig', 'Falsch'],
        correctAnswer: 0,
        explanation:
          'Die schon verkauften Eintrittskarten behalten laut Hinweis auch in der Stadthalle ihre Gültigkeit.',
      },
    ],
    audio: {
      items: {
        'telc-b2-practice-listening-3-i1':
          '/audio/listening/telc-de-b2/telc-b2-practice-listening-3/telc-b2-practice-listening-3-i1.wav',
        'telc-b2-practice-listening-3-i2':
          '/audio/listening/telc-de-b2/telc-b2-practice-listening-3/telc-b2-practice-listening-3-i2.wav',
        'telc-b2-practice-listening-3-i3':
          '/audio/listening/telc-de-b2/telc-b2-practice-listening-3/telc-b2-practice-listening-3-i3.wav',
        'telc-b2-practice-listening-3-i4':
          '/audio/listening/telc-de-b2/telc-b2-practice-listening-3/telc-b2-practice-listening-3-i4.wav',
        'telc-b2-practice-listening-3-i5':
          '/audio/listening/telc-de-b2/telc-b2-practice-listening-3/telc-b2-practice-listening-3-i5.wav',
      },
    },
  },
]
