import type { GermanText } from '~/utils/types'

/**
 * Sample A2-level German texts for reading comprehension practice
 * Each text is designed to match Goethe Institut A2 certification standards
 */
export const germanTexts: GermanText[] = [
  {
    id: 'email-001',
    title: 'E-Mail von Lisa',
    textType: 'email',
    difficulty: 'A2',
    estimatedReadingTime: 3,
    wordCount: 142,
    topics: ['Familie', 'Urlaub', 'Freunde'],
    createdAt: '2024-01-15',
    content: `Liebe Maria,

wie geht es dir? Mir geht es sehr gut! Ich schreibe dir aus dem Urlaub. Wir sind seit drei Tagen in München und es gefällt uns sehr gut hier.

Gestern waren wir im berühmten Englischen Garten spazieren. Das Wetter war wunderbar - sonnig und warm. Wir haben ein Picknick gemacht und viele Fotos gemacht. Mein Bruder Tom hat auch viele Leute kennengelernt. Er spricht jetzt den ganzen Tag nur Deutsch!

Heute wollen wir das Deutsche Museum besuchen. Morgen fahren wir nach Salzburg in Österreich. Ich freue mich schon sehr darauf.

Was machst du denn in den Ferien? Schreibst du mir bald zurück?

Viele liebe Grüße aus München
Lisa

P.S.: Ich bringe dir ein kleines Geschenk mit!`,
    questions: [
      {
        id: 'email-001-q1',
        textId: 'email-001',
        question: 'Wo ist Lisa im Urlaub?',
        options: ['In Berlin', 'In München', 'In Hamburg', 'In Salzburg'],
        correctAnswer: 1,
        explanation: 'Lisa schreibt "Ich schreibe dir aus dem Urlaub. Wir sind seit drei Tagen in München".',
        type: 'comprehension'
      },
      {
        id: 'email-001-q2',
        textId: 'email-001',
        question: 'Wie war das Wetter gestern?',
        options: ['Regnerisch und kalt', 'Sonnig und warm', 'Windig und kühl', 'Nebelig und feucht'],
        correctAnswer: 1,
        explanation: 'Lisa schreibt: "Das Wetter war wunderbar - sonnig und warm."',
        type: 'comprehension'
      },
      {
        id: 'email-001-q3',
        textId: 'email-001',
        question: 'Was wollen sie heute machen?',
        options: ['Ein Picknick machen', 'Nach Salzburg fahren', 'Das Deutsche Museum besuchen', 'Im Englischen Garten spazieren'],
        correctAnswer: 2,
        explanation: 'Lisa schreibt: "Heute wollen wir das Deutsche Museum besuchen."',
        type: 'comprehension'
      },
      {
        id: 'email-001-q4',
        textId: 'email-001',
        question: 'Was macht Tom jetzt den ganzen Tag?',
        options: ['Er macht Fotos', 'Er spricht nur Deutsch', 'Er schreibt E-Mails', 'Er lernt neue Leute kennen'],
        correctAnswer: 1,
        explanation: 'Lisa schreibt über ihren Bruder Tom: "Er spricht jetzt den ganzen Tag nur Deutsch!"',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'notice-001',
    title: 'Schwimmbad-Information',
    textType: 'notice',
    difficulty: 'A2',
    estimatedReadingTime: 2,
    wordCount: 98,
    topics: ['Öffentliche Einrichtungen', 'Öffnungszeiten', 'Regeln'],
    createdAt: '2024-01-16',
    content: `STADTBAD MITTE - WICHTIGE INFORMATION

Liebe Besucher,

ab dem 1. Februar ändern sich unsere Öffnungszeiten:

Montag bis Freitag: 6:00 - 22:00 Uhr
Samstag und Sonntag: 8:00 - 20:00 Uhr

PREISE:
Erwachsene: 4,50 Euro
Kinder (bis 14 Jahre): 2,00 Euro
Familienkarte: 12,00 Euro

WICHTIGE REGELN:
- Duschen vor dem Schwimmen ist Pflicht
- Kinder unter 8 Jahren nur mit Erwachsenen
- Schwimmkurse: Anmeldung an der Kasse

Bei Fragen rufen Sie uns an: 030-12345678

Ihr Team vom Stadtbad Mitte`,
    questions: [
      {
        id: 'notice-001-q1',
        textId: 'notice-001',
        question: 'Wann ändert sich die Öffnungszeit?',
        options: ['Ab dem 1. Januar', 'Ab dem 1. Februar', 'Ab dem 1. März', 'Ab dem 1. April'],
        correctAnswer: 1,
        explanation: 'Im Text steht: "ab dem 1. Februar ändern sich unsere Öffnungszeiten".',
        type: 'comprehension'
      },
      {
        id: 'notice-001-q2',
        textId: 'notice-001',
        question: 'Wie viel kostet der Eintritt für Erwachsene?',
        options: ['2,00 Euro', '4,50 Euro', '12,00 Euro', '6,00 Euro'],
        correctAnswer: 1,
        explanation: 'Bei den Preisen steht: "Erwachsene: 4,50 Euro".',
        type: 'comprehension'
      },
      {
        id: 'notice-001-q3',
        textId: 'notice-001',
        question: 'Was ist vor dem Schwimmen Pflicht?',
        options: ['Anmelden an der Kasse', 'Duschen', 'Bezahlen', 'Schwimmkurs machen'],
        correctAnswer: 1,
        explanation: 'In den wichtigen Regeln steht: "Duschen vor dem Schwimmen ist Pflicht".',
        type: 'comprehension'
      },
      {
        id: 'notice-001-q4',
        textId: 'notice-001',
        question: 'Wie lange ist das Schwimmbad am Sonntag geöffnet?',
        options: ['Von 6:00 bis 22:00 Uhr', 'Von 8:00 bis 20:00 Uhr', 'Von 8:00 bis 22:00 Uhr', 'Von 6:00 bis 20:00 Uhr'],
        correctAnswer: 1,
        explanation: 'Für Wochenende steht: "Samstag und Sonntag: 8:00 - 20:00 Uhr".',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'article-001',
    title: 'Gesund leben in der Stadt',
    textType: 'article',
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 156,
    topics: ['Gesundheit', 'Stadt', 'Lifestyle'],
    createdAt: '2024-01-17',
    content: `Gesund leben in der Stadt

Viele Menschen denken, dass das Leben in der Stadt ungesund ist. Aber das stimmt nicht immer! Mit ein paar einfachen Tipps kann man auch in der Stadt sehr gesund leben.

Sport ist wichtig: In fast jeder Stadt gibt es Parks zum Joggen oder Radfahren. Viele Städte haben auch öffentliche Fitnessstudios oder Schwimmbäder. Diese sind oft nicht teuer.

Essen: Auf den Wochenmärkten findet man frisches Obst und Gemüse von lokalen Bauern. Das ist gesund und schmeckt besser als im Supermarkt. Auch kleine Bioläden haben gute Produkte.

Entspannung: Stadtparks sind perfekt zum Entspannen. Hier kann man lesen, mit Freunden sprechen oder einfach die Natur genießen. Viele Parks haben auch Spielplätze für Kinder.

Transport: Gehen oder Fahrrad fahren ist gesünder als Auto fahren. In den meisten Städten gibt es gute öffentliche Verkehrsmittel.

Fazit: Gesund leben in der Stadt ist möglich - man muss nur wissen, wie!`,
    questions: [
      {
        id: 'article-001-q1',
        textId: 'article-001',
        question: 'Was denken viele Menschen über das Leben in der Stadt?',
        options: ['Es ist sehr gesund', 'Es ist ungesund', 'Es ist langweilig', 'Es ist zu teuer'],
        correctAnswer: 1,
        explanation: 'Am Anfang steht: "Viele Menschen denken, dass das Leben in der Stadt ungesund ist."',
        type: 'comprehension'
      },
      {
        id: 'article-001-q2',
        textId: 'article-001',
        question: 'Wo kann man in der Stadt frisches Obst und Gemüse kaufen?',
        options: ['Im Supermarkt', 'Auf Wochenmärkten', 'In Fitnessstudios', 'In Parks'],
        correctAnswer: 1,
        explanation: 'Im Text steht: "Auf den Wochenmärkten findet man frisches Obst und Gemüse von lokalen Bauern."',
        type: 'comprehension'
      },
      {
        id: 'article-001-q3',
        textId: 'article-001',
        question: 'Was ist gesünder als Auto fahren?',
        options: ['Bus fahren', 'Gehen oder Fahrrad fahren', 'U-Bahn fahren', 'Taxi fahren'],
        correctAnswer: 1,
        explanation: 'Der Text sagt: "Gehen oder Fahrrad fahren ist gesünder als Auto fahren."',
        type: 'comprehension'
      },
      {
        id: 'article-001-q4',
        textId: 'article-001',
        question: 'Wofür sind Stadtparks perfekt?',
        options: ['Zum Einkaufen', 'Zum Arbeiten', 'Zum Entspannen', 'Zum Kochen'],
        correctAnswer: 2,
        explanation: 'Im Text steht: "Stadtparks sind perfekt zum Entspannen."',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'advertisement-001',
    title: 'Café Sonnenschein - Stellenanzeige',
    textType: 'advertisement',
    difficulty: 'A2',
    wordCount: 118,
    estimatedReadingTime: 3,
    topics: ['Arbeit', 'Café', 'Bewerbung'],
    createdAt: '2024-01-18',
    content: `CAFÉ SONNENSCHEIN sucht DICH!

Wir sind ein kleines, gemütliches Café im Herzen der Altstadt und suchen:

SERVICEKRAFT (Teilzeit)
20 Stunden pro Woche

Was du machst:
• Gäste freundlich bedienen
• Kaffee und Kuchen servieren
• Bei der Küche helfen
• Tische sauber machen

Was du brauchst:
• Gute Deutschkenntnisse
• Freundlich sein
• Gerne mit Menschen arbeiten
• Samstags arbeiten können

Was wir bieten:
• Nette Kollegen
• 12 Euro pro Stunde
• Kostenloses Mittagessen
• Flexible Arbeitszeiten

Interesse? Dann komm einfach vorbei!
Café Sonnenschein
Marktplatz 15, 10115 Berlin
Öffnungszeiten: Mo-Sa 8:00-18:00

Oder ruf an: 030-98765432
Wir freuen uns auf dich!`,
    questions: [
      {
        id: 'advertisement-001-q1',
        textId: 'advertisement-001',
        question: 'Wie viele Stunden pro Woche soll man arbeiten?',
        options: ['10 Stunden', '20 Stunden', '30 Stunden', '40 Stunden'],
        correctAnswer: 1,
        explanation: 'In der Anzeige steht: "SERVICEKRAFT (Teilzeit) 20 Stunden pro Woche".',
        type: 'comprehension'
      },
      {
        id: 'advertisement-001-q2',
        textId: 'advertisement-001',
        question: 'Wie viel verdient man pro Stunde?',
        options: ['10 Euro', '12 Euro', '15 Euro', '8 Euro'],
        correctAnswer: 1,
        explanation: 'Bei "Was wir bieten" steht: "12 Euro pro Stunde".',
        type: 'comprehension'
      },
      {
        id: 'advertisement-001-q3',
        textId: 'advertisement-001',
        question: 'Was muss man samstags können?',
        options: ['Deutsch sprechen', 'Kochen', 'Arbeiten', 'Putzen'],
        correctAnswer: 2,
        explanation: 'Bei den Anforderungen steht: "Samstags arbeiten können".',
        type: 'comprehension'
      },
      {
        id: 'advertisement-001-q4',
        textId: 'advertisement-001',
        question: 'Wo ist das Café?',
        options: ['Marktplatz 15', 'Hauptstraße 15', 'Bahnhofstraße 15', 'Kirchplatz 15'],
        correctAnswer: 0,
        explanation: 'Die Adresse ist: "Café Sonnenschein, Marktplatz 15, 10115 Berlin".',
        type: 'comprehension'
      }
    ]
  },

  {
    id: 'instructions-001',
    title: 'Rezept: Deutscher Apfelkuchen',
    textType: 'instructions',
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 167,
    topics: ['Kochen', 'Rezept', 'Kuchen'],
    createdAt: '2024-01-19',
    content: `Deutscher Apfelkuchen - Einfach und lecker!

ZUTATEN (für 8 Personen):
• 3 große Äpfel
• 200g Mehl
• 150g Butter
• 100g Zucker
• 2 Eier
• 1 Packung Backpulver
• 100ml Milch
• 1 Prise Salz

ZUBEREITUNG:

1. Den Ofen auf 180°C vorheizen.

2. Die Äpfel waschen, schälen und in kleine Stücke schneiden.

3. Butter und Zucker in einer großen Schüssel mischen. Die Eier dazugeben und alles gut mischen.

4. Mehl, Backpulver und Salz in einer anderen Schüssel mischen. Dann zu der Butter-Zucker-Mischung geben.

5. Die Milch langsam dazugeben und alles zu einem glatten Teig mischen.

6. Die Apfelstücke unter den Teig heben.

7. Den Teig in eine gefettete Kuchenform geben.

8. Den Kuchen 45-50 Minuten backen. Mit einem Holzstäbchen testen: Wenn kein Teig daran klebt, ist der Kuchen fertig.

9. Den Kuchen abkühlen lassen.

Tipp: Der Kuchen schmeckt warm mit Vanilleeis besonders gut!

Guten Appetit!`,
    questions: [
      {
        id: 'instructions-001-q1',
        textId: 'instructions-001',
        question: 'Für wie viele Personen ist das Rezept?',
        options: ['6 Personen', '8 Personen', '10 Personen', '4 Personen'],
        correctAnswer: 1,
        explanation: 'In der Zutatenliste steht: "ZUTATEN (für 8 Personen)".',
        type: 'comprehension'
      },
      {
        id: 'instructions-001-q2',
        textId: 'instructions-001',
        question: 'Auf welche Temperatur soll man den Ofen vorheizen?',
        options: ['160°C', '180°C', '200°C', '220°C'],
        correctAnswer: 1,
        explanation: 'Der erste Schritt sagt: "Den Ofen auf 180°C vorheizen."',
        type: 'comprehension'
      },
      {
        id: 'instructions-001-q3',
        textId: 'instructions-001',
        question: 'Wie lange soll man den Kuchen backen?',
        options: ['30-35 Minuten', '45-50 Minuten', '60-65 Minuten', '20-25 Minuten'],
        correctAnswer: 1,
        explanation: 'Schritt 8 sagt: "Den Kuchen 45-50 Minuten backen."',
        type: 'comprehension'
      },
      {
        id: 'instructions-001-q4',
        textId: 'instructions-001',
        question: 'Womit schmeckt der Kuchen besonders gut?',
        options: ['Mit Sahne', 'Mit Vanilleeis', 'Mit Schokolade', 'Mit Früchten'],
        correctAnswer: 1,
        explanation: 'Der Tipp sagt: "Der Kuchen schmeckt warm mit Vanilleeis besonders gut!"',
        type: 'comprehension'
      }
    ]
  }
] 