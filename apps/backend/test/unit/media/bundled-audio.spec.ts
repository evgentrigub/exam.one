import {
  bundledAudioDir,
  bundledAudioSegments,
  getPack,
  listeningDisplayTitle,
  listeningPartLabel,
  listPacks,
} from '@exam-one/exam-packs'

describe('bundled listening audio helpers', () => {
  it('lists every bundled seed WAV once, inside its pack folder', () => {
    for (const pack of listPacks()) {
      const segments = bundledAudioSegments(pack)
      expect(new Set(segments.map(segment => segment.url)).size).toBe(segments.length)
      for (const segment of segments) {
        expect(segment.path.startsWith(`${bundledAudioDir(pack)}/`)).toBe(true)
        expect(segment.transcript.trim()).not.toBe('')
      }
    }
    expect(bundledAudioSegments(getPack('cambridge-en-a2')!).length).toBeGreaterThan(0)
    expect(bundledAudioSegments(getPack('goethe-de-c1')!)).toEqual([])
  })

  it('names parts in the pack language', () => {
    expect(listeningPartLabel(getPack('goethe-de-a2')!, 2)).toBe('Teil 2')
    expect(listeningPartLabel(getPack('cambridge-en-a2')!, 3)).toBe('Part 3')
    expect(listeningPartLabel(getPack('certpol-pl-a2')!, 1)).toBe('Część 1')
    expect(listeningPartLabel(getPack('dele-es-a2')!, 4)).toBe('Tarea 4')
    expect(listeningPartLabel(getPack('dele-es-a2')!, undefined)).toBeNull()
  })

  it('drops the part label from a title, keeping any lead-in', () => {
    expect(listeningDisplayTitle('Part 1: Short conversations', 'id')).toBe('Short conversations')
    expect(listeningDisplayTitle('Mock Set 1 · Part 5: Weekend jobs', 'id')).toBe(
      'Mock Set 1 · Weekend jobs'
    )
    expect(listeningDisplayTitle('Zadanie III: Spotkanie', 'id')).toBe('Spotkanie')
    expect(listeningDisplayTitle('Partner talk', 'id')).toBe('Partner talk')
    expect(listeningDisplayTitle(undefined, 'fallback-id')).toBe('fallback-id')
  })
})
