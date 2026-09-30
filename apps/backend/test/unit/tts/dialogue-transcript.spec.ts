import { goetheDeA1, goetheDeA2, cambridgeEnA2 } from '@exam-one/exam-packs'
import {
  dialogueAudioPlanKey,
  fallbackVoiceFor,
  planDialogueVoices,
  planMonologue,
} from '../../../src/speech/tts/dialogueTranscript'

const english = { lang: 'en', voices: cambridgeEnA2.speech.voices }

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

  it('keys English plans by their voices', () => {
    expect(dialogueAudioPlanKey('Paul: Hi Jenny.', english)).toBe('mono:bm_george|Hi Jenny.')
  })
})
