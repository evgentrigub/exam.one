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

P.S.: Ich bringe dir ein kleines Geschenk mit!`
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

Ihr Team vom Stadtbad Mitte`
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

Fazit: Gesund leben in der Stadt ist möglich - man muss nur wissen, wie!`
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
Wir freuen uns auf dich!`
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

Guten Appetit!`
  }
] 