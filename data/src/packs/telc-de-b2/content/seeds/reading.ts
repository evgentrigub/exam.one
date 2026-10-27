/** Original app-authored telc Deutsch B2 practice content; not official examination material. */

const P1 = 'telc-b2-practice-reading-1'
const P1_HEADLINES = [
  'a · Innenstadt: Mieten für Geschäftsräume steigen weiter',
  'b · Ausbildung abgebrochen: Oft passte das Bild vom Beruf nicht',
  'c · Senioren-Wohngemeinschaften werden immer beliebter',
  'd · Kürzer arbeiten, seltener krank',
  'e · Holzbau: Neue Vorschriften verteuern Bauprojekte',
  'f · Leere Schaufenster als Chance für junge Geschäftsideen',
  'g · Betriebe finden kaum noch Ausbilderinnen und Ausbilder',
  'h · Mitbestimmen von Anfang an: Ein Haus nach den Wünschen seiner Bewohner',
  'i · Vier-Tage-Woche: Beschäftigte fordern vollen Lohnausgleich',
  'j · Große Wohnung gegen kleine: Tauschbörse hilft beim Verkleinern',
]

const P3 = 'telc-b2-practice-reading-3'
const P3_ADS = [
  'a · Gesprächskreis „Deutsch im Alltag“',
  'b · Sprachschule am Markt – Bewerbungstraining',
  'c · Stadtbibliothek – Digitalsprechstunde 60+',
  'd · Hallenbad Süd – Ferienschwimmkurse',
  'e · Wochenblatt Talstadt – Freie Mitarbeit',
  'f · Fahrradwerkstatt „Schraubzeit“',
  'g · Gebrauchtwarenhaus Brückenschlag',
  'h · Entrümpelung Fix & Frei',
  'i · Tierpension Waldblick',
  'j · Lauftreff Stadtpark',
  'k · Nachbarschaftsnetz Grünau',
  'l · Ferienhof Sonnenwiese',
  'x · Keine passende Anzeige',
]

const P4 = 'telc-b2-practice-reading-4'

const P5 = 'telc-b2-practice-reading-5'
const P5_BANK = [
  'Angebot',
  'Anlass',
  'aufhält',
  'ausleihen',
  'beschweren',
  'Erfolg',
  'erlaubt',
  'Kosten',
  'Rechnung',
  'überholt',
  'Umgang',
  'Unterstützung',
  'verboten',
  'verleihen',
  'Zugang',
]

