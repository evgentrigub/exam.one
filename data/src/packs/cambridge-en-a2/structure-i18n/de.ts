import type { StructureText } from '../../../types'

export const de: StructureText = {
  reading: {
    label: 'Leseverstehen',
    summary:
      'Fünf Teile: kurze Mitteilungen, Fragen drei Texten zuordnen, ein längerer Artikel und zwei Lückentexte.',
    scoringNote:
      'Rohpunkte, 1 pro Aufgabe (30). In Übungstests entsprechen etwa 20/30 Cambridge English Scale 120 (Grade C) und 28/30 140 (Grade A).',
    parts: {
      1: {
        title: 'Kurze Texte',
        format: '6 Mitteilungen und Nachrichten · A · B · C',
        short: 'Lies sechs kurze Mitteilungen und Nachrichten und wähle, was jede aussagt.',
        goal: 'Die Hauptaussage von Schildern, Notizen und kurzen E-Mails verstehen.',
        skill: 'Kurze Alltagstexte lesen.',
      },
      2: {
        title: 'Drei Texte',
        format: '7 Fragen · Text A · B · C zuordnen',
        short:
          'Lies drei kurze Texte zu einem Thema und entscheide, welcher Text jede Frage beantwortet.',
        goal: 'Bestimmte Informationen und Details in drei Texten finden.',
        skill: 'Suchendes Lesen und Mehrfachzuordnung.',
      },
      3: {
        title: 'Längerer Text',
        format: '5 × Multiple Choice (A · B · C)',
        short: 'Lies einen Zeitschriftenartikel und beantworte fünf Fragen.',
        goal: 'Die Hauptgedanken und Details eines längeren Textes verstehen.',
        skill: 'Detailliertes Lesen.',
      },
      4: {
        title: 'Multiple-Choice-Lückentext',
        format: '6 Lücken · wähle A · B · C',
        short: 'Wähle für jede der sechs Lücken in einem kurzen Sachtext das richtige Wort.',
        goal: 'Das richtige Wort im Kontext verwenden: Wortschatz und etwas Grammatik.',
        skill: 'Wortschatz im Kontext.',
      },
      5: {
        title: 'Offener Lückentext',
        format: '6 Lücken · schreib ein Wort',
        short: 'Schreib in jede der sechs Lücken einer E-Mail ein Wort.',
        goal: 'Grammatikwörter richtig verwenden: Präpositionen, Pronomen, Verben und Konnektoren.',
        skill: 'Grammatik und Satzbau.',
      },
    },
  },
  writing: {
    label: 'Schreiben',
    summary:
      'Schreib eine kurze E-Mail oder Notiz (Part 6) und eine kurze Geschichte zu drei Bildern (Part 7).',
    scoringNote:
      'Jede Aufgabe: Inhalt, Aufbau und Sprache, je 0–5 (15). In Übungstests entsprechen etwa 18/30 Scale 120 und 26/30 140.',
    parts: {
      1: {
        title: 'E-Mail oder Notiz',
        format: 'Reading & Writing Part 6 · 25+ Wörter · 3 Punkte',
        short:
          'Schreib eine E-Mail oder Notiz mit 25 Wörtern oder mehr, die alle drei Punkte abdeckt.',
        goal: 'Eine kurze Alltagsnachricht schreiben, die alle verlangten Informationen enthält.',
        skill: 'Gelenktes Schreiben.',
      },
      2: {
        title: 'Bildergeschichte',
        format: 'Reading & Writing Part 7 · 35+ Wörter · 3 Bilder',
        short: 'Schreib eine kurze Geschichte mit 35 Wörtern oder mehr zu drei Bildern.',
        goal: 'Eine einfache zusammenhängende Geschichte zu allen drei Bildern erzählen.',
        skill: 'Erzählendes Schreiben.',
      },
    },
  },
  listening: {
    label: 'Hörverstehen',
    summary:
      'Kurze Gespräche, ein Vortrag mit Notizen zum Ergänzen, ein längeres Gespräch, kurze Aufnahmen und eine Zuordnungsaufgabe. Jede Aufnahme hörst du zweimal.',
    scoringNote:
      'Rohpunkte, 1 pro Aufgabe (25). In Übungstests entsprechen etwa 17/25 Scale 120 und 23/25 140.',
    parts: {
      1: {
        title: 'Kurze Gespräche',
        format: '5 × Multiple Choice (A · B · C)',
        short: 'Fünf kurze Gespräche, je eine Frage.',
        goal: 'Wichtige Informationen verstehen: Uhrzeiten, Preise, Orte, Dinge.',
        skill: 'Hören von bestimmten Informationen.',
      },
      2: {
        title: 'Notizen',
        format: '5 Lücken · ein Wort, eine Zahl, ein Datum oder eine Uhrzeit',
        short: 'Hör einen Vortrag und ergänze fünf Notizen.',
        goal: 'Wichtige Fakten notieren, auch buchstabierte Namen und Zahlen.',
        skill: 'Notizen machen.',
      },
      3: {
        title: 'Längeres Gespräch',
        format: '5 × Multiple Choice (A · B · C)',
        short: 'Hör zwei Personen zu und beantworte fünf Fragen.',
        goal: 'Einem Gespräch folgen, auch dem, was jede Person denkt.',
        skill: 'Hören von Details und Meinungen.',
      },
      4: {
        title: 'Kurze Aufnahmen',
        format: '5 × Multiple Choice (A · B · C)',
        short: 'Fünf kurze Aufnahmen, je eine Frage zur Hauptaussage.',
        goal: 'Die Hauptaussage, den Grund oder das Gefühl in einer kurzen Aufnahme verstehen.',
        skill: 'Globales Hören.',
      },
      5: {
        title: 'Zuordnen',
        format: '5 Aufgaben · 8 Optionen, 3 bleiben übrig',
        short: 'Hör ein Gespräch und ordne fünf Personen die richtige Option zu.',
        goal: 'Einem Gespräch genau folgen und Informationen zuordnen.',
        skill: 'Hören von bestimmten Informationen.',
      },
    },
  },
  speaking: {
    label: 'Sprechen',
    summary:
      'Beantworte die Fragen des Prüfers zu dir und sprich dann über eine Reihe von Bildern.',
    scoringNote:
      'Übung: Grammatik und Wortschatz, Interaktive Kommunikation und Gesamtleistung, je 0–5 pro Teil, anhand deines Transkripts. Die Prüfung bewertet auch die Aussprache und gewichtet die Skalen auf 45 Punkte; etwa 27/45 entspricht Scale 120.',
    parts: {
      1: {
        title: 'Interview',
        format: 'Fragen des Prüfers · 5 Antworten',
        short: 'Beantworte die Fragen des Prüfers zu dir und zu einem Alltagsthema.',
        goal: 'Persönliche Informationen geben und ein wenig über Alltagsthemen sprechen.',
        skill: 'Fragen beantworten.',
      },
      2: {
        title: 'Diskussion',
        format: 'Bilder · Meinungen · Anschlussfragen',
        short:
          'Sag, was du von einigen Aktivitäten hältst, frag deinen Partner und beantworte Anschlussfragen.',
        goal: 'Meinungen äußern und erfragen und sagen, was du lieber magst und warum.',
        skill: 'Über Vorlieben sprechen.',
      },
    },
  },
}
