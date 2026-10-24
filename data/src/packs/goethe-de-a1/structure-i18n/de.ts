import type { StructureText } from '../../../types'

const SCORING_NOTE =
  'Rohpunkte, 1 pro Aufgabe. Das offizielle Ergebnis multipliziert jedes Modul mit 1,66 (15 → 25 Punkte).'

export const de: StructureText = {
  reading: {
    label: 'Lesen',
    summary:
      'Drei kurze Aufgaben: zwei persönliche Nachrichten, die passende Webseite oder Anzeige wählen und Schilder im Alltag.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Kurze persönliche Nachrichten',
        format: '5 × Richtig / Falsch',
        short: 'Lies zwei kurze Nachrichten und entscheide, ob 5 Aussagen richtig sind.',
        goal: 'Die wichtigsten Fakten in kurzen persönlichen Notizen und E-Mails verstehen.',
        skill: 'Detailliertes Lesen sehr kurzer Texte.',
      },
      2: {
        title: 'Webseiten und Anzeigen',
        format: '5 Situationen · wähle a oder b',
        short:
          'Wähle für jede Situation, welcher von zwei kurzen Texten die Information hat, die du brauchst.',
        goal: 'Finden, wo eine bestimmte Information in kurzen Alltagstexten steht.',
        skill: 'Selektives Lesen.',
      },
      3: {
        title: 'Schilder und Aushänge',
        format: '5 × Richtig / Falsch',
        short: 'Lies fünf Schilder und Aushänge und entscheide, ob jede Aussage richtig ist.',
        goal: 'Öffentliche Schilder, Aushänge und kurze Anweisungen verstehen.',
        skill: 'Schilder im Alltag lesen.',
      },
    },
  },
  listening: {
    label: 'Hören',
    summary: 'Kurze Gespräche, öffentliche Durchsagen und Telefonnachrichten — je eine Frage.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Kurze Gespräche',
        format: '6 × Multiple Choice (a · b · c) · zweimal gehört',
        short: 'Sechs kurze Alltagsgespräche, je eine a/b/c-Frage.',
        goal: 'Eine Zahl, Uhrzeit, einen Preis oder Ort in einem kurzen Gespräch verstehen.',
        skill: 'Hören von bestimmten Informationen.',
      },
      2: {
        title: 'Öffentliche Durchsagen',
        format: '4 × Richtig / Falsch · einmal gehört',
        short: 'Vier Durchsagen am Bahnhof, Flughafen oder im Geschäft — ist die Aussage richtig?',
        goal: 'Die Kernaussage einer öffentlichen Durchsage verstehen.',
        skill: 'Richtig / Falsch beurteilen.',
      },
      3: {
        title: 'Telefonnachrichten',
        format: '5 × Multiple Choice (a · b · c) · zweimal gehört',
        short: 'Fünf Nachrichten auf dem Anrufbeantworter, je eine a/b/c-Frage.',
        goal: 'Das wichtige Detail einer Telefonnachricht notieren.',
        skill: 'Hören von bestimmten Informationen.',
      },
    },
  },
  writing: {
    label: 'Schreiben',
    summary:
      'Fülle fünf fehlende Angaben in einem Formular aus und schreib dann eine kurze Nachricht mit etwa 30 Wörtern.',
    scoringNote:
      'Formular: 1 Punkt pro Angabe. Nachricht: 3 pro Inhaltspunkt + 1 für Anrede und Gruß.',
    parts: {
      1: {
        title: 'Formular ausfüllen',
        format: '5 fehlende Angaben',
        short: 'Lies etwas über einen Freund und fülle die fünf fehlenden Angaben im Formular aus.',
        goal: 'Ein Formular mit einfachen persönlichen Angaben ausfüllen.',
        skill: 'Formulare ausfüllen.',
      },
      2: {
        title: 'Kurze Nachricht',
        format: 'Etwa 30 Wörter · 3 Inhaltspunkte',
        short: 'Schreib eine kurze Nachricht mit Anrede, drei Inhaltspunkten und Gruß.',
        goal: 'Eine kurze persönliche oder halbformelle Nachricht schreiben.',
        skill: 'Kurze Texte im Alltag schreiben.',
      },
    },
  },
  speaking: {
    label: 'Sprechen',
    summary:
      'Stell dich vor, stelle und beantworte Fragen zu zwei Themen und formuliere Bitten und reagiere darauf.',
    scoringNote:
      'Direkte Punkte 3 + 6 + 6 = 15 (das offizielle Ergebnis wird mit 1,66 multipliziert).',
    parts: {
      1: {
        title: 'Sich vorstellen',
        format: 'Stichwörter · ein Wort buchstabieren · eine Zahl nennen (3 P.)',
        short:
          'Stell dich mit den Stichwörtern vor, buchstabiere dann ein Wort und nenne eine Zahl.',
        goal: 'Grundlegende Informationen über dich geben.',
        skill: 'Einfache Vorstellung der eigenen Person.',
      },
      2: {
        title: 'Fragen und antworten',
        format: 'Wortkarten zu 2 Themen (6 P.)',
        short: 'Stell eine Frage zu einer Wortkarte und beantworte dann die Frage deines Partners.',
        goal: 'Nach einfachen Informationen zu Alltagsthemen fragen und sie geben.',
        skill: 'Fragen stellen & beantworten.',
      },
      3: {
        title: 'Bitten',
        format: 'Bittenkarten, 2 Runden (6 P.)',
        short:
          'Formuliere mit einer Karte eine höfliche Bitte und reagiere dann auf die Bitte deines Partners.',
        goal: 'Alltägliche Bitten formulieren und darauf reagieren.',
        skill: 'Bitten & Reaktionen.',
      },
    },
  },
}
