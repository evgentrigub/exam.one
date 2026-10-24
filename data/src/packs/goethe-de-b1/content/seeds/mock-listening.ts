import { buildSeedListeningAudioMap } from '../listening-audio'

type Row = [string, string[], number, string]
const tf = ['Richtig', 'Falsch']
function exercise(part: number, title: string, content: string, transcript: string, rows: Row[]) {
  const id = `mock-goethe-de-b1-set1-listening-part${part}`
  return {
    id,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    title,
    content,
    transcript,
    audio: buildSeedListeningAudioMap({ id }),
    questions: rows.map(([question, options, correctAnswer, explanation], index) => ({
      id: `${id}-q${index + 1}`,
      question,
      options,
      correctAnswer,
      explanation,
    })),
  }
}
const speakers = ['A · Moderatorin', 'B · Tobias', 'C · Lena']
export const mockListeningSeeds: Record<string, unknown>[] = [
  exercise(
    1,
    'Fünf kurze Nachrichten',
    'Sie hören fünf kurze Aufnahmen. Zu jeder Aufnahme bearbeiten Sie eine Richtig/Falsch-Frage und eine Frage mit drei Antworten. Die gemeinsame Aufnahme können Sie zweimal abspielen.',
    `Nachricht eins. Guten Tag, Frau Braun, hier ist die Reinigung Silber. Ihr Mantel ist leider noch nicht fertig. Bei der Kontrolle haben wir einen Fleck entdeckt, den wir noch einmal behandeln müssen. Wir hatten Ihnen Donnerstag als Abholtag genannt. Bitte kommen Sie stattdessen am Freitag nach vierzehn Uhr vorbei. Falls Sie ihn schon am Vormittag dringend brauchen, rufen Sie uns bitte an. Wir prüfen dann, ob es früher möglich ist. Der Preis bleibt selbstverständlich gleich. Vielen Dank für Ihr Verständnis.
Nachricht zwei. Liebe Fahrgäste, der Regionalzug nach Jena fährt heute ausnahmsweise von Gleis sechs. Die Anzeige auf Gleis vier wird gerade repariert. Die Abfahrt um fünfzehn Uhr zehn bleibt unverändert. Reisende nach Weimar können denselben Zug benutzen. Wegen Arbeiten an einer Brücke hält er heute allerdings nicht in Großschwabhausen. Dort steht am Bahnhof ein Ersatzbus bereit. Bitte achten Sie auf die zusätzlichen Hinweise unserer Mitarbeiter.
Nachricht drei. Hallo Emil, hier ist Sara. Ich habe die Karten für das Theater abgeholt. Die Vorstellung beginnt um halb acht. Weil das Café neben dem Theater heute geschlossen ist, treffen wir uns lieber um sieben am Haupteingang. Ich bringe dir deine Karte mit; du musst also nicht noch zur Kasse gehen. Nach der Vorstellung können wir irgendwo eine Kleinigkeit essen. Falls du dich verspätest, schick mir bitte eine Nachricht. Bis später!
Nachricht vier. Willkommen beim Stadtbad. Unser großes Schwimmbecken ist am kommenden Sonntag wegen eines Wettkampfs für normale Besucher geschlossen. Das kleine Becken und die Sauna bleiben geöffnet. Für Familien gibt es am Sonntag ermäßigte Eintrittskarten. Der Schwimmkurs für Erwachsene findet ausnahmsweise am Montag um achtzehn Uhr statt. Bereits gekaufte Kurskarten behalten ihre Gültigkeit. Weitere Informationen erhalten Sie an der Kasse oder auf unserer Internetseite.
Nachricht fünf. Hallo Frau Neumann, hier ist Herr Richter von der Paketannahme. Ihr Paket liegt bei uns im Laden. Der Fahrer konnte Sie gestern nicht erreichen. Sie können es bis Dienstag abholen. Bitte bringen Sie einen Ausweis mit; der Abholschein allein reicht bei diesem Paket nicht aus. Von Montag bis Freitag haben wir bis neunzehn Uhr geöffnet. Am Samstag schließen wir schon um dreizehn Uhr. Falls eine andere Person das Paket für Sie abholt, braucht sie zusätzlich Ihre schriftliche Erlaubnis.`,
    [
      [
        'Nachricht 1: Der Mantel kann wie vereinbart am Donnerstag abgeholt werden.',
        tf,
        1,
        'Die Reinigung verschiebt die Abholung auf Freitag.',
      ],
      [
        'Nachricht 1: Wann ist der Mantel normalerweise fertig?',
        ['Freitag nach 14 Uhr', 'Donnerstag vor 14 Uhr', 'Samstag am Vormittag'],
        0,
        'Genannt wird Freitag nach vierzehn Uhr.',
      ],
      [
        'Nachricht 2: Der Zug fährt heute von einem anderen Gleis ab.',
        tf,
        0,
        'Er fährt ausnahmsweise von Gleis sechs statt vier.',
      ],
      [
        'Nachricht 2: Was ändert sich nicht?',
        ['Alle Haltestellen', 'Die Abfahrtszeit', 'Die Gleisanzeige'],
        1,
        'Die Abfahrt um 15.10 Uhr bleibt unverändert.',
      ],
      [
        'Nachricht 3: Sara und Emil treffen sich im Café.',
        tf,
        1,
        'Das Café ist geschlossen; sie treffen sich am Haupteingang.',
      ],
      [
        'Nachricht 3: Was bringt Sara mit?',
        ['Etwas zu essen', 'Die Eintrittskarte für Emil', 'Eine Nachricht von der Kasse'],
        1,
        'Sara hat beide Karten abgeholt und bringt Emil seine mit.',
      ],
      [
        'Nachricht 4: Am Sonntag können Besucher das kleine Becken benutzen.',
        tf,
        0,
        'Nur das große Becken ist geschlossen; das kleine bleibt offen.',
      ],
      [
        'Nachricht 4: Wann findet der Schwimmkurs für Erwachsene statt?',
        ['Sonntag um 18 Uhr', 'Dienstag am Morgen', 'Montag um 18 Uhr'],
        2,
        'Der Kurs wird auf Montag um achtzehn Uhr verschoben.',
      ],
      [
        'Nachricht 5: Der Laden schließt am Samstag früher als von Montag bis Freitag.',
        tf,
        0,
        'Samstags schließt er um 13 Uhr, von Montag bis Freitag um 19 Uhr.',
      ],
      [
        'Nachricht 5: Was muss Frau Neumann bei der Abholung zeigen?',
        ['Nur den Abholschein', 'Einen Ausweis', 'Eine schriftliche Erlaubnis für sich selbst'],
        1,
        'Ihr Ausweis ist nötig; die Erlaubnis braucht nur eine andere abholende Person.',
      ],
    ]
  ),
  exercise(
    2,
    'Ein Rundgang im Medienhaus',
    'Sie hören eine Erklärung bei einem Rundgang. Wählen Sie für jede Frage eine Antwort. Die Aufnahme können Sie einmal abspielen.',
    `Guten Morgen und willkommen im Medienhaus West! Ich heiße Katrin Vogel und zeige Ihnen heute, welche Angebote Sie bei uns nutzen können. Viele denken beim Wort Medienhaus zuerst an Bücher. Davon haben wir natürlich viele, aber unser Haus bietet auch Räume zum Lernen, Arbeiten und Ausprobieren. Im Erdgeschoss finden Sie die Information und den Bereich für Kinder. Früher war dort auch das Café. Es ist vor einem Monat in den zweiten Stock gezogen, weil man von dort einen schönen Blick über die Stadt hat.
Wir gehen jetzt nach oben. Hier im ersten Stock stehen die Computer. Wenn Sie eine Mitgliedskarte haben, können Sie täglich eine Stunde kostenlos daran arbeiten. Eine Reservierung ist möglich, aber nicht vorgeschrieben. Wer länger arbeiten möchte, bezahlt für jede zusätzliche halbe Stunde einen Euro. Bitte speichern Sie eigene Dateien auf einem mitgebrachten Speichergerät; nach dem Abmelden werden sie automatisch gelöscht.
Neben den Computern liegen die Gruppenräume. Sie können einen Raum für höchstens drei Stunden buchen. Das machen Sie online oder direkt an der Information. Telefonisch nehmen wir keine Buchungen an. Jeder Raum hat einen großen Tisch und eine Tafel. Stifte erhalten Sie an der Information, müssen sie aber danach zurückgeben.
Im hinteren Teil ist unser Tonstudio. Dort können Sie zum Beispiel eine Geschichte oder ein Interview aufnehmen. Bevor Sie es allein nutzen dürfen, ist ein Einführungskurs nötig. Der nächste Kurs findet am Samstag statt. Die Anmeldung dafür endet am Donnerstagabend. Der Kurs kostet fünf Euro; die spätere Nutzung des Studios ist für Mitglieder kostenlos.
Zum Schluss noch ein wichtiger Hinweis: Gespräche und Telefonate sind im Erdgeschoss und in den Gruppenräumen erlaubt. Im dritten Stock ist dagegen unser stiller Lesebereich. Auch leise Telefonate sind dort nicht gestattet. Wer ungestört lesen oder sich auf eine Prüfung vorbereiten möchte, ist dort richtig. Jetzt haben Sie Zeit für Fragen, bevor wir gemeinsam das Tonstudio ansehen.`,
    [
      [
        'Wo befindet sich das Café jetzt?',
        ['Im Erdgeschoss', 'Im zweiten Stock', 'Im ersten Stock'],
        1,
        'Es ist vor einem Monat in den zweiten Stock gezogen.',
      ],
      [
        'Wie lange können Mitglieder täglich kostenlos am Computer arbeiten?',
        ['Eine Stunde', 'Drei Stunden', 'Eine halbe Stunde'],
        0,
        'Eine Stunde pro Tag ist kostenlos; zusätzliche Zeit kostet Geld.',
      ],
      [
        'Wie kann man einen Gruppenraum buchen?',
        ['Nur telefonisch', 'Nur persönlich', 'Online oder an der Information'],
        2,
        'Telefonische Buchungen sind ausdrücklich ausgeschlossen.',
      ],
      [
        'Was braucht man vor der selbstständigen Nutzung des Tonstudios?',
        ['Ein eigenes Mikrofon', 'Einen Einführungskurs', 'Eine zusätzliche Jahreskarte'],
        1,
        'Die Einführung ist nötig, bevor man allein aufnehmen darf.',
      ],
      [
        'Was gilt im stillen Lesebereich?',
        [
          'Kurze Telefonate sind erlaubt',
          'Nur Gruppen dürfen ihn benutzen',
          'Telefonieren ist verboten',
        ],
        2,
        'Auch leise Telefonate sind im dritten Stock nicht gestattet.',
      ],
    ]
  ),
  exercise(
    3,
    'Eine gemeinsame Reise vorbereiten',
    'Sie hören ein Gespräch zwischen zwei Freunden. Entscheiden Sie, ob die Aussagen richtig oder falsch sind. Die Aufnahme können Sie einmal abspielen.',
    `Nina: Hallo David! Hast du schon nach einer Unterkunft für unser Wanderwochenende gesucht?
David: Ja, ich habe zwei Möglichkeiten gefunden. Das Hotel am See sieht schön aus, aber es kostet fast hundert Euro pro Person. Die Jugendherberge ist deutlich günstiger. Dort gibt es allerdings nur noch ein Zimmer mit vier Betten.
Nina: Dann nehmen wir lieber die Jugendherberge. Wir sind ja zu viert. Ich dachte erst, meine Schwester würde mitkommen, aber sie muss arbeiten. Stattdessen hat Amir zugesagt.
David: Gut. Ich habe noch nichts gebucht, weil ich zuerst wissen wollte, wer mitfährt. Die Herberge hält uns das Zimmer bis morgen frei. Frühstück ist im Preis enthalten; das Abendessen müssen wir extra bestellen.
Nina: Frühstück reicht mir. Abends könnten wir in dem Dorf essen. Ich habe gelesen, dass dort ein kleines Restaurant ist. Es schließt aber schon um acht. Wir sollten also nicht zu spät zurück sein.
David: Stimmt. Wie kommen wir hin? Mein Auto ist in der Werkstatt. Ich könnte es zwar am Freitag wieder abholen, aber dann wird die Fahrt für alle teurer als mit dem Zug.
Nina: Lass uns den Zug nehmen. Mit dem Gruppenticket kostet die Hin- und Rückfahrt zusammen zwölf Euro pro Person. Vom Bahnhof bis zur Herberge sind es nur zehn Minuten zu Fuß.
David: Der Zug am Samstag fährt um sieben Uhr vierzig. Ist das zu früh für dich?
Nina: Nein, so haben wir mehr vom Tag. Wir treffen uns zwanzig Minuten vorher vor dem Bahnhof. Ich sage den anderen Bescheid.
David: Ich wollte eigentlich die lange Route zum Gipfel gehen. Aber der Wetterbericht meldet ab dem Nachmittag starken Regen. Vielleicht wählen wir lieber den Weg um den See. Dafür brauchen wir ungefähr drei Stunden, und unterwegs gibt es eine Hütte.
Nina: Einverstanden. Ich kenne die Strecke noch nicht. Falls der Regen früher kommt, können wir in der Hütte warten. Für Sonntag entscheiden wir dann vor Ort, je nachdem, wie das Wetter ist.
David: Ich buche jetzt das Zimmer. Kannst du auf dem Weg zum Bahnhof Brot und Obst besorgen? Getränke bringt jeder selbst mit.
Nina: Ja. Ich nehme auch meine kleine Karte mit. Auf dem Handy funktioniert die Verbindung dort wohl nicht überall.`,
    [
      [
        'Die Freunde entscheiden sich für das Hotel am See.',
        tf,
        1,
        'Sie wählen die günstigere Jugendherberge.',
      ],
      ['Ninas Schwester fährt mit.', tf, 1, 'Ihre Schwester arbeitet; Amir kommt stattdessen mit.'],
      [
        'Das Frühstück ist im Zimmerpreis enthalten.',
        tf,
        0,
        'Nur das Abendessen muss extra bestellt werden.',
      ],
      [
        'Die Zugfahrt kostet insgesamt zwölf Euro pro Person.',
        tf,
        0,
        'Hin- und Rückfahrt zusammen kosten zwölf Euro pro Person.',
      ],
      [
        'Die Freunde treffen sich um 7.40 Uhr vor dem Bahnhof.',
        tf,
        1,
        'Der Zug fährt um 7.40 Uhr; sie treffen sich zwanzig Minuten früher.',
      ],
      [
        'Wegen der Wettervorhersage planen sie zunächst die kürzere Route.',
        tf,
        0,
        'Starker Regen am Nachmittag spricht für den dreistündigen Weg um den See.',
      ],
      [
        'Nina besorgt die Getränke für die ganze Gruppe.',
        tf,
        1,
        'Sie besorgt Brot und Obst; Getränke bringt jeder selbst mit.',
      ],
    ]
  ),
  exercise(
    4,
    'Soll man zu Hause arbeiten?',
    'Sie hören eine Radiodiskussion mit einer Moderatorin, Tobias und Lena. Wer äußert die jeweilige Meinung? Die Antworten können mehrfach verwendet werden. Die Aufnahme können Sie zweimal abspielen.',
    `Moderatorin: Guten Abend. In unserer Sendung geht es heute um das Arbeiten zu Hause. Immer mehr Firmen bieten diese Möglichkeit an. Ich finde, dass wir dabei nicht nur über Zeit und Geld sprechen sollten, sondern auch über Gesundheit. Stundenlang allein am Küchentisch zu sitzen ist schließlich nicht für jeden gut. Tobias, Sie arbeiten seit zwei Jahren teilweise zu Hause. Wie erleben Sie das?
Tobias: Für mich ist der größte Vorteil, dass der lange Weg ins Büro wegfällt. Früher saß ich täglich fast zwei Stunden im Zug. Diese Zeit verbringe ich jetzt mit meinen Kindern. Ich bringe sie morgens zur Schule und fange danach an zu arbeiten. Meine Aufgaben kann ich gut allein erledigen. Wenn ich einen schwierigen Bericht schreibe, bin ich zu Hause sogar konzentrierter, weil mich niemand ständig unterbricht.
Lena: Das klingt gut, aber bei mir funktioniert es anders. Ich wohne in einer kleinen Wohnung und habe keinen eigenen Arbeitsraum. Wenn meine Mitbewohnerin kocht oder Besuch bekommt, kann ich mich schlecht konzentrieren. Ich fahre deshalb lieber ins Büro. Dort habe ich einen passenden Schreibtisch und kann klar zwischen Arbeit und Freizeit unterscheiden.
Moderatorin: Es kommt also auch auf die Wohnsituation an. Mich beschäftigt außerdem eine andere Frage: Wer kümmert sich um einen guten Stuhl und einen sicheren Arbeitsplatz? Meiner Meinung nach muss die Firma ihren Beschäftigten dabei helfen. Ein gewöhnlicher Küchenstuhl reicht auf Dauer nicht.
Tobias: Da stimme ich Ihnen zu. Meine Firma hat uns Bildschirme und Bürostühle zur Verfügung gestellt. Trotzdem möchte ich nicht an allen fünf Tagen zu Hause bleiben. Einmal pro Woche treffe ich mein Team im Büro. Dabei entstehen oft Ideen, auf die ich allein nicht gekommen wäre. Diese gemeinsamen Tage sind mir wichtig.
Lena: Mir fehlen zu Hause besonders die kurzen Gespräche in der Pause. In einer Videokonferenz spricht man meistens nur über die Aufgabe. Im Büro merkt man auch, wenn jemand Hilfe braucht oder einen schlechten Tag hat. Für neue Mitarbeiter ist das besonders wichtig. Sie sollten ihre Kollegen zuerst persönlich kennenlernen.
Moderatorin: Würden Sie feste Regeln für alle empfehlen?
Lena: Nein. Entscheidend ist, welche Arbeit jemand macht und ob die Wohnung dafür geeignet ist. Außerdem sollte man selbst wählen dürfen. Ein verpflichtender Heimarbeitstag würde mir nicht helfen.
Tobias: Wahlmöglichkeiten finde ich auch gut. Allerdings muss man das Ende des Arbeitstags ernst nehmen. Ich schalte den Arbeitscomputer um halb sechs aus und lese danach keine beruflichen Nachrichten mehr. Sonst denkt man noch beim Abendessen an die nächste Aufgabe.
Moderatorin: Vielen Dank. Wir haben gesehen, wie unterschiedlich die Erfahrungen sind. Unserer Redaktion können Sie gern schreiben, wie Sie selbst arbeiten.`,
    [
      [
        'Wem ist wichtig, gesundheitliche Folgen der Heimarbeit zu beachten?',
        speakers,
        0,
        'Die Moderatorin nennt Gesundheit und das lange Sitzen am Küchentisch.',
      ],
      [
        'Wer gewinnt durch weniger Fahrten Zeit für die Familie?',
        speakers,
        1,
        'Tobias verbringt die eingesparte Zugzeit mit seinen Kindern.',
      ],
      [
        'Wer kann zu Hause wegen der Wohnsituation schlecht konzentriert arbeiten?',
        speakers,
        2,
        'Lena nennt die kleine Wohnung und die Mitbewohnerin als Hindernisse.',
      ],
      [
        'Wer fordert Unterstützung der Firma bei der Einrichtung des Arbeitsplatzes?',
        speakers,
        0,
        'Die Moderatorin fordert Hilfe bei Stuhl und sicherem Arbeitsplatz.',
      ],
      [
        'Wer findet einen gemeinsamen Bürotag für neue Ideen nützlich?',
        speakers,
        1,
        'Tobias beschreibt die Ideen, die beim wöchentlichen Teamtreffen entstehen.',
      ],
      [
        'Wer vermisst zu Hause besonders die informellen Pausengespräche?',
        speakers,
        2,
        'Lena vergleicht kurze Gespräche im Büro mit aufgabenbezogenen Videokonferenzen.',
      ],
      [
        'Wer hält einen vorgeschriebenen Heimarbeitstag für wenig hilfreich?',
        speakers,
        2,
        'Lena möchte selbst wählen dürfen und lehnt den verpflichtenden Tag ab.',
      ],
      [
        'Wer beendet die Arbeit durch das Ausschalten des Computers zu einer festen Zeit?',
        speakers,
        1,
        'Tobias schaltet um halb sechs aus und liest danach keine beruflichen Nachrichten.',
      ],
    ]
  ),
]
