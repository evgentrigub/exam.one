import type { StructureText } from '../../../types'

export const de: StructureText = {
  reading: {
    label: 'Leseverstehen (Comprensión de lectura)',
    summary:
      'Vier Aufgaben: ein persönlicher Brief oder eine E-Mail, acht kurze Anzeigen und Mitteilungen, drei Texte, die Aussagen zugeordnet werden, und ein längerer erzählender Text.',
    scoringNote:
      'Rohpunkte, 1 pro Aufgabe (25). Die Prüfung fasst Leseverstehen und Schreiben als Grupo 1 zusammen (50 Punkte); zum Bestehen brauchst du in jeder Gruppe 30.',
    parts: {
      1: {
        title: 'Persönlicher Brief oder E-Mail',
        format: 'Tarea 1 · 1 Text · 5 Fragen · a · b · c',
        short: 'Lies einen persönlichen Brief oder eine E-Mail und beantworte fünf Fragen dazu.',
        goal: 'Die Hauptinformationen und Details einer persönlichen Nachricht verstehen.',
        skill: 'Detailliertes Lesen.',
      },
      2: {
        title: 'Anzeigen und Mitteilungen',
        format: 'Tarea 2 · 8 kurze Texte · je 1 Frage · a · b · c',
        short:
          'Lies acht kurze Anzeigen, Mitteilungen oder Beiträge und beantworte zu jedem eine Frage.',
        goal: 'Bestimmte Informationen in kurzen öffentlichen Texten finden.',
        skill: 'Lesen nach bestimmten Informationen.',
      },
      3: {
        title: 'Drei Texte',
        format: 'Tarea 3 · 3 Texte · 6 Aussagen · A · B · C',
        short:
          'Lies drei kurze Texte und entscheide, auf welchen Text sich jede der sechs Aussagen bezieht.',
        goal: 'Ähnliche Texte vergleichen und finden, wo jede Information steht.',
        skill: 'Lesen nach bestimmten Informationen.',
      },
      4: {
        title: 'Erzählender Text',
        format: 'Tarea 4 · 1 Text · 6 Fragen · a · b · c',
        short:
          'Lies einen längeren Text (eine Biografie, einen Blog, eine Geschichte oder einen Reiseführer) und beantworte sechs Fragen.',
        goal: 'Einem längeren erzählenden Text folgen und seine Details verstehen.',
        skill: 'Detailliertes Lesen.',
      },
    },
  },
  listening: {
    label: 'Hörverstehen (Comprensión auditiva)',
    summary:
      'Vier Aufgaben: sechs kurze Gespräche, sechs Radiobeiträge, ein Gespräch, dessen Aussagen den Sprechern zugeordnet werden, und sieben kurze Nachrichten. Jede Aufnahme hörst du zweimal.',
    scoringNote:
      'Rohpunkte, 1 pro Aufgabe (25). Die Prüfung fasst Hörverstehen und Sprechen als Grupo 2 zusammen (50 Punkte); zum Bestehen brauchst du in jeder Gruppe 30.',
    parts: {
      1: {
        title: 'Kurze Gespräche',
        format: 'Tarea 1 · 6 Gespräche · a · b · c',
        short: 'Hör sechs kurze Alltagsgespräche und beantworte zu jedem eine Frage.',
        goal: 'Die wichtigen Informationen kurzer persönlicher Gespräche verstehen.',
        skill: 'Hören von bestimmten Informationen.',
      },
      2: {
        title: 'Radio',
        format: 'Tarea 2 · 6 Radiobeiträge · a · b · c',
        short:
          'Hör sechs kurze Radiobeiträge – Nachrichten, Werbung, Ansagen – und beantworte zu jedem eine Frage.',
        goal: 'Die Hauptaussage kurzer Sendebeiträge verstehen.',
        skill: 'Globales und detailliertes Hören.',
      },
      3: {
        title: 'Wer sagt es?',
        format: 'Tarea 3 · 1 Gespräch · 6 Aussagen · Mann · Frau · keiner',
        short:
          'Hör ein Gespräch zwischen zwei Freunden und entscheide bei sechs Aussagen, wer sie macht: der Mann, die Frau oder keiner.',
        goal: 'Einem Gespräch folgen und Informationen der richtigen Person zuordnen.',
        skill: 'Hören von bestimmten Informationen.',
      },
      4: {
        title: 'Nachrichten',
        format: 'Tarea 4 · 7 Nachrichten · 10 Aussagen, 3 bleiben übrig',
        short: 'Hör sieben kurze Nachrichten und Ansagen und ordne jede ihrer Aussage zu.',
        goal: 'Den Zweck kurzer Nachrichten und Ansagen verstehen.',
        skill: 'Globales Hören.',
      },
    },
  },
  writing: {
    label: 'Schreiben (Expresión e interacción escritas)',
    summary:
      'Eine Antwort auf eine kurze Nachricht (60–70 Wörter) und ein Text über den Alltag oder eine Biografie (70–80 Wörter).',
    scoringNote:
      'Die Übung bewertet jede Aufgabe auf den beiden Skalen der Prüfung, je 0–3: Aufgabenerfüllung (cumplimiento de la tarea) und Sprachgebrauch (uso de la lengua). Die Prüfung gewichtet den Sprachgebrauch mit 66% und die Aufgabenerfüllung mit 34% und rechnet das Ergebnis in 25 Punkte um (×25/3); die Übung zeigt die Rohstufen, wobei 2 bedeutet, dass A2 erreicht ist.',
    parts: {
      1: {
        title: 'Antwort auf eine Nachricht',
        format: 'Tarea 1 · E-Mail, Notiz oder Beitrag · 60–70 Wörter',
        short:
          'Lies eine kurze Nachricht von einem Freund und schreib eine Antwort, die jeden Punkt abdeckt.',
        goal: 'Eine persönliche Nachricht schreiben, die antwortet, informiert und etwas vorschlägt.',
        skill: 'Schriftliche Interaktion.',
      },
      2: {
        title: 'Alltag oder eine Biografie',
        format: 'Tarea 2 · Opción A oder B · 70–80 Wörter',
        short:
          'Schreib über ein Erlebnis aus deinem Alltag (Opción A) oder eine Biografie bzw. Geschichte anhand vorgegebener Informationen (Opción B).',
        goal: 'Einen zusammenhängenden Text über Vergangenheit und Gegenwart schreiben.',
        skill: 'Schriftliche Produktion.',
      },
    },
  },
  speaking: {
    label: 'Sprechen (Expresión e interacción orales)',
    summary:
      'Eine kurze Präsentation zu einem Thema, die Beschreibung einer Szene und ein Rollenspiel mit dem Prüfer in dieser Szene. Die Prüfung gibt 12 Minuten Vorbereitungszeit.',
    scoringNote:
      'Übung, anhand deines Transkripts: jede Aufgabe auf den beiden Skalen der Prüfung, je 0–3: Aufgabenerfüllung und Sprachgebrauch (18). Die Prüfung bewertet zusätzlich den ganzen Test global und rechnet in 25 Punkte um; die Übung zeigt die Rohstufen, wobei 2 bedeutet, dass A2 erreicht ist.',
    parts: {
      1: {
        title: 'Präsentation',
        format: 'Tarea 1 · ein Thema · 5 Punkte · Monolog',
        short:
          'Halte eine kurze Präsentation über dich zu einem Thema und geh auf die Punkte auf der Karte ein.',
        goal: 'In einem kurzen, zusammenhängenden Monolog über dein eigenes Leben sprechen.',
        skill: 'Mündliche Produktion.',
      },
      2: {
        title: 'Eine Szene beschreiben',
        format: 'Tarea 2 · eine Szene · Leitfragen · Monolog',
        short:
          'Beschreib eine Alltagsszene: die Personen, den Ort, was sie tun und wie sie sich fühlen.',
        goal: 'Personen und eine Situation mithilfe von Leitfragen beschreiben.',
        skill: 'Beschreiben.',
      },
      3: {
        title: 'Rollenspiel',
        format: 'Tarea 3 · eine Situation mit dem Prüfer · 4 Redebeiträge',
        short: 'Spiel mit dem Prüfer eine Situation aus der Szene: antworte, frag und reagiere.',
        goal: 'An einem einfachen Alltagsgeschäft oder -gespräch teilnehmen.',
        skill: 'Mündliche Interaktion.',
      },
    },
  },
}
