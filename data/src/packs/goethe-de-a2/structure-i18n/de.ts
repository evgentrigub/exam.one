import type { StructureText } from '../../../types'

export const de: StructureText = {
  reading: {
    label: 'Lesen',
    summary:
      'Vier kurze Texte mit steigender Schwierigkeit. Du liest global, im Detail und ordnest Angebote Personen zu.',
    scoringNote: 'Rohpunkte (Messpunkte) × 1,25 → Ergebnispunkte.',
    parts: {
      1: {
        title: 'Artikel oder Zeitungstext',
        format: '5 × Multiple Choice (a · b · c)',
        short: 'Lies einen kurzen Artikel (~200 Wörter) und beantworte 5 a/b/c-Fragen.',
        goal: 'Die Hauptpunkte und wichtigen Details eines Informationstextes verstehen.',
        skill: 'Detailliertes Lesen authentischer Alltagstexte.',
      },
      2: {
        title: 'Informationstafel / Plan',
        format: '5 Situationen · wähle den Ort (a · b · c)',
        short:
          'Finde Informationen auf einer Informationstafel oder einem Fahrplan — wähle das richtige Stockwerk oder den richtigen Ort.',
        goal: 'Eine bestimmte Information auf Alltagsschildern schnell finden.',
        skill: 'Selektives / suchendes Lesen.',
      },
      3: {
        title: 'Persönlicher Brief oder E-Mail',
        format: '5 × Multiple Choice (a · b · c)',
        short: 'Lies eine persönliche E-Mail (~230 Wörter) und beantworte 5 a/b/c-Fragen.',
        goal: 'Absichten, Gefühle und Details in persönlicher Korrespondenz erfassen.',
        skill: 'Private Korrespondenz lesen.',
      },
      4: {
        title: 'Anzeigen zuordnen',
        format: 'Ordne Anzeigen a–f 5 Personen zu (eine Antwort ist immer "x")',
        short: 'Ordne jeder Person die passende Anzeige zu — für eine gibt es nie eine Lösung (x).',
        goal: 'Die Bedürfnisse jeder Person mit einem passenden Angebot verbinden.',
        skill: 'Zuordnen & Schlussfolgern unter Zeitdruck.',
      },
    },
  },
  listening: {
    label: 'Hören',
    summary:
      'Vier Aufnahmen — Durchsagen, ein langer Zuordnungsdialog, kurze Gespräche und ein Interview.',
    scoringNote: 'Rohpunkte (Messpunkte) × 1,25 → Ergebnispunkte.',
    parts: {
      1: {
        title: 'Durchsagen & Sprachnachrichten',
        format: '5 × Multiple Choice (a · b · c) · zweimal gehört',
        short: 'Kurze Durchsagen und Nachrichten — 5 Fragen, Audio wird zweimal gespielt.',
        goal: 'Wichtige Informationen in kurzen gesprochenen Nachrichten verstehen.',
        skill: 'Detailliertes Hören kurzer Audios.',
      },
      2: {
        title: 'Ein langer Zuordnungsdialog',
        format: 'Ordne 5 Personen 9 Optionen zu · einmal gehört',
        short:
          'Ein langer Dialog — ordne Personen Optionen zu, 9 Auswahlmöglichkeiten, einmal gehört.',
        goal: 'Einem längeren Gespräch folgen und jeder Person das richtige Detail zuordnen.',
        skill: 'Zuordnen beim Hören.',
      },
      3: {
        title: 'Alltagsgespräche',
        format: '5 × Multiple Choice (a · b · c) · einmal gehört',
        short: 'Kurze Alltagsgespräche — 5 Multiple-Choice-Fragen, einmal gehört.',
        goal: 'Kurze Gespräche in Alltagssituationen verstehen.',
        skill: 'Global- & Detailverstehen im Gespräch.',
      },
      4: {
        title: 'Radiointerview',
        format: '5 × Ja / Nein · zweimal gehört',
        short:
          'Ein Radiointerview — entscheide, ob 5 Aussagen richtig sind (Ja / Nein), zweimal gehört.',
        goal: 'Meinungen und Aussagen in einem längeren Interview verstehen.',
        skill: 'Richtig / Falsch beurteilen.',
      },
    },
  },
  writing: {
    label: 'Schreiben',
    summary:
      'Zwei kurze Texte: eine lockere Nachricht an einen Freund und eine höfliche formelle E-Mail.',
    scoringNote:
      'Max. 20 Rohpunkte × 1,25. Unter der Mindestwortzahl gibt es 0 Punkte für diesen Teil.',
    parts: {
      1: {
        title: 'Informelle Nachricht / SMS',
        format: 'Informell "du" · 20–30 Wörter',
        short:
          'Schreib eine kurze, informelle Nachricht mit "du" an einen Freund, mit 3 Inhaltspunkten.',
        goal: 'Einfache persönliche Informationen in lockerem Ton mitteilen.',
        skill: 'Informelles Schreiben im Alltag.',
      },
      2: {
        title: 'Halbformelle / formelle E-Mail',
        format: 'Formell "Sie" · 30–40 Wörter',
        short: 'Schreib eine höfliche E-Mail mit "Sie", mit Anrede, Gruß und 3 Inhaltspunkten.',
        goal: 'Eine höfliche Bitte oder Antwort in formellem Ton formulieren.',
        skill: 'Formelle Korrespondenz.',
      },
    },
  },
  speaking: {
    label: 'Sprechen',
    summary:
      'Eine Paarprüfung in drei Etappen: ein kurzes Interview, ein Monolog über dich und gemeinsam etwas planen.',
    scoringNote: 'Direkte Punkte 4 + 8 + 8 + 5 Aussprache = 25 (kein × 1,25-Faktor).',
    parts: {
      1: {
        title: 'Interview',
        format: 'Stelle & beantworte 4 Fragen mit Fragekarten (4 P.)',
        short: 'Stell deinem Partner 4 Fragen mit den Fragekarten und beantworte seine.',
        goal: 'Persönliche Informationen in einem einfachen Interview austauschen.',
        skill: 'Fragen stellen & beantworten.',
      },
      2: {
        title: 'Monolog',
        format: 'Sprich mit 4 Stichwörtern über ein Thema + Nachfragen (8 P.)',
        short:
          'Sprich mit 4 Stichwörtern über dich zu einem Thema und beantworte dann die Fragen des Prüfers.',
        goal: 'Zusammenhängend über vertraute, persönliche Themen sprechen.',
        skill: 'Zusammenhängendes, strukturiertes Sprechen.',
      },
      3: {
        title: 'Dialog & Planung',
        format: 'Gemeinsam planen mit einem Terminkalender mit belegten Zeiten (8 P.)',
        short:
          'Plant gemeinsam eine Aktivität mit einem persönlichen Kalender, in dem Zeiten belegt sind.',
        goal: 'Mit einem Partner eine Vereinbarung aushandeln und sich einigen.',
        skill: 'Interaktives Aushandeln.',
      },
    },
  },
}
