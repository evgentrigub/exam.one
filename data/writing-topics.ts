import type { WritingTopic } from '~/utils/types'

/**
 * Sample German writing topics for writing practice
 * Each topic is designed to match Goethe Institut certification standards
 * A2 and C1 topics are from Goethe Institut A2 and C1 certification standards
 */
export const writingTopics: WritingTopic[] = [
  {
    id: 'email-friend-001',
    title: 'E-Mail an einen Freund',
    topicType: 'email',
    difficulty: 'A2',
    estimatedTime: 20,
    wordCount: {
      min: 80,
      max: 120
    },
    category: ['Freunde', 'Alltag', 'Persönlich'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine persönliche E-Mail an einen Freund oder eine Freundin.',
    task: 'Dein Freund Max hat dir geschrieben, dass er nächste Woche Geburtstag hat und eine kleine Party macht. Schreibe ihm eine E-Mail zurück.',
    requirements: [
      'Schreibe 80-120 Wörter',
      'Verwende eine passende Anrede und einen passenden Gruß',
      'Antworte auf seine Einladung',
      'Erzähle, was du ihm zum Geburtstag schenken möchtest',
      'Frage nach Details zur Party (Zeit, Ort, andere Gäste)'
    ],
    tips: [
      'Beginne mit "Lieber Max," oder "Hallo Max,"',
      'Beende mit "Viele Grüße" oder "Bis bald"',
      'Verwende einfache, klare Sätze',
      'Zeige Interesse an seinem Geburtstag'
    ]
  },
  
  {
    id: 'letter-formal-001',
    title: 'Formeller Brief - Hotelreservierung',
    topicType: 'letter',
    difficulty: 'A2',
    estimatedTime: 25,
    wordCount: {
      min: 100,
      max: 150
    },
    category: ['Hotel', 'Reisen', 'Formell'],
    createdAt: '2024-01-22',
    description: 'Schreibe einen formellen Brief an ein Hotel für eine Zimmerreservierung.',
    task: 'Du möchtest im Hotel "Zur schönen Aussicht" in München ein Zimmer für deinen Urlaub reservieren. Schreibe einen Brief an das Hotel.',
    requirements: [
      'Schreibe 100-150 Wörter',
      'Verwende eine formelle Anrede ("Sehr geehrte Damen und Herren")',
      'Gib deine Reisedaten an (Ankunft und Abreise)',
      'Beschreibe, welches Zimmer du möchtest (Einzelzimmer/Doppelzimmer)',
      'Frage nach dem Preis und nach Frühstück',
      'Bitte um eine Bestätigung',
      'Verwende einen formellen Gruß ("Mit freundlichen Grüßen")'
    ],
    tips: [
      'Verwende höfliche Formulierungen wie "Ich möchte gerne..."',
      'Strukturiere den Brief logisch',
      'Vergiss nicht deine Kontaktdaten am Ende'
    ]
  },

  {
    id: 'essay-hometown-001',
    title: 'Kurzer Aufsatz - Meine Stadt',
    topicType: 'essay',
    difficulty: 'A2',
    estimatedTime: 30,
    wordCount: {
      min: 120,
      max: 180
    },
    category: ['Stadt', 'Beschreibung', 'Persönlich'],
    createdAt: '2024-01-22',
    description: 'Schreibe einen kurzen Aufsatz über deine Heimatstadt oder eine Stadt, die du gut kennst.',
    task: 'Beschreibe deine Heimatstadt. Was ist besonders an dieser Stadt? Was gefällt dir dort? Was können Touristen dort machen?',
    requirements: [
      'Schreibe 120-180 Wörter',
      'Beschreibe die Lage der Stadt',
      'Erzähle von interessanten Orten oder Sehenswürdigkeiten',
      'Erkläre, was dir an der Stadt gefällt',
      'Gib Empfehlungen für Besucher',
      'Verwende Verbindungswörter wie "außerdem", "aber", "deshalb"'
    ],
    tips: [
      'Beginne mit einer kurzen Einleitung über deine Stadt',
      'Teile den Text in Absätze auf',
      'Verwende beschreibende Adjektive',
      'Beende mit deiner persönlichen Meinung'
    ]
  },

  {
    id: 'form-application-001',
    title: 'Bewerbung für einen Job',
    topicType: 'form',
    difficulty: 'A2',
    estimatedTime: 25,
    wordCount: {
      min: 90,
      max: 140
    },
    category: ['Arbeit', 'Bewerbung', 'Formell'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine einfache Bewerbung für eine Teilzeitstelle.',
    task: 'Du hast eine Stellenanzeige für einen Job als Verkäufer/in in einem Buchladen gesehen. Schreibe eine kurze Bewerbung.',
    requirements: [
      'Schreibe 90-140 Wörter',
      'Erwähne, für welche Stelle du dich bewirbst',
      'Erzähle kurz von dir (Alter, Herkunft, Erfahrung)',
      'Erkläre, warum du diesen Job möchtest',
      'Erwähne deine Deutschkenntnisse',
      'Gib deine Verfügbarkeit an (wann kannst du arbeiten?)',
      'Verwende eine höfliche, aber nicht zu formelle Sprache'
    ],
    tips: [
      'Beginne mit "Sehr geehrte Damen und Herren" oder dem Namen der Person',
      'Zeige Interesse und Motivation',
      'Erwähne relevante Fähigkeiten oder Hobbys',
      'Beende höflich mit der Bitte um ein Gespräch'
    ]
  },

  {
    id: 'postcard-vacation-001',
    title: 'Postkarte aus dem Urlaub',
    topicType: 'postcard',
    difficulty: 'A2',
    estimatedTime: 15,
    wordCount: {
      min: 60,
      max: 100
    },
    category: ['Urlaub', 'Familie', 'Persönlich'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine Postkarte aus dem Urlaub an deine Familie.',
    task: 'Du machst Urlaub am Meer in Italien. Schreibe eine Postkarte an deine Familie zu Hause.',
    requirements: [
      'Schreibe 60-100 Wörter',
      'Beschreibe, wo du bist und wie das Wetter ist',
      'Erzähle, was du gemacht hast oder was du planst',
      'Erwähne das Essen oder besondere Erlebnisse',
      'Frage, wie es der Familie geht',
      'Verwende eine persönliche, fröhliche Sprache'
    ],
    tips: [
      'Postkarten sind kurz und persönlich',
      'Verwende Präsens und Perfekt',
      'Zeige deine Begeisterung für den Urlaub',
      'Vergiss nicht die Adresse und den Gruß'
    ]
  },

  {
    id: 'email-complaint-001',
    title: 'E-Mail - Beschwerde',
    topicType: 'email',
    difficulty: 'A2',
    estimatedTime: 25,
    wordCount: {
      min: 100,
      max: 150
    },
    category: ['Beschwerde', 'Service', 'Formell'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine höfliche Beschwerde-E-Mail über ein Problem.',
    task: 'Du hast online ein Buch bestellt, aber das falsche Buch bekommen. Schreibe eine E-Mail an den Online-Shop.',
    requirements: [
      'Schreibe 100-150 Wörter',
      'Erkläre das Problem klar und höflich',
      'Gib Details an: Bestellnummer, was bestellt, was erhalten',
      'Sage, was du möchtest (Umtausch, Rückgabe, etc.)',
      'Verwende höfliche, aber bestimmte Sprache',
      'Bitte um eine schnelle Lösung'
    ],
    tips: [
      'Bleibe höflich, auch wenn du unzufrieden bist',
      'Strukturiere die E-Mail logisch',
      'Verwende Formulierungen wie "Ich möchte Sie darauf aufmerksam machen..."',
      'Biete deine Mitarbeit an ("Gerne sende ich Ihnen...")'
    ]
  },

  {
    id: 'note-roommate-001',
    title: 'Nachricht an Mitbewohner',
    topicType: 'note',
    difficulty: 'A2',
    estimatedTime: 10,
    wordCount: {
      min: 40,
      max: 80
    },
    category: ['Wohnen', 'Alltag', 'Informell'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine kurze Nachricht an deinen Mitbewohner.',
    task: 'Du musst für zwei Tage verreisen. Schreibe eine Nachricht an deinen Mitbewohner und bitte ihn, sich um deine Pflanzen zu kümmern.',
    requirements: [
      'Schreibe 40-80 Wörter',
      'Erkläre, wann du wegfährst und wann du zurückkommst',
      'Bitte um Hilfe mit den Pflanzen',
      'Gib einfache Anweisungen (wie oft gießen, etc.)',
      'Bedanke dich im Voraus',
      'Verwende informelle, freundliche Sprache'
    ],
    tips: [
      'Nachrichten sind kurz und direkt',
      'Verwende "du" und informelle Anrede',
      'Sei freundlich und dankbar',
      'Gib klare, einfache Anweisungen'
    ]
  },

  {
    id: 'letter-invitation-001',
    title: 'Einladungsbrief',
    topicType: 'letter',
    difficulty: 'A2',
    estimatedTime: 20,
    wordCount: {
      min: 80,
      max: 120
    },
    category: ['Einladung', 'Feier', 'Persönlich'],
    createdAt: '2024-01-22',
    description: 'Schreibe einen Einladungsbrief für eine besondere Feier.',
    task: 'Du machst eine Einweihungsfeier für deine neue Wohnung. Schreibe einen Brief an deine Freunde und lade sie ein.',
    requirements: [
      'Schreibe 80-120 Wörter',
      'Erkläre den Anlass (neue Wohnung)',
      'Gib Datum, Zeit und Adresse an',
      'Beschreibe kurz deine neue Wohnung',
      'Sage, was es zu essen und trinken gibt',
      'Bitte um Rückmeldung bis zu einem bestimmten Datum',
      'Verwende eine einladende, fröhliche Sprache'
    ],
    tips: [
      'Zeige deine Freude über die neue Wohnung',
      'Mache die Einladung attraktiv und einladend',
      'Gib alle wichtigen Informationen an',
      'Verwende Formulierungen wie "Ich würde mich freuen, wenn..."'
    ]
  },

  // C1 Level Topics
  {
    id: 'essay-digitalization-001',
    title: 'Argumentativer Aufsatz - Digitalisierung und Gesellschaft',
    topicType: 'essay',
    difficulty: 'C1',
    estimatedTime: 50,
    wordCount: {
      min: 230,
      max: 300
    },
    category: ['Gesellschaft', 'Argumentation', 'Digitalisierung'],
    createdAt: '2024-01-22',
    description: 'Schreiben Sie einen argumentativen Aufsatz über die Auswirkungen der Digitalisierung auf die moderne Gesellschaft.',
    task: 'Die fortschreitende Digitalisierung verändert unsere Gesellschaft grundlegend. Während einige diese Entwicklung als Fortschritt begrüßen, sehen andere darin eine Bedrohung für zwischenmenschliche Beziehungen und traditionelle Werte. Nehmen Sie zu dieser kontroversen Diskussion Stellung.',
    requirements: [
      'Schreiben Sie 230',
      'Entwickeln Sie eine klare Argumentation mit These',
      'Präsentieren Sie mindestens zwei Argumente pro Standpunkt',
      'Verwenden Sie konkrete Beispiele zur Veranschaulichung',
      'Strukturieren Sie Ihren Text mit Einleitung, Hauptteil und Schluss',
      'Nutzen Sie komplexe Satzstrukturen und Konnektoren',
      'Beziehen Sie eine begründete persönliche Position'
    ],
    tips: [
      'Verwenden Sie Konnektoren wie "einerseits...andererseits", "folglich", "demzufolge"',
      'Strukturieren Sie Argumente logisch und nachvollziehbar',
      'Differenzieren Sie zwischen verschiedenen Aspekten des Themas',
      'Verwenden Sie den Konjunktiv für hypothetische Überlegungen'
    ]
  },

  {
    id: 'report-workplace-001',
    title: 'Professioneller Bericht - Arbeitsplatz der Zukunft',
    topicType: 'report',
    difficulty: 'C1',
    estimatedTime: 55,
    wordCount: {
      min: 230,
      max: 300
    },
    category: ['Beruf', 'Zukunft', 'Analyse'],
    createdAt: '2024-01-22',
    description: 'Verfassen Sie einen professionellen Bericht über die Veränderungen am Arbeitsplatz und deren Auswirkungen auf Arbeitnehmer.',
    task: 'Ihr Unternehmen plant eine umfassende Modernisierung der Arbeitsplätze, einschließlich Home-Office-Möglichkeiten, flexibler Arbeitszeiten und digitaler Kollaborationstools. Als Personalverantwortliche/r sollen Sie einen Bericht über die zu erwartenden Auswirkungen auf die Mitarbeiterzufriedenheit und Produktivität erstellen.',
    requirements: [
      'Schreiben Sie 300-380 Wörter',
      'Gliedern Sie den Bericht in Einleitung, Analyse und Empfehlungen',
      'Analysieren Sie Vor- und Nachteile der geplanten Änderungen',
      'Berücksichtigen Sie verschiedene Mitarbeitergruppen',
      'Formulieren Sie konkrete, umsetzbare Empfehlungen',
      'Verwenden Sie objektive, sachliche Sprache',
      'Integrieren Sie relevante Daten oder Statistiken (fiktiv)'
    ],
    tips: [
      'Verwenden Sie professionelle Formulierungen und Fachterminologie',
      'Strukturieren Sie mit Überschriften und Absätzen',
      'Belegen Sie Aussagen mit logischen Argumenten',
      'Verwenden Sie Passivkonstruktionen für Objektivität'
    ]
  },

  {
    id: 'review-literature-001',
    title: 'Kritische Rezension - Zeitgenössische Literatur',
    topicType: 'review',
    difficulty: 'C1',
    estimatedTime: 45,
    wordCount: {
      min: 230,
      max: 300
    },
    category: ['Literatur', 'Kritik', 'Kultur'],
    createdAt: '2024-01-22',
    description: 'Schreiben Sie eine kritische Rezension eines zeitgenössischen deutschen Romans.',
    task: 'Sie haben kürzlich den Roman "Tschick" von Wolfgang Herrndorf gelesen, der als wichtiges Werk der deutschen Gegenwartsliteratur gilt. Verfassen Sie eine kritische Rezension für eine Literaturzeitschrift, in der Sie das Werk analysieren und bewerten.',
    requirements: [
      'Schreiben Sie 260-320 Wörter',
      'Fassen Sie die Handlung kurz zusammen (ohne zu viel zu verraten)',
      'Analysieren Sie Stil, Sprache und literarische Mittel',
      'Bewerten Sie die Charakterentwicklung und Themen',
      'Diskutieren Sie die gesellschaftliche Relevanz des Werks',
      'Formulieren Sie eine begründete Gesamtbewertung',
      'Verwenden Sie literaturwissenschaftliche Terminologie'
    ],
    tips: [
      'Balance zwischen Beschreibung und kritischer Analyse',
      'Verwenden Sie präzise literarische Fachbegriffe',
      'Stützen Sie Bewertungen auf konkrete Textbeispiele',
      'Berücksichtigen Sie den literarischen Kontext'
    ]
  },

  {
    id: 'proposal-environment-001',
    title: 'Formeller Vorschlag - Umweltschutzinitiative',
    topicType: 'proposal',
    difficulty: 'C1',
    estimatedTime: 60,
    wordCount: {
      min: 230,
      max: 300
    },
    category: ['Umwelt', 'Initiative', 'Formell'],
    createdAt: '2024-01-22',
    description: 'Erstellen Sie einen formellen Vorschlag für eine Umweltschutzinitiative in Ihrer Gemeinde.',
    task: 'Die Stadtverwaltung Ihrer Gemeinde hat einen Wettbewerb für innovative Umweltschutzprojekte ausgeschrieben. Entwickeln Sie einen detaillierten Vorschlag für ein Projekt, das zur Verbesserung der lokalen Umweltsituation beitragen könnte.',
    requirements: [
      'Schreiben Sie 320-400 Wörter',
      'Strukturieren Sie den Vorschlag mit klaren Abschnitten',
      'Definieren Sie das Umweltproblem und dessen Relevanz',
      'Beschreiben Sie Ihre Lösungsidee detailliert',
      'Erläutern Sie die erwarteten positiven Auswirkungen',
      'Diskutieren Sie mögliche Herausforderungen und Lösungsansätze',
      'Verwenden Sie überzeugende, aber sachliche Argumentation'
    ],
    tips: [
      'Beginnen Sie mit einer prägnanten Problemdarstellung',
      'Verwenden Sie konkrete, messbare Ziele',
      'Antizipieren Sie mögliche Einwände und Gegenargumente',
      'Schließen Sie mit einem überzeugenden Appell ab'
    ]
  },

  {
    id: 'article-education-001',
    title: 'Meinungsartikel - Bildungssystem im Wandel',
    topicType: 'article',
    difficulty: 'C1',
    estimatedTime: 50,
    wordCount: {
      min: 230,
      max: 300
    },
    category: ['Bildung', 'Meinung', 'Gesellschaft'],
    createdAt: '2024-01-22',
    description: 'Verfassen Sie einen Meinungsartikel über notwendige Reformen im deutschen Bildungssystem.',
    task: 'Das deutsche Bildungssystem steht vor großen Herausforderungen: Lehrermangel, veraltete Lehrpläne, unzureichende Digitalisierung und wachsende Bildungsungleichheit. Schreiben Sie einen Meinungsartikel für eine überregionale Zeitung, in dem Sie Ihre Sicht auf die dringendsten Probleme und mögliche Lösungsansätze darlegen.',
    requirements: [
      'Schreiben Sie 290-360 Wörter',
      'Formulieren Sie eine klare, persönliche Meinung',
      'Identifizieren Sie die wichtigsten Problembereiche',
      'Entwickeln Sie realistische Lösungsvorschläge',
      'Verwenden Sie aktuelle Beispiele und Bezüge',
      'Berücksichtigen Sie verschiedene Perspektiven',
      'Schreiben Sie in einem engagierten, aber sachlichen Ton'
    ],
    tips: [
      'Verwenden Sie eine einprägsame Einleitung und einen starken Schluss',
      'Variieren Sie Satzlänge und -struktur für bessere Lesbarkeit',
      'Nutzen Sie rhetorische Mittel sparsam aber wirkungsvoll',
      'Bleiben Sie trotz persönlicher Meinung respektvoll und differenziert'
    ]
  }
]
