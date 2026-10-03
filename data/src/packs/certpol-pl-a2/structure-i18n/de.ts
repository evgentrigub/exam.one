import type { StructureText } from '../../../types'

export const de: StructureText = {
  listening: {
    label: 'Hörverstehen (Rozumienie ze słuchu)',
    summary:
      'Fünf Aufgaben: wer spricht und wo, eine Radiodurchsage, ein Dialog, Telefonnachrichten und Zahlen zum Aufschreiben. Jede Aufnahme hörst du zweimal.',
    scoringNote:
      'Rohpunkte, 1 pro Aufgabe (30). Der schriftliche Teil (Hören, Lesen und Schreiben, 80 Punkte) ist mit 50% der Gesamtpunkte bestanden; auf A2 gibt es kein Minimum pro Modul.',
    parts: {
      1: {
        title: 'Wer spricht? Wo?',
        format: 'Zadanie I · 10 kurze Aufnahmen · a · b · c',
        short: 'Hör zehn kurze Aufnahmen und entscheide, wer spricht oder wo du sie hörst.',
        goal: 'Sprecher und Situation kurzer Alltagsäußerungen erkennen.',
        skill: 'Die Situation heraushören.',
      },
      2: {
        title: 'Radiodurchsage',
        format: 'Zadanie II · 5 × prawda / fałsz',
        short: 'Hör eine Radiodurchsage und entscheide, ob fünf Sätze richtig oder falsch sind.',
        goal: 'Die wichtigsten Fakten einer öffentlichen Durchsage verstehen.',
        skill: 'Detailliertes Hören.',
      },
      3: {
        title: 'Dialog',
        format: 'Zadanie III · 5 Personen · 7 Optionen, 2 bleiben übrig',
        short: 'Hör ein Gespräch und ordne fünf Personen zu, was sie tun.',
        goal: 'Einem Gespräch folgen und Informationen der richtigen Person zuordnen.',
        skill: 'Hören von bestimmten Informationen.',
      },
      4: {
        title: 'Telefonnachrichten',
        format: 'Zadanie IV · 5 Nachrichten · 6 Optionen, 1 bleibt übrig',
        short: 'Hör fünf Nachrichten auf dem Anrufbeantworter und ordne jede ihrer Aussage zu.',
        goal: 'Den Zweck kurzer Telefonnachrichten verstehen.',
        skill: 'Globales Hören.',
      },
      5: {
        title: 'Zahlen',
        format: 'Zadanie V · 5 Lücken · ein Datum, eine Zahl, eine Uhrzeit oder ein Jahr',
        short:
          'Hör eine Durchsage und schreib fünf Zahlen auf: Daten, Uhrzeiten, Preise und Jahreszahlen.',
        goal: 'Gehörte Zahlen verstehen und aufschreiben.',
        skill: 'Notizen machen.',
      },
    },
  },
  reading: {
    label: 'Leseverstehen und Grammatik (Rozumienie tekstów pisanych)',
    summary:
      'Sechs Aufgaben: die richtige Form wählen, Wörter aus einem Kasten, öffentliche Schilder, kurze Mitteilungen, ein Formular zum Ausfüllen und Bildunterschriften zum Zuordnen.',
    scoringNote:
      'Rohpunkte (30): 0,5 pro Lücke in den Aufgaben I, II und V, 1 pro Aufgabe in III, IV und VI. Auf A2 gehört Grammatik zu diesem Modul.',
    parts: {
      1: {
        title: 'Die richtige Form',
        format: 'Zadanie I · 10 Lücken · wähle 1 von 3 Formen · je 0,5',
        short: 'Wähle für jede der zehn Lücken in einem Text die richtige grammatische Form.',
        goal: 'Den richtigen Kasus, die richtige Verbform und Wortform im Kontext verwenden.',
        skill: 'Grammatik im Kontext.',
      },
      2: {
        title: 'Wörter aus einem Kasten',
        format: 'Zadanie II · 10 Lücken · 11 Wörter, 1 bleibt übrig · je 0,5',
        short: 'Ergänze zehn Sätze mit Wörtern aus einem Kasten.',
        goal: 'Das Wort wählen, das zur Bedeutung und zur Grammatik des Satzes passt.',
        skill: 'Wortschatz und Grammatik.',
      },
      3: {
        title: 'Öffentliche Schilder',
        format: 'Zadanie III · 5 Schilder · a · b · c',
        short: 'Lies fünf öffentliche Schilder und wähle, wo du sie siehst oder was sie bedeuten.',
        goal: 'Schilder und kurze Hinweise an Orten des Alltags verstehen.',
        skill: 'Kurze Alltagstexte lesen.',
      },
      4: {
        title: 'Kurze Mitteilungen',
        format: 'Zadanie IV · 5 Mitteilungen · a · b · c',
        short: 'Lies fünf kurze Mitteilungen und Nachrichten und wähle die richtige Antwort.',
        goal: 'Die Hauptinformation kurzer praktischer Texte verstehen.',
        skill: 'Lesen nach bestimmten Informationen.',
      },
      5: {
        title: 'Formular ausfüllen',
        format: 'Zadanie V · ein Text und ein Formular · 10 Lücken · je 0,5',
        short:
          'Lies, was eine Person über sich schreibt, und fülle zehn Felder eines Formulars aus.',
        goal: 'Persönliche Angaben in einem Text finden und richtig aufschreiben.',
        skill: 'Detailliertes Lesen.',
      },
      6: {
        title: 'Bildunterschriften',
        format: 'Zadanie VI · 5 Szenen · 6 Bildunterschriften, 1 bleibt übrig',
        short: 'Ordne fünf Szenen die Bildunterschriften zu, die sie beschreiben.',
        goal: 'Eine kurze Beschreibung mit der Situation verbinden, die sie zeigt.',
        skill: 'Sinnerfassendes Lesen.',
      },
    },
  },
  writing: {
    label: 'Schreiben (Pisanie)',
    summary:
      'Ein kurzer Text (ein Gruß oder eine Nachricht) und ein längerer Text (eine Beschreibung oder ein Brief).',
    scoringNote:
      'Offiziell ein Set aus zwei Aufgaben, gemeinsam bewertet: Aufgabenerfüllung 6, sprachliche Vielfalt 7, Korrektheit 7 (20). Die Übung bewertet jede Aufgabe nach denselben Kriterien: 2/2/2 und 4/5/5.',
    parts: {
      1: {
        title: 'Kurzer Text',
        format: 'Zadanie a · Gruß oder Nachricht · 10–30 Wörter',
        short: 'Schreib einen kurzen Gruß oder eine Textnachricht zu einem Anlass im Alltag.',
        goal: 'Eine kurze persönliche Nachricht schreiben, die die Aufgabe erfüllt.',
        skill: 'Kurzes funktionales Schreiben.',
      },
      2: {
        title: 'Längerer Text',
        format: 'Zadanie b · Beschreibung oder Brief · 70–100 Wörter',
        short:
          'Beschreib eine Person, einen Ort oder ein Ereignis oder schreib einen kurzen privaten Brief.',
        goal: 'Einen zusammenhängenden Text schreiben, der jeden Leitpunkt abdeckt.',
        skill: 'Beschreibendes Schreiben.',
      },
    },
  },
  speaking: {
    label: 'Sprechen (Mówienie)',
    summary:
      'Beantworte die Fragen des Prüfers zu dir, beschreib eine Person auf einem Foto und spiel eine Situation mit dem Prüfer.',
    scoringNote:
      'Übung, anhand deines Transkripts: Aufgabenerfüllung 4 + 10 + 10 sowie Wortschatz und Grammatik je 6, auf die Aufgaben verteilt (36). Die Prüfung bewertet zusätzlich die Aussprache (0–4), insgesamt 40 Punkte, und ist mit 50% (20) bestanden.',
    parts: {
      1: {
        title: 'Über dich',
        format: 'Zadanie 1 · Fragen des Prüfers · 4 Antworten',
        short:
          'Beantworte die Fragen des Prüfers zu dir, deiner Familie, deinen Interessen und deiner Arbeit oder deinem Studium.',
        goal: 'Einfache persönliche Informationen in ganzen Sätzen geben.',
        skill: 'Fragen beantworten.',
      },
      2: {
        title: 'Ein Foto beschreiben',
        format: 'Zadanie 2 · eine Person auf einem Foto · Monolog',
        short: 'Beschreib die Person auf einem Foto: wer sie ist, wie sie aussieht, was sie tut.',
        goal: 'Eine Person und eine Situation in einem kurzen zusammenhängenden Monolog beschreiben.',
        skill: 'Beschreiben.',
      },
      3: {
        title: 'Rollenspiel',
        format: 'Zadanie 3 · eine Situation mit dem Prüfer · 4 Redebeiträge',
        short:
          'Spiel eine Alltagssituation: beginne das Gespräch und reagiere dann auf das, was der Prüfer sagt.',
        goal: 'In einem einfachen Alltagsgespräch einladen, vorschlagen, verabreden und reagieren.',
        skill: 'Interaktion.',
      },
    },
  },
}
