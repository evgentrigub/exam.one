// Original mock content. No official Goethe examination items are reproduced.
type Row = [string, string[], number, string]
const tf = ['Richtig', 'Falsch']
function exercise(part: number, title: string, content: string, rows: Row[], topics: string[]) {
  const id = `mock-goethe-de-b1-set1-reading-part${part}`
  return {
    id,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    title,
    content,
    textType: 'article',
    topics,
    wordCount: content.trim().split(/\s+/).length,
    estimatedReadingTime: 8,
    questions: rows.map(([question, options, correctAnswer, explanation], index) => ({
      id: `${id}-q${index + 1}`,
      textId: id,
      question,
      options,
      correctAnswer,
      explanation,
      type: part === 1 || part === 4 ? 'true-false' : 'multiple-choice',
    })),
  }
}
const ads = [
  'a · Fotografieren mit dem Handy',
  'b · Bücher unterwegs',
  'c · Nähen am Abend',
  'd · Garten für alle',
  'e · Computerhilfe zu Hause',
  'f · Wandern am Wochenende',
  'g · Stadtgeschichte zu Fuß',
  'h · Gemeinsam Schach spielen',
  'i · Kleiner Fahrradservice',
  'j · Kochen ohne Fleisch',
  'x · Keine passende Anzeige',
]
export const mockReadingSeeds: Record<string, unknown>[] = [
  exercise(
    1,
    'Eine Nachricht aus Leipzig',
    `Liebe Mira,
seit drei Wochen wohne ich nun in Leipzig. Die Wohnung ist kleiner als meine alte, aber dafür liegt sie direkt neben einer Straßenbahnhaltestelle. Mein Arbeitsplatz ist am anderen Ende der Stadt. Morgens brauche ich trotzdem nur zwanzig Minuten, und ich muss nicht mehr jeden Tag einen Parkplatz suchen.
Am ersten Wochenende wollte ich alle Kartons auspacken. Dann klingelte meine Nachbarin Frau Köhler und lud mich zum Hoffest ein. Zuerst war ich unsicher, weil ich noch niemanden kannte. Schließlich ging ich doch hin und blieb bis zum Abend. Jeder hatte etwas zu essen mitgebracht. Ich hatte nichts vorbereitet, durfte aber helfen, die Tische aufzustellen. Dort lernte ich auch Jonas kennen. Er arbeitet in der Stadtbibliothek und organisiert jeden Mittwoch einen Leseabend. Er fragte mich, ob ich dabei mitmachen möchte. Diese Woche habe ich zum ersten Mal einen kurzen Text vorgelesen. Das war aufregend, aber die Zuhörer waren sehr freundlich.
Du möchtest mich nächsten Monat besuchen. Am Freitag muss ich leider bis sechs arbeiten. Komm doch am Samstagvormittag! Wir könnten zuerst über den Markt gehen und später das neue Fotomuseum besuchen. Die Ausstellung kostet normalerweise acht Euro, am ersten Sonntag im Monat ist der Eintritt jedoch kostenlos. Leider ist dein Besuch am zweiten Wochenende. Übernachten kannst du bei mir; ein Hotel brauchst du also nicht.
Schreib mir bald, welcher Zug für dich passt.
Viele Grüße
Lukas`,
    [
      [
        'Lukas fährt jetzt mit öffentlichen Verkehrsmitteln zur Arbeit.',
        tf,
        0,
        'Er nutzt die Straßenbahn und sucht keinen Parkplatz mehr.',
      ],
      [
        'Lukas hatte für das Hoffest selbst Essen zubereitet.',
        tf,
        1,
        'Er hatte nichts vorbereitet und half beim Aufstellen der Tische.',
      ],
      [
        'Beim Hoffest lernte Lukas einen Mitarbeiter der Bibliothek kennen.',
        tf,
        0,
        'Jonas arbeitet in der Stadtbibliothek.',
      ],
      [
        'Lukas besucht die Leseabende schon seit drei Wochen.',
        tf,
        1,
        'Er hat erst diese Woche zum ersten Mal einen Text vorgelesen.',
      ],
      [
        'Mira kann die Fotoausstellung während ihres Besuchs kostenlos sehen.',
        tf,
        1,
        'Kostenlos ist nur der erste Sonntag; ihr Besuch ist am zweiten Wochenende.',
      ],
      [
        'Lukas bietet Mira einen Schlafplatz in seiner Wohnung an.',
        tf,
        0,
        'Er schreibt ausdrücklich, dass sie bei ihm übernachten kann.',
      ],
    ],
    ['Wohnen', 'Nachbarschaft']
  ),
  exercise(
    2,
    'Zwei Berichte über neue Ideen',
    `Text A · Eine Stunde gegen eine Stunde
Wer gut Fahrräder reparieren kann, braucht vielleicht Hilfe beim Ausfüllen eines Formulars. Wer Formulare versteht, hat möglicherweise keine Zeit, seinen Balkon zu bepflanzen. In Kassel verbindet ein neuer Verein solche Menschen miteinander. Geld wird dabei nicht bezahlt. Für eine Stunde Hilfe erhält man eine Zeitgutschrift, die man später für eine andere Tätigkeit einsetzen kann. Es spielt keine Rolle, ob jemand einen Kuchen backt oder einen Computer einrichtet: Eine Stunde zählt immer gleich viel.
Die Gründerin Selin Yilmaz wollte vor allem ältere und jüngere Bewohner zusammenbringen. Ein Internetportal allein erschien ihr dafür nicht ausreichend. Deshalb findet jeden Monat ein Treffen im Stadtteilzentrum statt. Dort stellen neue Mitglieder ihre Fähigkeiten vor und können Fragen stellen. Wer keinen Computer besitzt, meldet sein Angebot telefonisch an. Der Verein übernimmt allerdings keine Arbeiten, für die eine berufliche Zulassung notwendig ist. Elektrische Leitungen dürfen zum Beispiel nur Fachbetriebe reparieren.
Seit dem Start vor einem halben Jahr haben sich siebzig Menschen angemeldet. Noch suchen manche lange nach einer passenden Hilfe. Der Verein möchte deshalb mehr Mitglieder gewinnen, statt die Zeitgutschriften in Geld umzuwandeln.

Text B · Der Weg zur Schule wird zum Abenteuer
Eine Grundschule in Erfurt hat einen sogenannten Laufbus eingeführt. Das ist kein Fahrzeug: Kinder treffen sich morgens an festen Punkten und gehen gemeinsam zur Schule. Ein Elternteil begleitet jede Gruppe. Nachmittags organisieren die Familien den Heimweg selbst. Die Idee soll den Verkehr vor dem Schultor verringern und den Kindern mehr Bewegung ermöglichen.
Vor dem Beginn prüften Lehrkräfte und Eltern die Wege. Eine gefährliche Kreuzung wurde aus der Route entfernt, obwohl der neue Weg dadurch etwas länger ist. Die Kinder erhalten einen Plan mit den Treffpunkten. Wer zu spät kommt, muss von seiner Familie zur Schule gebracht werden; die Gruppe wartet höchstens zwei Minuten. Bei Regen findet der Laufbus weiterhin statt. Nur bei einer amtlichen Unwetterwarnung fällt er aus.
Viele Kinder erzählen inzwischen, dass sie unterwegs Freunde gefunden haben. Auch die Schulleitung ist zufrieden: Vor dem Eingang stehen morgens deutlich weniger Autos. Im nächsten Schuljahr könnten zwei weitere Gruppen hinzukommen. Voraussetzung ist jedoch, dass genügend Erwachsene die regelmäßige Begleitung übernehmen.`,
    [
      [
        'Text A: Wovon hängt die Zeitgutschrift ab?',
        ['Vom Preis der Arbeit', 'Von der Dauer der Hilfe', 'Vom Alter des Mitglieds'],
        1,
        'Jede Stunde zählt gleich viel, unabhängig von der Tätigkeit.',
      ],
      [
        'Text A: Warum gibt es persönliche Treffen?',
        [
          'Damit Mitglieder sich kennenlernen können',
          'Damit alle einen Computer kaufen',
          'Damit Fachbetriebe ihre Preise erklären',
        ],
        0,
        'Die Gründerin will ältere und jüngere Bewohner miteinander verbinden.',
      ],
      [
        'Text A: Was plant der Verein als Nächstes?',
        [
          'Gutschriften auszuzahlen',
          'Alle Reparaturen selbst zu übernehmen',
          'Weitere Teilnehmer zu gewinnen',
        ],
        2,
        'Mehr Mitglieder sollen das Finden passender Hilfe erleichtern.',
      ],
      [
        'Text B: Was ist ein Laufbus?',
        [
          'Ein kleiner Bus für Schulklassen',
          'Eine begleitete Gruppe auf dem Schulweg',
          'Ein Sportangebot nach dem Unterricht',
        ],
        1,
        'Die Kinder gehen gemeinsam zu Fuß; ein Elternteil begleitet sie.',
      ],
      [
        'Text B: Wann fällt der Laufbus aus?',
        ['Bei einer offiziellen Unwetterwarnung', 'Bei jedem Regen', 'Wenn ein Kind zu spät kommt'],
        0,
        'Regen allein ist kein Grund; eine amtliche Unwetterwarnung schon.',
      ],
      [
        'Text B: Was fehlt für zusätzliche Gruppen?',
        ['Ein kürzerer Weg', 'Neue Fahrzeuge', 'Genügend erwachsene Begleiter'],
        2,
        'Weitere Gruppen brauchen Erwachsene, die regelmäßig mitgehen.',
      ],
    ],
    ['Helfen', 'Schule']
  ),
  exercise(
    3,
    'Situationen und Angebote im Stadtteil',
    `Ordnen Sie jeder Situation eine Anzeige zu. Jede Anzeige darf nur einmal verwendet werden. Für genau eine Situation gibt es keine passende Anzeige: Wählen Sie x.
a · Fotografieren mit dem Handy: Samstags lernen Sie, Licht und Bildaufbau zu nutzen. Bringen Sie Ihr eigenes Smartphone mit. Der Kurs richtet sich an Anfänger; eine besondere Kamera ist nicht nötig.
b · Bücher unterwegs: Unser Lesekreis trifft sich jeden Donnerstag im Café am Bahnhof. Wir besprechen Romane und Reiseberichte. Neue Teilnehmer können ohne Anmeldung kommen und einfach zuhören.
c · Nähen am Abend: Jeden Dienstag ab 18 Uhr zeigen wir, wie man Kleidung kürzt oder kleine Löcher schließt. Nähmaschinen stehen bereit. Stoff und eigene Kleidungsstücke bringen Sie bitte mit.
d · Garten für alle: Im Gemeinschaftsgarten sind noch Beete frei. Auch Menschen ohne Erfahrung können Gemüse anbauen. Die Gruppe trifft sich sonntags; eine Gartenberaterin beantwortet Fragen.
e · Computerhilfe zu Hause: Ehrenamtliche erklären älteren Menschen E-Mail und Videotelefonie am eigenen Gerät. Besuche finden nach telefonischer Vereinbarung statt. Dieses Angebot ist kostenlos.
f · Wandern am Wochenende: Unsere Gruppe macht lange Touren außerhalb der Stadt. Gute Kondition und feste Schuhe sind wichtig. Wir starten früh am Samstag und kehren meist am Abend zurück.
g · Stadtgeschichte zu Fuß: Die Stadtführerin erzählt auf einem zweistündigen Spaziergang von früheren Werkstätten und Wohnhäusern. Auch Einheimische entdecken Neues. Treffpunkt ist sonntags um 14 Uhr am Rathaus.
h · Gemeinsam Schach spielen: Freitags spielen Jugendliche und Erwachsene im Jugendzentrum. Anfänger lernen zunächst die Regeln. Bretter und Figuren können kostenlos benutzt werden.
i · Kleiner Fahrradservice: Die Werkstatt prüft Bremsen, Reifen und Licht. Reparaturen führen unsere Mitarbeiter durch; es handelt sich nicht um einen Kurs. Fahrräder können werktags abgegeben werden.
j · Kochen ohne Fleisch: Am Mittwochabend bereiten wir preiswerte vegetarische Gerichte zu. Alle kochen mit und essen anschließend zusammen. Zutaten und Geräte sind im Kurspreis enthalten.`,
    [
      [
        'Petra möchte lernen, einen zu langen Rock selbst zu ändern. Sie hat dienstags Zeit.',
        ads,
        2,
        'Anzeige c bietet genau solche Näharbeiten am Dienstagabend an.',
      ],
      [
        'Omar hat ein Handy und möchte damit bessere Bilder machen, ohne eine Kamera zu kaufen.',
        ads,
        0,
        'Anzeige a ist ein Fotokurs mit dem eigenen Smartphone.',
      ],
      [
        'Frau Beck kann kaum noch das Haus verlassen und braucht Hilfe beim Schreiben von E-Mails.',
        ads,
        4,
        'Anzeige e bietet kostenlose Computerhilfe zu Hause.',
      ],
      [
        'Lin möchte eigenes Gemüse anbauen, hat aber noch nie gegärtnert.',
        ads,
        3,
        'Anzeige d hat freie Beete und Beratung für Anfänger.',
      ],
      [
        'Robert interessiert sich für die Vergangenheit seines Wohnorts und möchte einen kurzen Rundgang machen.',
        ads,
        6,
        'Der zweistündige Stadtrundgang in g behandelt die Stadtgeschichte.',
      ],
      [
        'Sofia sucht einen Abendkurs, in dem sie preiswertes Essen ohne Fleisch zubereiten kann.',
        ads,
        9,
        'Anzeige j ist ein gemeinsamer vegetarischer Kochkurs am Abend.',
      ],
      [
        'Alex möchte sonntags mit einem Lehrer schwimmen lernen.',
        ads,
        10,
        'Keine Anzeige bietet Schwimmunterricht an. Deshalb x.',
      ],
    ],
    ['Freizeit', 'Lernen']
  ),
  exercise(
    4,
    'Soll die Bibliothek sonntags öffnen?',
    `Die Stadt überlegt, die Bibliothek künftig auch sonntags von 10 bis 16 Uhr zu öffnen. Lesen Sie die Meinungen. Ist die Person für diesen Vorschlag?
Anna: Unter der Woche arbeite ich bis spät. Samstags erledige ich Einkäufe für meine Eltern. Ein ruhiger Sonntag in der Bibliothek wäre für mich eine echte Hilfe. Natürlich sollen die Beschäftigten dafür an einem anderen Tag frei bekommen.
Mehmet: Ich verstehe, dass Familien das praktisch finden. Trotzdem kostet ein zusätzlicher Öffnungstag viel Geld. Die Stadt sollte dieses Geld lieber für neue Bücher ausgeben. Die bisherigen Zeiten reichen meiner Meinung nach aus.
Clara: Unsere Wohnung ist klein und oft laut. Sonntags könnte ich in der Bibliothek ungestört lernen. Einige Freunde hätten denselben Wunsch. Wenn zunächst nur ein Teil des Hauses geöffnet wird, bleiben die Kosten vielleicht überschaubar.
Paul: Bücher sind wichtig, und ich besuche die Bibliothek gern. Aber ein gemeinsamer Ruhetag gehört für mich zum Wochenende. Auch die Angestellten brauchen Zeit mit ihren Familien. Deshalb sollte die Einrichtung am Sonntag geschlossen bleiben.
Rita: Mit meinen Kindern kann ich selten nachmittags hingehen, weil dann ihre Kurse stattfinden. Sonntags hätten wir endlich Zeit, gemeinsam etwas auszusuchen. Vielleicht könnten gelegentlich auch Lesungen stattfinden. Ich würde das Angebot regelmäßig nutzen.
Daniel: Die Innenstadt hat sonntags kaum Busverbindungen. Daran ändert eine offene Bibliothek nichts. Bevor die Stadt die Zeiten erweitert, muss sie zunächst die Fahrtmöglichkeiten verbessern. Unter den jetzigen Bedingungen bin ich dagegen.
Eva: Manche sagen, digitale Bücher seien genug. Ich lese aber lieber auf Papier und treffe gern andere Menschen. Eine offene Bibliothek würde den Sonntag im Stadtteil lebendiger machen. Ich unterstütze den Plan, auch wenn noch nicht alle Fragen geklärt sind.`,
    [
      [
        'Anna ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        0,
        'Anna hätte sonntags endlich Zeit für die Bibliothek.',
      ],
      [
        'Mehmet ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        1,
        'Er möchte die bisherigen Zeiten behalten und lieber Bücher kaufen.',
      ],
      [
        'Clara ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        0,
        'Sie möchte sonntags einen ruhigen Lernort nutzen.',
      ],
      [
        'Paul ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        1,
        'Er fordert, dass die Bibliothek am Sonntag geschlossen bleibt.',
      ],
      [
        'Rita ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        0,
        'Sie würde das Angebot regelmäßig mit ihren Kindern nutzen.',
      ],
      [
        'Daniel ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        1,
        'Unter den jetzigen Bedingungen mit schlechten Busverbindungen ist er dagegen.',
      ],
      [
        'Eva ist für die Sonntagsöffnung.',
        ['Ja', 'Nein'],
        0,
        'Sie unterstützt den Plan ausdrücklich, trotz offener Fragen.',
      ],
    ],
    ['Bibliothek', 'Meinungen']
  ),
  exercise(
    5,
    'Benutzungsordnung der offenen Werkstatt',
    `Willkommen in der offenen Werkstatt Lindenhof
Die Werkstatt ist dienstags und donnerstags von 16 bis 21 Uhr geöffnet. Vor Ihrem ersten Besuch müssen Sie sich telefonisch oder online anmelden. Bei späteren Besuchen genügt es, die Mitgliedskarte am Eingang zu zeigen. Für die Arbeit an elektrischen Maschinen ist eine Sicherheitseinführung vorgeschrieben. Diese findet jeden ersten Dienstag im Monat um 16 Uhr statt. Ohne Einführung dürfen Sie nur Handwerkzeuge benutzen.
Bitte tragen Sie feste, geschlossene Schuhe. Jacken und Taschen gehören in die Schränke am Eingang. Getränke dürfen ausschließlich im Pausenraum stehen. Essen ist auch dort nur erlaubt, wenn keine Werkzeuge auf dem Tisch liegen. Kinder unter vierzehn Jahren dürfen die Werkstatt nur in Begleitung eines erwachsenen Mitglieds betreten und keine elektrischen Maschinen bedienen.
Kleine Holzreste aus der markierten Kiste können kostenlos verwendet werden. Neues Holz wird nach Größe bezahlt. Eigenes Material dürfen Sie mitbringen; die Aufsicht muss es jedoch vor Arbeitsbeginn prüfen. Lackieren ist nur im Raum mit der Lüftungsanlage möglich.
Räumen Sie Ihren Arbeitsplatz spätestens zwanzig Minuten vor der Schließung auf. Beschädigte Werkzeuge geben Sie sofort der Aufsicht. Unfertige Arbeiten dürfen eine Woche im Lager bleiben, wenn sie mit Namen und Datum beschriftet sind. Längere Lagerzeiten müssen vorab vereinbart werden.`,
    [
      [
        'Was ist vor dem ersten Besuch erforderlich?',
        ['Eine Anmeldung', 'Der Kauf einer Maschine', 'Ein Besuch am Donnerstag'],
        0,
        'Neue Besucher müssen sich telefonisch oder online anmelden.',
      ],
      [
        'Wer darf elektrische Maschinen benutzen?',
        [
          'Jedes Mitglied ab dem ersten Besuch',
          'Mitglieder nach der Sicherheitseinführung',
          'Alle Kinder mit erwachsener Begleitung',
        ],
        1,
        'Die Sicherheitseinführung ist Voraussetzung; Kinder unter vierzehn dürfen die Maschinen nicht bedienen.',
      ],
      [
        'Was gilt für eigenes Material?',
        [
          'Es muss vorab bezahlt werden',
          'Es darf nur Holz sein',
          'Es wird vor Arbeitsbeginn geprüft',
        ],
        2,
        'Die Aufsicht prüft mitgebrachtes Material vor der Arbeit.',
      ],
      [
        'Wie lange darf ein beschriftetes Werkstück ohne weitere Vereinbarung im Lager bleiben?',
        ['Eine Woche', 'Bis Monatsende', 'Zwanzig Minuten'],
        0,
        'Eine Woche ist erlaubt; längere Zeiten erfordern vorherige Absprache.',
      ],
    ],
    ['Regeln', 'Werkstatt']
  ),
]