export const readingSeeds: Record<string, unknown>[] = [
  {
    id: P1,
    title: 'Wohnen und Arbeiten im Wandel',
    testingPart: 1,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      '1 · Seit Jahren stehen in der Altstadt von Bergheim am Main immer mehr Geschäfte leer. Nun versucht die Stadt, den Trend mit einem ungewöhnlichen Angebot umzukehren: Wer eine überzeugende Idee für ein Café, eine Werkstatt oder einen kleinen Laden hat, kann eines der leeren Ladenlokale ein Jahr lang mietfrei nutzen. Die Kosten übernimmt die Stadt gemeinsam mit den Eigentümern, die dafür eine geringere Grundsteuer zahlen. Bewerben können sich vor allem Gründerinnen und Gründer, die noch kaum eigenes Kapital haben. „Wir wollen, dass die Menschen wieder gern durch die Altstadt bummeln“, sagt Bürgermeisterin Petra Lindner. Acht Läden haben bereits neue Nutzer gefunden, darunter eine Fahrradwerkstatt und ein Laden für unverpackte Lebensmittel.\n' +
      '2 · Ein Jahr lang haben die rund 120 Beschäftigten des Maschinenbauers Kessler & Sohn aus Hagenau nur noch vier Tage pro Woche gearbeitet – bei gleichem Gehalt. Jetzt liegen die Ergebnisse vor, und sie fallen überwiegend positiv aus. Die Produktion ist nicht zurückgegangen, weil Abläufe gestrafft und unnötige Besprechungen gestrichen wurden. Vor allem aber hat sich die Zahl der Krankheitstage fast halbiert. Viele Mitarbeitende berichten, dass sie sich am langen Wochenende besser erholen können. Nicht alle sind jedoch begeistert: Einige vermissen den Austausch mit Kolleginnen und Kollegen, weil sich die Teams seltener begegnen. Die Geschäftsleitung will das Modell trotzdem beibehalten und plant, es auch an den anderen Standorten einzuführen.\n' +
      '3 · Viele ältere Menschen wohnen allein in großen Wohnungen, während junge Familien verzweifelt nach mehr Platz suchen. Die städtische Wohnungsgesellschaft in Langenfurt bringt beide Gruppen jetzt zusammen. Über eine neue Tauschbörse können Mieterinnen und Mieter ihre Wohnung gegen eine kleinere oder größere aus dem Bestand der Gesellschaft tauschen. Der Clou: Die bisherige Miete pro Quadratmeter bleibt erhalten, sodass niemand durch den Wechsel finanziell benachteiligt wird. Außerdem hilft eine Beraterin beim Papierkram und vermittelt auf Wunsch Umzugshelfer. „Viele Seniorinnen wären längst umgezogen, wenn eine kleinere Wohnung nicht teurer gewesen wäre als ihre alte“, erklärt Projektleiter Jonas Hartwig. In den ersten drei Monaten wurden bereits 45 Wohnungen getauscht.\n' +
      '4 · Fast jeder vierte Auszubildende beendet seine Lehre vorzeitig, die meisten davon bereits im ersten Jahr. Eine aktuelle Befragung unter 2.000 ehemaligen Lehrlingen zeigt nun, woran das häufig liegt: Nicht der niedrige Lohn oder schwierige Prüfungen sind der Hauptgrund, sondern falsche Vorstellungen vom Beruf. Viele junge Leute wussten vor Beginn kaum, wie ihr Arbeitsalltag tatsächlich aussieht – etwa, dass Bäcker sehr früh aufstehen oder Elektroniker oft bei Kälte auf Baustellen arbeiten. Die Autoren der Studie empfehlen deshalb, vor der Unterschrift unbedingt ein Praktikum im Betrieb zu machen. Auch Eltern und Lehrkräfte sollten Jugendliche ermutigen, verschiedene Berufe auszuprobieren, statt sich nur auf bekannte Berufsbezeichnungen zu verlassen.\n' +
      '5 · Statt eine fertige Wohnung zu kaufen, haben sich in Freiwalde zwanzig Haushalte zu einer Genossenschaft zusammengeschlossen und ihr Wohnhaus selbst geplant. Zwei Jahre lang trafen sie sich regelmäßig mit einer Architektin und entschieden gemeinsam über Grundrisse, Materialien und Gemeinschaftsräume. Herausgekommen ist ein dreistöckiges Holzhaus mit Wohnungen für Singles, Paare und Familien, einer gemeinsamen Werkstatt, einem Gästezimmer und einem großen Garten. „Natürlich gab es auch Streit, zum Beispiel über die Farbe der Fassade“, erzählt Bewohner Tobias Krämer lachend. Doch am Ende hätten alle das Gefühl, dass das Haus wirklich ihres sei. Auch nach dem Einzug werden wichtige Fragen weiterhin in einer monatlichen Versammlung abgestimmt.',
    questions: [
      {
        id: `${P1}-q1`,
        textId: P1,
        question: 'Text 1',
        options: P1_HEADLINES,
        correctAnswer: 5,
        explanation:
          'Die Stadt bietet leere Ladenlokale ein Jahr lang mietfrei für Gründerinnen und Gründer an. Überschrift a passt nicht, denn von steigenden Mieten ist keine Rede.',
        type: 'matching',
      },
      {
        id: `${P1}-q2`,
        textId: P1,
        question: 'Text 2',
        options: P1_HEADLINES,
        correctAnswer: 3,
        explanation:
          'Bei der Vier-Tage-Woche „hat sich die Zahl der Krankheitstage fast halbiert“. Eine Lohnforderung (i) gibt es nicht, weil das Gehalt ohnehin gleich bleibt.',
        type: 'matching',
      },
      {
        id: `${P1}-q3`,
        textId: P1,
        question: 'Text 3',
        options: P1_HEADLINES,
        correctAnswer: 9,
        explanation:
          'Über eine Tauschbörse können ältere Menschen ihre große Wohnung gegen eine kleinere tauschen, ohne mehr Miete zu zahlen. Wohngemeinschaften (c) werden nicht erwähnt.',
        type: 'matching',
      },
      {
        id: `${P1}-q4`,
        textId: P1,
        question: 'Text 4',
        options: P1_HEADLINES,
        correctAnswer: 1,
        explanation:
          'Hauptgrund für den Abbruch sind laut Befragung „falsche Vorstellungen vom Beruf“. Ein Mangel an Ausbildern (g) kommt im Text nicht vor.',
        type: 'matching',
      },
      {
        id: `${P1}-q5`,
        textId: P1,
        question: 'Text 5',
        options: P1_HEADLINES,
        correctAnswer: 7,
        explanation:
          'Die Bewohner haben ihr Haus gemeinsam mit einer Architektin selbst geplant und stimmen weiterhin über alles ab. Das Haus ist zwar aus Holz, aber neue Vorschriften (e) spielen keine Rolle.',
        type: 'matching',
      },
    ],
    textType: 'article',
    wordCount: 539,
    estimatedReadingTime: 20,
    topics: ['Wohnen', 'Arbeit', 'Stadtentwicklung'],
  },
  {
    id: 'telc-b2-practice-reading-2',
    title: 'Grüne Klimaanlagen: Warum Städte mehr Bäume brauchen',
    testingPart: 2,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'Grüne Klimaanlagen: Warum Städte mehr Bäume brauchen\n' +
      'Wer an einem heißen Sommertag durch eine Innenstadt läuft, merkt den Unterschied sofort: Auf einem gepflasterten Platz ohne Schatten scheint die Luft zu stehen, während es wenige Meter weiter unter einer alten Linde angenehm kühl ist. Was viele Menschen intuitiv spüren, lässt sich inzwischen genau messen. Forschende der Universität Rheinfeld haben im vergangenen Sommer an über hundert Stellen in drei Großstädten Temperaturen aufgezeichnet. Die Daten stammen von Sensoren, die in zwei Metern Höhe an Laternen und Hauswänden angebracht waren. Das Ergebnis: Unter großen Bäumen war die gefühlte Temperatur am Nachmittag um bis zu zwölf Grad niedriger als auf offenen Asphaltflächen.\n' +
      'Dass Bäume kühlen, liegt nur zum Teil an ihrem Schatten. Mindestens ebenso wichtig ist ein Vorgang, den man von außen nicht sieht: Über ihre Blätter geben Bäume große Mengen Wasser an die Luft ab. Beim Verdunsten wird der Umgebung Wärme entzogen – ähnlich wie bei einem Menschen, der schwitzt. Eine ausgewachsene Buche kann an einem Sommertag mehrere hundert Liter Wasser verdunsten. „Ein einzelner großer Baum leistet so viel wie mehrere Klimageräte, nur ohne Strom und ohne Lärm“, sagt die Stadtökologin Dr. Miriam Achterberg, die das Projekt leitet.\n' +
      'Allerdings ist nicht jeder Baum gleich wirksam. Die Messungen zeigen, dass junge, frisch gepflanzte Bäume in den ersten Jahren kaum einen Effekt haben. Ihre Kronen sind noch zu klein, und ihre Wurzeln erreichen nicht genug Wasser. Erst nach fünfzehn bis zwanzig Jahren entfalten sie ihre volle Wirkung. Deshalb warnen die Forschenden davor, alte Bäume für Bauprojekte zu fällen und sie durch Neupflanzungen „auszugleichen“. Rechnerisch mag die Zahl der Bäume dann gleich bleiben, für das Stadtklima bedeutet der Tausch aber über Jahrzehnte einen Verlust.\n' +
      'Hinzu kommt, dass es die Bäume in der Stadt selbst schwer haben. Versiegelte Böden lassen kaum Regenwasser durch, Streusalz im Winter schädigt die Wurzeln, und in den immer häufigeren Trockenperioden leiden besonders Arten, die früher als typische Stadtbäume galten, etwa Ahorn und Kastanie. Viele Kommunen experimentieren daher mit Arten aus Südeuropa, die Hitze und Trockenheit besser vertragen. Außerdem pflanzen manche Städte bewusst verschiedene Arten nebeneinander, damit ein einzelner Schädling nicht ganze Straßenzüge kahl fressen kann. Ganz unumstritten ist das nicht: Naturschützer weisen darauf hin, dass einheimische Insekten mit fremden Baumarten oft wenig anfangen können.\n' +
      'Eine vielversprechende Lösung sehen die Forschenden im Prinzip der sogenannten Schwammstadt. Dabei wird Regenwasser nicht mehr möglichst schnell in die Kanalisation geleitet, sondern in unterirdischen Speichern und lockeren Bodenschichten gesammelt, aus denen sich die Bäume auch in trockenen Wochen versorgen können. In einigen Stadtteilen von Rheinfeld werden Straßen bereits entsprechend umgebaut. Das kostet zunächst mehr Geld, spart aber auf lange Sicht Ausgaben für das Gießen und schützt gleichzeitig vor Überschwemmungen bei Starkregen. Auch die Kanalisation wird dadurch spürbar entlastet.\n' +
      'Für die Bewohnerinnen und Bewohner hat das Thema auch eine soziale Seite. Die Untersuchung ergab, dass ausgerechnet in dicht bebauten Vierteln mit niedrigen Mieten besonders wenige Bäume stehen. Gerade dort leben aber viele ältere Menschen und Familien mit kleinen Kindern, für die Hitze ein Gesundheitsrisiko darstellt. Achterberg fordert deshalb, bei der Planung neuer Grünflächen zuerst diese Viertel zu berücksichtigen. „Schatten darf kein Luxus sein“, sagt sie. Einige Städte bieten inzwischen Baumpatenschaften an, bei denen Anwohner sich freiwillig um das Gießen kümmern – ein kleiner Beitrag, der im Hochsommer über das Überleben eines jungen Baumes entscheiden kann.',
    questions: [
      {
        id: 'telc-b2-practice-reading-2-q1',
        textId: 'telc-b2-practice-reading-2',
        question: 'Was haben die Messungen der Universität Rheinfeld ergeben?',
        options: [
          'Unter großen Bäumen fühlte es sich nachmittags deutlich kühler an als auf Asphaltflächen.',
          'In den drei untersuchten Städten war es im vergangenen Sommer zwölf Grad heißer als üblich.',
          'Auf gepflasterten Plätzen war die Luft feuchter als unter alten Bäumen.',
        ],
        correctAnswer: 0,
        explanation:
          'Im ersten Absatz heißt es, die gefühlte Temperatur sei unter großen Bäumen „um bis zu zwölf Grad niedriger als auf offenen Asphaltflächen“ gewesen. Die zwölf Grad beschreiben also den Unterschied, nicht einen besonders heißen Sommer.',
        type: 'selection',
      },
      {
        id: 'telc-b2-practice-reading-2-q2',
        textId: 'telc-b2-practice-reading-2',
        question: 'Warum kühlen Bäume ihre Umgebung?',
        options: [
          'Fast ausschließlich, weil ihre Kronen viel Schatten spenden.',
          'Weil sie nachts kühle Luft speichern und tagsüber wieder abgeben.',
          'Neben dem Schatten auch, weil sie Wasser verdunsten und der Luft dabei Wärme entziehen.',
        ],
        correctAnswer: 2,
        explanation:
          'Die Kühlung liegt „nur zum Teil an ihrem Schatten“; ebenso wichtig ist, dass beim Verdunsten über die Blätter „der Umgebung Wärme entzogen“ wird.',
        type: 'selection',
      },
      {
        id: 'telc-b2-practice-reading-2-q3',
        textId: 'telc-b2-practice-reading-2',
        question: 'Was halten die Forschenden davon, alte Bäume durch junge zu ersetzen?',
        options: [
          'Das sei in Ordnung, solange die Gesamtzahl der Bäume gleich bleibt.',
          'Das schade dem Stadtklima, weil junge Bäume erst nach vielen Jahren richtig wirken.',
          'Das sei nur vertretbar, wenn mindestens doppelt so viele junge Bäume gepflanzt werden.',
        ],
        correctAnswer: 1,
        explanation:
          'Junge Bäume entfalten erst „nach fünfzehn bis zwanzig Jahren“ ihre volle Wirkung; der Tausch bedeute deshalb „über Jahrzehnte einen Verlust“, auch wenn die Zahl gleich bleibt.',
        type: 'selection',
      },
      {
        id: 'telc-b2-practice-reading-2-q4',
        textId: 'telc-b2-practice-reading-2',
        question: 'Was sagt der Text über Baumarten aus Südeuropa?',
        options: [
          'Sie vertragen Trockenheit besser, sind aber für heimische Insekten oft wenig nützlich.',
          'Sie haben Ahorn und Kastanie in den meisten Städten bereits ersetzt.',
          'Naturschützer empfehlen sie als beste Lösung gegen die Hitze.',
        ],
        correctAnswer: 0,
        explanation:
          'Die Arten „vertragen Hitze und Trockenheit besser“, doch Naturschützer kritisieren, dass „einheimische Insekten mit fremden Baumarten oft wenig anfangen können“. Kommunen experimentieren erst damit.',
        type: 'selection',
      },
      {
        id: 'telc-b2-practice-reading-2-q5',
        textId: 'telc-b2-practice-reading-2',
        question: 'Was fordert Dr. Achterberg?',
        options: [
          'Anwohner sollen verpflichtet werden, die Stadtbäume vor ihrem Haus zu gießen.',
          'In Vierteln mit hohen Mieten sollen zuerst neue Grünflächen entstehen.',
          'Neue Grünflächen sollen vor allem in dicht bebauten Vierteln mit niedrigen Mieten entstehen.',
        ],
        correctAnswer: 2,
        explanation:
          'Achterberg will bei der Planung „zuerst diese Viertel“ berücksichtigen, also dicht bebaute Viertel mit niedrigen Mieten. Baumpatenschaften sind freiwillig, keine Pflicht.',
        type: 'selection',
      },
    ],
    textType: 'article',
    wordCount: 546,
    estimatedReadingTime: 25,
    topics: ['Umwelt', 'Stadtklima', 'Gesundheit'],
  },
  {
    id: P3,
    title: 'Angebote in der Stadt',
    testingPart: 3,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'a · Gesprächskreis „Deutsch im Alltag“: Sie verstehen schon viel, trauen sich aber noch nicht zu sprechen? In unserer kleinen Gruppe üben Sie Alltagssituationen wie Arztbesuch, Elternabend oder Behördengang. Treffpunkt ist das Familienzentrum Nordstadt, jeweils montags und mittwochs von 18 bis 19.30 Uhr. Die Teilnahme ist kostenlos, eine Anmeldung ist nicht nötig. Kommen Sie einfach vorbei!\n' +
      'b · Sprachschule am Markt – Bewerbungstraining: Überzeugen Sie im Vorstellungsgespräch! In unserem Intensivkurs für Teilnehmende mit Deutschkenntnissen ab B1 üben Sie typische Fragen, Selbstpräsentation und Small Talk – mit Videoaufnahme und persönlichem Feedback. Der Kurs findet an vier Samstagen jeweils von 9 bis 13 Uhr statt. Kursgebühr: 160 Euro, für Arbeitsuchende ermäßigt.\n' +
      'c · Stadtbibliothek – Digitalsprechstunde 60+: Ihr neues Handy macht Ihnen mehr Ärger als Freude? Ehrenamtliche Helferinnen und Helfer erklären Ihnen in Ruhe, wie Sie Nachrichten schreiben, Fotos verschicken oder Videotelefonate mit der Familie führen. Bringen Sie einfach Ihr eigenes Gerät mit. Jeden Donnerstag von 10 bis 12 Uhr im Lesecafé, kostenlos und ohne Anmeldung.\n' +
      'd · Hallenbad Süd – Ferienschwimmkurse: In den Sommerferien bieten wir täglich Anfängerkurse für Kinder von 6 bis 10 Jahren an. In zwei Wochen lernen die Kinder in kleinen Gruppen sicher schwimmen und können am Ende ihr erstes Schwimmabzeichen machen. Kurszeiten: Montag bis Freitag, 9 bis 10 Uhr. Anmeldung ab sofort an der Kasse oder telefonisch.\n' +
      'e · Wochenblatt Talstadt – Freie Mitarbeit: Sie schreiben gern und kennen sich in Ihrer Stadt aus? Unsere Lokalredaktion sucht freie Mitarbeiterinnen und Mitarbeiter, die über Vereinsfeste, Konzerte und Sportereignisse berichten. Erste Schreiberfahrungen sind erwünscht, ein Führerschein ist von Vorteil. Sie müssen mindestens 18 Jahre alt sein. Wir zahlen ein Honorar pro veröffentlichtem Artikel.\n' +
      'f · Fahrradwerkstatt „Schraubzeit“: Bei uns wird nicht für Sie repariert – sondern mit Ihnen! Unter Anleitung erfahrener Mechaniker lernen Sie, Schläuche zu flicken, Bremsen einzustellen oder die Kette zu wechseln. Werkzeug ist vorhanden, Ersatzteile gibt es zum Selbstkostenpreis. Geöffnet dienstags und freitags von 16 bis 20 Uhr im Hinterhof der Gartenstraße 12. Spenden sind willkommen.\n' +
      'g · Gebrauchtwarenhaus Brückenschlag: Sie ziehen um oder richten sich neu ein? Wir holen gut erhaltene Möbel, Lampen und Haushaltsgeräte im Stadtgebiet kostenlos bei Ihnen ab und verkaufen sie günstig an Menschen mit kleinem Einkommen weiter. Rufen Sie uns an und vereinbaren Sie einen Termin. Bitte beachten Sie: Beschädigte oder stark verschmutzte Gegenstände können wir leider nicht annehmen.\n' +
      'h · Entrümpelung Fix & Frei: Keller voll, Dachboden überfüllt? Wir räumen Wohnungen, Häuser und Garagen schnell und zuverlässig – auch kurzfristig und am Wochenende. Alte Möbel, Elektrogeräte und Sperrmüll entsorgen wir fachgerecht. Besichtigung und Kostenvoranschlag sind kostenlos, die Räumung selbst berechnen wir nach Aufwand. Rufen Sie uns an, wir beraten Sie gern.\n' +
      'i · Tierpension Waldblick: Für unsere Hunde- und Katzenpension am Stadtrand suchen wir zuverlässige Aushilfen für Samstag und Sonntag. Ihre Aufgaben: Füttern, Gehege reinigen und mit den Hunden spazieren gehen. Erfahrung mit Tieren ist erwünscht, aber keine Bedingung. Wir bieten 14 Euro pro Stunde und ein nettes Team. Ideal für Studierende und alle ab 18 Jahren.\n' +
      'j · Lauftreff Stadtpark: Allein laufen macht keinen Spaß? Dann komm zu uns! Wir treffen uns jeden Dienstag und Donnerstag um 19 Uhr am Haupteingang des Stadtparks und laufen in zwei Gruppen – einer gemütlichen und einer schnelleren. Anfängerinnen und Anfänger sind herzlich willkommen. Die Teilnahme ist kostenlos, eine Vereinsmitgliedschaft ist nicht nötig.\n' +
      'k · Nachbarschaftsnetz Grünau: Sie fahren in den Urlaub und niemand kümmert sich um Ihre Wohnung? Über unser Netzwerk finden Sie freundliche Nachbarinnen und Nachbarn, die Ihre Blumen gießen, den Briefkasten leeren und ab und zu lüften. Im Gegenzug helfen Sie anderen, wenn Sie Zeit haben. Anmeldung im Nachbarschaftsbüro am Lindenplatz 3 oder online.\n' +
      'l · Ferienhof Sonnenwiese: Erleben Sie Landleben pur! Unsere gemütlichen Ferienwohnungen auf dem Bauernhof sind ideal für Familien mit Kindern. Tiere füttern, Traktor fahren und frische Milch probieren – hier wird es nie langweilig. Übernachtung ab 55 Euro pro Nacht, auch für ein einzelnes Wochenende buchbar. Bitte haben Sie Verständnis, dass Haustiere bei uns nicht erlaubt sind.',
    questions: [
      {
        id: `${P3}-q1`,
        textId: P3,
        question:
          'Herr und Frau Brandt möchten ihr gut erhaltenes Sofa loswerden, ohne dafür etwas zu bezahlen.',
        options: P3_ADS,
        correctAnswer: 6,
        explanation:
          'Das Gebrauchtwarenhaus holt gut erhaltene Möbel „kostenlos bei Ihnen ab“. Die Entrümpelungsfirma (h) berechnet die Räumung „nach Aufwand“.',
        type: 'matching',
      },
      {
        id: `${P3}-q2`,
        textId: P3,
        question:
          'Lena, 22, studiert und sucht einen bezahlten Wochenendjob, bei dem sie mit Tieren arbeitet.',
        options: P3_ADS,
        correctAnswer: 8,
        explanation:
          'Die Tierpension sucht Aushilfen für Samstag und Sonntag, zahlt „14 Euro pro Stunde“ und nennt ausdrücklich Studierende.',
        type: 'matching',
      },
      {
        id: `${P3}-q3`,
        textId: P3,
        question:
          'Herr Yilmaz möchte sich auf Vorstellungsgespräche auf Deutsch vorbereiten, hat aber nur samstags Zeit.',
        options: P3_ADS,
        correctAnswer: 1,
        explanation:
          'Das Bewerbungstraining der Sprachschule findet „an vier Samstagen“ statt. Der Gesprächskreis (a) trifft sich montags und mittwochs und übt Alltagssituationen.',
        type: 'matching',
      },
      {
        id: `${P3}-q4`,
        textId: P3,
        question:
          'Familie Roth möchte mit ihrem Hund ein Wochenende auf einem Bauernhof verbringen.',
        options: P3_ADS,
        correctAnswer: 12,
        explanation:
          'Der Ferienhof (l) bietet zwar Wochenenden auf dem Bauernhof an, aber „Haustiere [sind] bei uns nicht erlaubt“. Keine andere Anzeige passt.',
        type: 'matching',
      },
      {
        id: `${P3}-q5`,
        textId: P3,
        question:
          'Herr Weber, 72, möchte lernen, wie er mit seinen Enkeln per Video telefonieren kann.',
        options: P3_ADS,
        correctAnswer: 2,
        explanation:
          'In der Digitalsprechstunde 60+ wird erklärt, wie man „Videotelefonate mit der Familie“ führt.',
        type: 'matching',
      },
      {
        id: `${P3}-q6`,
        textId: P3,
        question: 'Herr Kowalski möchte nach der Arbeit regelmäßig gemeinsam mit anderen joggen.',
        options: P3_ADS,
        correctAnswer: 9,
        explanation:
          'Der Lauftreff trifft sich zweimal pro Woche um 19 Uhr, also nach der üblichen Arbeitszeit, und läuft in Gruppen.',
        type: 'matching',
      },
      {
        id: `${P3}-q7`,
        textId: P3,
        question:
          'Frau Novak sucht für ihren achtjährigen Sohn einen Schwimmkurs in den Sommerferien.',
        options: P3_ADS,
        correctAnswer: 3,
        explanation:
          'Das Hallenbad bietet in den Sommerferien Anfängerkurse „für Kinder von 6 bis 10 Jahren“ an.',
        type: 'matching',
      },
      {
        id: `${P3}-q8`,
        textId: P3,
        question: 'Tom, 16, möchte erste Erfahrungen in einer Zeitungsredaktion sammeln.',
        options: P3_ADS,
        correctAnswer: 12,
        explanation:
          'Das Wochenblatt (e) sucht zwar Mitarbeitende, aber man muss „mindestens 18 Jahre alt sein“. Tom ist zu jung, daher passt keine Anzeige.',
        type: 'matching',
      },
      {
        id: `${P3}-q9`,
        textId: P3,
        question:
          'Frau Aydın möchte lernen, kleine Reparaturen an ihrem Fahrrad selbst zu erledigen.',
        options: P3_ADS,
        correctAnswer: 5,
        explanation:
          'In der Fahrradwerkstatt wird „nicht für Sie repariert – sondern mit Ihnen“; man lernt dort, Schläuche zu flicken und Bremsen einzustellen.',
        type: 'matching',
      },
      {
        id: `${P3}-q10`,
        textId: P3,
        question: 'Frau Lehmann sucht jemanden, der während ihrer Reise ihre Pflanzen versorgt.',
        options: P3_ADS,
        correctAnswer: 10,
        explanation:
          'Über das Nachbarschaftsnetz findet man Nachbarn, die im Urlaub „Ihre Blumen gießen“ und den Briefkasten leeren.',
        type: 'matching',
      },
    ],
    textType: 'advertisement',
    wordCount: 661,
    estimatedReadingTime: 25,
    topics: ['Freizeit', 'Weiterbildung', 'Nachbarschaft'],
  },
  {
    id: P4,
    title: 'E-Mail an eine Freundin: Neuanfang in Freiburg',
    testingPart: 4,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'Liebe Johanna,\n' +
      'vielen Dank für deine lange Nachricht! Entschuldige, dass ich (1) ____ erst jetzt melde, aber die letzten Wochen waren total chaotisch. Wie du weißt, habe ich im Frühjahr eine neue Stelle in Freiburg bekommen, und (2) ____ musste ich ziemlich schnell eine Wohnung finden. Das war gar nicht so einfach, (3) ____ die Mieten hier wirklich hoch sind. Am Ende hatte ich aber Glück: Eine Kollegin, (4) ____ Schwester gerade ins Ausland gezogen ist, hat mir deren Wohnung vermittelt. Sie liegt mitten in der Altstadt, und ich kann sogar mit dem Fahrrad zur Arbeit fahren.\n' +
      'In der Firma habe ich mich inzwischen gut eingelebt. Meine Kolleginnen und Kollegen sind sehr hilfsbereit, und ich interessiere mich sehr (5) ____ die Projekte, an denen wir gerade arbeiten. Nur an das frühe Aufstehen muss ich mich noch gewöhnen!\n' +
      'Hast du nicht Lust, mich bald einmal zu besuchen? (6) ____ du im Oktober Zeit hättest, könnten wir zusammen in den Schwarzwald fahren. Ich habe nämlich schon ein paar schöne Wanderwege entdeckt. Ein Gästebett besitze ich zwar noch nicht, aber bis dahin (7) ____ ich mir bestimmt eins besorgt. Sag mir einfach Bescheid, (8) ____ dir ein Wochenende passt.\n' +
      'Ich würde mich sehr freuen, dich wiederzusehen – wir haben uns ja (9) ____ über einem Jahr nicht mehr getroffen! Grüß bitte auch deine Eltern von (10) ____.\n' +
      'Liebe Grüße\n' +
      'Clara',
    questions: [
      {
        id: `${P4}-q1`,
        textId: P4,
        question: 'Lücke 1',
        options: ['sich', 'mir', 'mich'],
        correctAnswer: 2,
        explanation:
          '„sich melden“ ist reflexiv mit Akkusativ; zur 1. Person Singular gehört „mich“.',
        type: 'selection',
      },
      {
        id: `${P4}-q2`,
        textId: P4,
        question: 'Lücke 2',
        options: ['deshalb', 'trotzdem', 'obwohl'],
        correctAnswer: 0,
        explanation:
          'Die Wohnungssuche ist die Folge der neuen Stelle, und nach der Lücke folgt das Verb („musste“): Das passt nur zum Adverb „deshalb“. „obwohl“ würde einen Nebensatz einleiten.',
        type: 'selection',
      },
      {
        id: `${P4}-q3`,
        textId: P4,
        question: 'Lücke 3',
        options: ['denn', 'weil', 'deshalb'],
        correctAnswer: 1,
        explanation:
          'Das Verb „sind“ steht am Satzende, also braucht man die Nebensatzkonjunktion „weil“. Nach „denn“ stünde das Verb an zweiter Stelle.',
        type: 'selection',
      },
      {
        id: `${P4}-q4`,
        textId: P4,
        question: 'Lücke 4',
        options: ['dessen', 'die', 'deren'],
        correctAnswer: 2,
        explanation:
          'Der Relativsatz bezieht sich auf „eine Kollegin“ und drückt Besitz aus („ihre Schwester“); das feminine Relativpronomen im Genitiv ist „deren“.',
        type: 'selection',
      },
      {
        id: `${P4}-q5`,
        textId: P4,
        question: 'Lücke 5',
        options: ['an', 'für', 'auf'],
        correctAnswer: 1,
        explanation: 'Das Verb heißt „sich interessieren für“ + Akkusativ.',
        type: 'selection',
      },
      {
        id: `${P4}-q6`,
        textId: P4,
        question: 'Lücke 6',
        options: ['Falls', 'Ob', 'Als'],
        correctAnswer: 0,
        explanation:
          'Es geht um eine Bedingung („könnten wir … fahren“), daher „Falls“. „Als“ bezieht sich auf die Vergangenheit, „Ob“ leitet indirekte Fragen ein.',
        type: 'selection',
      },
      {
        id: `${P4}-q7`,
        textId: P4,
        question: 'Lücke 7',
        options: ['bin', 'habe', 'hatte'],
        correctAnswer: 1,
        explanation:
          '„sich etwas besorgen“ bildet das Perfekt mit „haben“; mit „bis dahin“ beschreibt das Perfekt eine in der Zukunft abgeschlossene Handlung. „hatte“ wäre Vergangenheit.',
        type: 'selection',
      },
      {
        id: `${P4}-q8`,
        textId: P4,
        question: 'Lücke 8',
        options: ['wenn', 'als', 'wann'],
        correctAnswer: 2,
        explanation:
          'Nach „Sag mir Bescheid“ folgt eine indirekte Frage nach dem Zeitpunkt; dafür braucht man das Fragewort „wann“.',
        type: 'selection',
      },
      {
        id: `${P4}-q9`,
        textId: P4,
        question: 'Lücke 9',
        options: ['seit', 'vor', 'ab'],
        correctAnswer: 0,
        explanation:
          'Ein Zeitraum, der in der Vergangenheit begann und bis heute andauert, wird mit „seit“ + Dativ ausgedrückt.',
        type: 'selection',
      },
      {
        id: `${P4}-q10`,
        textId: P4,
        question: 'Lücke 10',
        options: ['mich', 'mir', 'ich'],
        correctAnswer: 1,
        explanation: 'Die Präposition „von“ verlangt den Dativ: „von mir“.',
        type: 'selection',
      },
    ],
    textType: 'email',
    wordCount: 227,
    estimatedReadingTime: 10,
    topics: ['Umzug', 'Arbeit', 'Freundschaft'],
  },
  {
    id: P5,
    title: 'Mehr als nur Bücher: Bibliotheken erfinden sich neu',
    testingPart: 5,
    difficulty: 'B2',
    createdAt: '2026-10-25',
    content:
      'Mehr als nur Bücher: Bibliotheken erfinden sich neu\n' +
      'Wer an eine Bibliothek denkt, hat oft lange Regale und strenge Ruhe im Kopf. Doch dieses Bild ist längst (1) ____. Immer mehr öffentliche Bibliotheken verstehen sich heute als Treffpunkt für alle Generationen. In der Stadtbibliothek von Neuwerth zum Beispiel können Besucherinnen und Besucher nicht nur Bücher (2) ____, sondern auch Nähmaschinen, Werkzeug oder Brettspiele. Im Erdgeschoss gibt es ein kleines Café, und am Nachmittag machen Schülerinnen und Schüler dort gemeinsam ihre Hausaufgaben.\n' +
      '„Wir wollen ein Ort sein, an dem man sich gern (3) ____, auch ohne etwas zu kaufen“, erklärt Bibliotheksleiterin Sabine Ohlsen. Gerade für Menschen mit wenig Geld sei das ein wichtiges (4) ____. Besonders beliebt sind die Abendveranstaltungen: Lesungen, Spieleabende und Kurse, in denen ältere Menschen den (5) ____ mit Tablets lernen.\n' +
      'Mit diesem Konzept hat die Bibliothek großen (6) ____: Seit der Umgestaltung ist die Zahl der Besucher um fast vierzig Prozent gestiegen. Möglich wurde der Umbau durch die finanzielle (7) ____ des Landes, das solche Projekte mit mehreren Millionen Euro fördert.\n' +
      'Nicht alle sind jedoch begeistert. Einige langjährige Leserinnen und Leser (8) ____ sich, dass es in den Räumen inzwischen zu laut sei. Die Bibliothek hat deshalb im Obergeschoss einen ruhigen Lesesaal eingerichtet, in dem Gespräche und Telefonieren (9) ____ sind. So soll jeder auf seine (10) ____ kommen.',
    questions: [
      {
        id: `${P5}-q1`,
        textId: P5,
        question: 'Lücke 1',
        options: P5_BANK,
        correctAnswer: 9,
        explanation:
          '„Doch“ kündigt einen Gegensatz an: Das alte Bild der stillen Bibliothek stimmt nicht mehr, es ist „überholt“.',
        type: 'matching',
      },
      {
        id: `${P5}-q2`,
        textId: P5,
        question: 'Lücke 2',
        options: P5_BANK,
        correctAnswer: 3,
        explanation:
          'Die Besucher nehmen Bücher mit nach Hause, sie „leihen“ sie also „aus“. „verleihen“ tut die Bibliothek, nicht der Besucher.',
        type: 'matching',
      },
      {
        id: `${P5}-q3`,
        textId: P5,
        question: 'Lücke 3',
        options: P5_BANK,
        correctAnswer: 2,
        explanation:
          '„sich gern an einem Ort aufhalten“ bedeutet, dort gern Zeit zu verbringen; im Nebensatz steht die finite Form „aufhält“ am Ende.',
        type: 'matching',
      },
      {
        id: `${P5}-q4`,
        textId: P5,
        question: 'Lücke 4',
        options: P5_BANK,
        correctAnswer: 0,
        explanation:
          'Nach „ein wichtiges“ braucht man ein neutrales Nomen; ein kostenloser Treffpunkt ist ein „Angebot“. „Anlass“ ist maskulin und passt inhaltlich nicht.',
        type: 'matching',
      },
      {
        id: `${P5}-q5`,
        textId: P5,
        question: 'Lücke 5',
        options: P5_BANK,
        correctAnswer: 10,
        explanation:
          'Die feste Verbindung lautet „den Umgang mit etwas lernen“. „Zugang“ wird mit „zu“ verbunden.',
        type: 'matching',
      },
      {
        id: `${P5}-q6`,
        textId: P5,
        question: 'Lücke 6',
        options: P5_BANK,
        correctAnswer: 5,
        explanation:
          'Die stark gestiegene Besucherzahl zeigt, dass das Konzept funktioniert: Die Bibliothek hat „großen Erfolg“.',
        type: 'matching',
      },
      {
        id: `${P5}-q7`,
        textId: P5,
        question: 'Lücke 7',
        options: P5_BANK,
        correctAnswer: 11,
        explanation:
          'Das Land „fördert“ solche Projekte mit Geld; der Umbau wurde also durch die finanzielle „Unterstützung“ des Landes möglich.',
        type: 'matching',
      },
      {
        id: `${P5}-q8`,
        textId: P5,
        question: 'Lücke 8',
        options: P5_BANK,
        correctAnswer: 4,
        explanation:
          'Unzufriedene Leser „beschweren sich“ darüber, dass es zu laut sei; das reflexive Verb passt zu „sich, dass …“.',
        type: 'matching',
      },
      {
        id: `${P5}-q9`,
        textId: P5,
        question: 'Lücke 9',
        options: P5_BANK,
        correctAnswer: 12,
        explanation:
          'Ein „ruhiger Lesesaal“ ist die Antwort auf Beschwerden über Lärm, deshalb sind Gespräche dort „verboten“, nicht „erlaubt“.',
        type: 'matching',
      },
      {
        id: `${P5}-q10`,
        textId: P5,
        question: 'Lücke 10',
        options: P5_BANK,
        correctAnswer: 7,
        explanation:
          'Die Redewendung „auf seine Kosten kommen“ bedeutet, dass jeder bekommt, was er sich wünscht.',
        type: 'matching',
      },
    ],
    textType: 'article',
    wordCount: 222,
    estimatedReadingTime: 10,
    topics: ['Kultur', 'Bildung', 'Freizeit'],
  },
]
