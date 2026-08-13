import type { Difficulty } from '~/utils/types'

export const writingTipsC1Teil1 = [
  'Beginnen Sie mit 2–3 Sätzen Kontext und einer Leitfrage; benennen Sie Ihre Ausgangsposition nuanciert.',
  'Bearbeiten Sie die vier Inhaltspunkte je in einem Absatz nach dem Muster: Themensatz – Begründung – Beispiel – Mini-Fazit.',
  'Wägen Sie Pro und Contra ab und nutzen Sie Konnektoren wie „einerseits … andererseits“, „außerdem“, „jedoch“, „folglich“, „daher“.',
  'Verwenden Sie präzisen Wortschatz; erklären Sie Fachbegriffe kurz und bleiben Sie durchgängig sachlich (keine Umgangssprache).',
  'Sichern Sie Kohärenz durch Rückbezüge und Verknüpfungen; schließen Sie mit einer Empfehlung/Alternative und prüfen Sie die Wortzahl.',
]

export const writingTipsC1Teil2 = [
  'Betreff (falls vorgesehen), passende Anrede und ein klarer Eröffnungssatz mit Anlass und Ziel; konsequent in der Sie-Form schreiben.',
  'Höflichkeit und Verständnis zeigen; Bitten im Konjunktiv formulieren („wäre es möglich …“, „könnten Sie …“).',
  'Missverständnisse und Bedingungen präzise klären (Daten, Fristen, Zuständigkeiten) und neutral formulieren.',
  'Jeden Inhaltspunkt in einem kurzen Absatz strukturieren; konkrete, beantwortbare Fragen stellen.',
  'Mit einem umsetzbaren Vorschlag/Kompromiss und einer höflichen Bitte um Rückmeldung bis zu einem realistischen Termin schließen; passende Grußformel und Name.',
]

export const writingTipsA2Teil1 = [
  'Behandeln Sie genau die drei vorgegebenen Inhaltspunkte und bleiben Sie dabei im Rahmen von 20–30 Wörtern.',
  'Schreiben Sie durchgehend in der du-Form und beginnen Sie mit einer lockeren Anrede wie „Hallo Lisa“ oder „Hi Tom“.',
  'Schließen Sie kurz und freundlich ab, zum Beispiel mit „Bis bald“ oder „LG“; Ihren Namen dürfen Sie anhängen, müssen es aber nicht.',
  'Lassen Sie ruhig das Subjektpronomen am Satzanfang weg („Bin schon unterwegs“, „Habe leider keine Zeit“), denn das klingt in einer SMS natürlich.',
  'Setzen Sie ein bis zwei passende Emojis ein, um die Stimmung Ihrer Nachricht (Freude, Entschuldigung, Eile) zu unterstreichen.',
]

export const writingTipsA2Teil2 = [
  'Beginnen Sie mit einer (halb-)formellen Anrede wie „Sehr geehrte Frau Berger“ oder „Lieber Herr Klein“ und siezen Sie durchgehend.',
  'Decken Sie alle drei Inhaltspunkte ab und halten Sie sich an den Umfang von 30–40 Wörtern.',
  'Verbinden Sie Ihre Sätze mit Konnektoren wie „und“, „aber“, „denn“ oder „weil“, statt kurze Hauptsätze aneinanderzureihen.',
  'Formulieren Sie vollständige, grammatisch korrekte Sätze und bleiben Sie höflich, etwa mit „könnten Sie“ oder „ich würde gern“.',
  'Schließen Sie mit einer Grußformel wie „Mit freundlichen Grüßen“ ab und setzen Sie darunter Ihren vollständigen Vor- und Nachnamen.',
]

/**
 * Resolve the writing tips for a given exam level and Teil.
 * Falls back to Teil 2 tips when no part is provided.
 */
export function getWritingTips(difficulty: Difficulty, testingPart?: 1 | 2): string[] {
  if (difficulty === 'A2') {
    return testingPart === 1 ? writingTipsA2Teil1 : writingTipsA2Teil2
  }
  return testingPart === 1 ? writingTipsC1Teil1 : writingTipsC1Teil2
}
