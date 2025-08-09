import type { WritingTopic } from '~/utils/types'

/**
 * Sample A2-level German writing topics for writing practice
 * Each topic is designed to match Goethe Institut A2 certification standards
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
    prompt: 'Dein Freund Max hat dir geschrieben, dass er nächste Woche Geburtstag hat und eine kleine Party macht. Schreibe ihm eine E-Mail zurück.',
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
    prompt: 'Du möchtest im Hotel "Zur schönen Aussicht" in München ein Zimmer für deinen Urlaub reservieren. Schreibe einen Brief an das Hotel.',
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
    prompt: 'Beschreibe deine Heimatstadt. Was ist besonders an dieser Stadt? Was gefällt dir dort? Was können Touristen dort machen?',
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
    prompt: 'Du hast eine Stellenanzeige für einen Job als Verkäufer/in in einem Buchladen gesehen. Schreibe eine kurze Bewerbung.',
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
    prompt: 'Du machst Urlaub am Meer in Italien. Schreibe eine Postkarte an deine Familie zu Hause.',
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
    prompt: 'Du hast online ein Buch bestellt, aber das falsche Buch bekommen. Schreibe eine E-Mail an den Online-Shop.',
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
    prompt: 'Du musst für zwei Tage verreisen. Schreibe eine Nachricht an deinen Mitbewohner und bitte ihn, sich um deine Pflanzen zu kümmern.',
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
    prompt: 'Du machst eine Einweihungsfeier für deine neue Wohnung. Schreibe einen Brief an deine Freunde und lade sie ein.',
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
  }
]
