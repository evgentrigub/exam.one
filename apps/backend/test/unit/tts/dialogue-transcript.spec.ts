import { goetheDeA1, goetheDeA2, cambridgeEnA2, certpolPlA2, deleEsA2 } from '@exam-one/exam-packs'
import {
  dialogueAudioPlanKey,
  fallbackVoiceFor,
  planDialogueVoices,
  planMonologue,
} from '../../../src/speech/tts/dialogueTranscript'

const english = { lang: 'en', voices: cambridgeEnA2.speech.voices }
const spanish = { lang: 'es', voices: deleEsA2.speech.voices }
const polish = {
  lang: 'pl',
  voices: [
    { id: 'pl_gosia', gender: 'female' as const },
    { id: 'pl_darkman', gender: 'male' as const },
    { id: 'pl_bass', gender: 'male' as const },
  ],
}

/** Every transcript a pack's listening seeds carry. */
function transcripts(pack: typeof goetheDeA2): string[] {
  return (pack.seedExercises?.listening ?? []).flatMap(exercise => {
    const items = Array.isArray(exercise['items']) ? (exercise['items'] as Array<{ transcript?: string }>) : []
    return [exercise['transcript'], ...items.map(item => item.transcript)].filter(
      (text): text is string => typeof text === 'string' && text.length > 0
    )
  })
}

describe('dialogue voice planning', () => {
  it('keeps every German seed plan identical when the pack passes its voices', () => {
    for (const pack of [goetheDeA2, goetheDeA1]) {
      const options = { lang: 'de', voices: pack.speech.voices }
      for (const text of transcripts(pack)) {
        expect(dialogueAudioPlanKey(text, options)).toBe(dialogueAudioPlanKey(text))
      }
    }
  })

  it('keeps the German roster for German labels', () => {
    const plan = planDialogueVoices('Frau: Guten Tag. Mann: Hallo. Frau: Tschüss.')
    expect(plan?.map(turn => turn.voice)).toEqual(['victoria', 'martin', 'victoria'])
    expect(planMonologue('Guten Tag, meine Damen und Herren.')).toEqual({
      voice: 'martin',
      text: 'Guten Tag, meine Damen und Herren.',
    })
  })

  it('gives English roles and names voices of their gender from the pack', () => {
    const roles = planDialogueVoices('Man: Excuse me. Woman: Yes? Man: Thanks.', english)
    expect(roles?.map(turn => turn.voice)).toEqual(['bm_george', 'bf_emma', 'bm_george'])
    const names = planDialogueVoices('Tom: Hi Katie!\nKatie: Hi Tom.\nDad: Dinner!', english)
    expect(names?.map(turn => turn.voice)).toEqual(['bm_george', 'bf_emma', 'bm_fable'])
    const women = planDialogueVoices('Anna: Hello. Mum: Hi. Anna: Bye.', english)
    expect(women?.map(turn => turn.voice)).toEqual(['bf_emma', 'bf_isabella', 'bf_emma'])
  })

  it('never falls back to a German voice for an English pack', () => {
    const plan = planDialogueVoices('Assistant: Can I help? Man: Yes, please.', english)
    expect(plan?.every(turn => turn.voice.startsWith('b'))).toBe(true)
    expect(fallbackVoiceFor('bf_isabella', new Set(['bf_emma', 'martin']), english)).toBe('bf_emma')
    expect(fallbackVoiceFor('bm_fable', new Set(['martin']), english)).toBe('bm_fable')
  })

  it('voices a labelled English monologue by its speaker and drops the label', () => {
    expect(planMonologue('Paul: Hi Jenny, it is Paul.', english)).toEqual({
      voice: 'bm_george',
      text: 'Hi Jenny, it is Paul.',
    })
    expect(planMonologue('Hello everyone, and welcome.', english)).toEqual({
      voice: 'bf_emma',
      text: 'Hello everyone, and welcome.',
    })
  })

  it('leaves German and English seed labels untouched by the Polish letters', () => {
    // The label pattern only gained Polish letters, so seeds without them plan as before.
    for (const pack of [goetheDeA2, goetheDeA1, cambridgeEnA2]) {
      for (const text of transcripts(pack)) expect(text).not.toMatch(/[ĄĆĘŁŃŚŹŻąćęłńśźż]/)
    }
  })

  it('parses Polish labels with diacritics and voices them by gender', () => {
    const plan = planDialogueVoices(
      'Łucja: Dzień dobry! Pan Żółkowski: Dzień dobry, pani Łucjo. Łucja: Do widzenia.',
      polish
    )
    expect(plan?.map(turn => turn.speaker)).toEqual(['Łucja', 'Pan Żółkowski', 'Łucja'])
    expect(plan?.map(turn => turn.voice)).toEqual(['pl_gosia', 'pl_darkman', 'pl_gosia'])
  })

  it('infers Polish genders from titles, roles and names', () => {
    const voices = (text: string) => planDialogueVoices(text, polish)?.map(turn => turn.gender)
    expect(voices('Kobieta: Tak? Mężczyzna: Nie.')).toEqual(['female', 'male'])
    expect(voices('Sprzedawczyni: Słucham. Klient: Poproszę chleb.')).toEqual(['female', 'male'])
    expect(voices('Kelnerka: Proszę. Kolega: Dziękuję.')).toEqual(['female', 'male'])
    expect(voices('Kuba: Cześć! Ewa: Cześć! Pani Nowak: Dzień dobry.')).toEqual(['male', 'female', 'female'])
    expect(voices('Tata: Obiad! Agata: Już idę.')).toEqual(['male', 'female'])
  })

  it('gives two Polish men different voices and never a German voice', () => {
    const plan = planDialogueVoices('Piotr: Cześć. Marek: Hej. Anna: Witajcie.', polish)
    expect(plan?.map(turn => turn.voice)).toEqual(['pl_darkman', 'pl_bass', 'pl_gosia'])
    expect(fallbackVoiceFor('pl_bass', new Set(['pl_darkman', 'martin']), polish)).toBe('pl_darkman')
  })

  it('voices a labelled Polish monologue by its speaker and drops the label', () => {
    expect(planMonologue('Łukasz: Cześć, tu Łukasz.', polish)).toEqual({
      voice: 'pl_darkman',
      text: 'Cześć, tu Łukasz.',
    })
    expect(planMonologue('Uwaga, pociąg odjedzie z peronu drugiego.', polish)).toEqual({
      voice: 'pl_gosia',
      text: 'Uwaga, pociąg odjedzie z peronu drugiego.',
    })
  })

  it('keys English plans by their voices', () => {
    expect(dialogueAudioPlanKey('Paul: Hi Jenny.', english)).toBe('mono:bm_george|Hi Jenny.')
  })

  it('parses Spanish labels with accents and ñ only for a Spanish pack', () => {
    const text = 'Señora López: Buenos días. Álvaro: Hola, señora. José Luis: ¿Qué tal?'
    const plan = planDialogueVoices(text, spanish)
    expect(plan?.map(turn => turn.speaker)).toEqual(['Señora López', 'Álvaro', 'José Luis'])
    // The other languages keep their own letter classes, so their plans cannot change.
    expect(planDialogueVoices(text, english)?.map(turn => turn.speaker)).not.toContain('Señora López')
  })

  it('reads a Spanish label only at the start of a line or a sentence', () => {
    const plan = planDialogueVoices('Hombre: Mira: aquí hay dos. Mujer: Vale.\nLocutora: Atención: el tren sale.', spanish)
    expect(plan?.map(turn => turn.speaker)).toEqual(['Hombre', 'Mujer', 'Locutora'])
    expect(plan?.[0]?.text).toBe('Mira: aquí hay dos.')
  })

  it('infers Spanish genders from titles, roles and names', () => {
    const genders = (text: string) => planDialogueVoices(text, spanish)?.map(turn => turn.gender)
    expect(genders('Mujer: ¿Sí? Hombre: No.')).toEqual(['female', 'male'])
    expect(genders('Dependienta: Dígame. Cliente: Quería pan.')).toEqual(['female', 'male'])
    expect(genders('Camarero: ¿Qué desean? Clienta: Un café.')).toEqual(['male', 'female'])
    expect(genders('Señor García: Hola. Doña Pilar: Buenas.')).toEqual(['male', 'female'])
    expect(genders('Lucía: ¡Hola! Javier: ¿Qué tal? Locutora: Atención.')).toEqual(['female', 'male', 'female'])
    expect(genders('Médica: Siéntese. Farmacéutico: Aquí tiene.')).toEqual(['female', 'male'])
    expect(genders('Policía: Buenas. Consuelo: Hola.')).toEqual(['unknown', 'female'])
  })

  it('shares the one Spanish female voice and alternates the two male voices', () => {
    const plan = planDialogueVoices('Elena: Hola. Olga: Hola. Pablo: Buenas. Manuel: Adiós.', spanish)
    expect(plan?.map(turn => turn.voice)).toEqual(['ef_dora', 'ef_dora', 'em_alex', 'em_santa'])
    expect(fallbackVoiceFor('em_santa', new Set(['em_alex', 'martin']), spanish)).toBe('em_alex')
  })

  it('voices a labelled Spanish monologue by its speaker and drops the label', () => {
    expect(planMonologue('Locutor: Información de tráfico.', spanish)).toEqual({
      voice: 'em_alex',
      text: 'Información de tráfico.',
    })
    expect(planMonologue('Atención, señores pasajeros.', spanish)).toEqual({
      voice: 'ef_dora',
      text: 'Atención, señores pasajeros.',
    })
  })

  it('gives every DELE seed dialogue two voices from the Spanish pack', () => {
    const ids = new Set(deleEsA2.speech.voices.map(voice => voice.id))
    for (const text of transcripts(deleEsA2)) {
      const plan = planDialogueVoices(text, spanish)
      if (!plan) continue
      expect(plan.every(turn => ids.has(turn.voice) && turn.gender !== 'unknown')).toBe(true)
    }
  })

  it('keeps the Polish plans of the Polish seeds', () => {
    const polishPack = { lang: 'pl', voices: certpolPlA2.speech.voices }
    for (const text of transcripts(certpolPlA2)) {
      expect(dialogueAudioPlanKey(text, polishPack)).toBe(dialogueAudioPlanKey(text, polish))
    }
  })
})
