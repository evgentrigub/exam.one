/** Synthetic acceptance fixture. This is not an official exam and is not registered in production. */
import { definePrompt } from '../assemble'
import { formatAdapter, type PartRuntime } from '../runtime'
import type { ExamPack, ExamPart, ItemFormat, SkillId } from '../types'

const rubric = [{ id: 'content', label: 'Content', maxPoints: 2.5 }, { id: 'clarity', label: 'Clarity', maxPoints: 1 }]
const config: Array<{ skill: SkillId; n: number; format: ItemFormat; rules: PartRuntime }> = [
  { skill: 'reading', n: 7, format: 'selection', rules: { minutes: 4, maxPoints: 3, questionCount: 2, optionCount: 4 } },
  { skill: 'reading', n: 9, format: 'matching', rules: { minutes: 3, maxPoints: 2, questionCount: 2, optionCount: 3, reuseOptions: false } },
  { skill: 'reading', n: 17, format: 'gap-fill', rules: { minutes: 3, maxPoints: 2, questionCount: 2 } },
  { skill: 'listening', n: 11, format: 'true-false', rules: { minutes: 2, maxPoints: 2, questionCount: 2, optionCount: 2, replays: 1 } },
  { skill: 'writing', n: 13, format: 'freeform', rules: { minutes: 5, maxPoints: 3.5, fields: [{ id: 'message', label: 'Message', minWords: 5, maxWords: 20, zeroBelowWords: 3 }], criteria: rubric } },
  { skill: 'speaking', n: 15, format: 'recording', rules: { minutes: 2, maxPoints: 3.5, segments: [{ id: 'intro', label: 'Introduction' }], criteria: rubric } },
]
export const syntheticPayloads: Record<number, Record<string, unknown>> = {
  7: { title: 'Synthetic selection', text: 'A train leaves at noon.', questions: [{ id: 'a', text: 'When?', options: ['Noon', 'Morning', 'Evening', 'Night'], correctAnswer: 0 }, { id: 'b', text: 'What leaves?', options: ['A bus', 'A train', 'A boat', 'A car'], correctAnswer: 1 }] },
  9: { title: 'Synthetic matching', text: 'Match the destinations.', questions: [{ id: 'a', text: 'Read books', options: ['Library', 'Pool', 'Cafe'], correctAnswer: 0 }, { id: 'b', text: 'Swim', options: ['Library', 'Pool', 'Cafe'], correctAnswer: 1 }] },
  17: { title: 'Synthetic gap fill', text: 'I live (1) ____ a small town. I go to work (2) ____ bus.', questions: [{ id: 'a', text: 'Gap 1', accepted: ['in'] }, { id: 'b', text: 'Gap 2', accepted: ['by'] }] },
  11: { title: 'Synthetic listening', text: 'Listen to the announcement.', transcript: 'The shop is open today.', questions: [{ id: 'a', text: 'The shop is open.', correctAnswer: 0 }, { id: 'b', text: 'The shop is closed.', correctAnswer: 1 }] },
  13: { title: 'Synthetic writing', text: 'Write a short invitation.', fields: { message: 'Invite a friend to lunch.' } },
  15: { title: 'Synthetic speaking', text: 'Introduce yourself.', segments: { intro: 'Say your name and one thing you enjoy.' } },
}
export const syntheticEnglishA1: ExamPack = {
  packId: 'synthetic-en-a1', board: 'synthetic', language: 'en', cefr: 'A1', title: 'Synthetic English A1 · test only', live: true, examIds: ['synthetic-en-a1'],
  structure: (['reading', 'listening', 'writing', 'speaking'] as SkillId[]).map(skill => ({
    id: skill, label: skill, minutes: config.filter(c => c.skill === skill).reduce((sum, c) => sum + c.rules.minutes, 0), points: config.filter(c => c.skill === skill).reduce((sum, c) => sum + c.rules.maxPoints, 0), summary: 'Synthetic acceptance fixture', scoringNote: 'Test scoring only',
    parts: config.filter(c => c.skill === skill).map((c): ExamPart => ({ n: c.n, title: c.format, format: c.format, short: c.format, goal: 'Exercise the runtime', skill, itemFormat: c.format, runtime: c.rules, adapter: formatAdapter(c.format, c.rules) })),
  })),
  prompts: config.flatMap(c => (c.format === 'freeform' || c.format === 'recording' ? ['generator', 'answer', 'review'] as const : ['generator'] as const).map(kind => definePrompt({
    skill: c.skill, part: c.n, kind, role: 'You write synthetic test exercises.', task: kind === 'generator' ? 'Return {count} exercise(s).' : 'Task: {task}. Response: {userContent}.', rules: ['This is a synthetic fixture, not an official exam.'],
    outputContract: kind === 'generator' ? JSON.stringify([syntheticPayloads[c.n]]) : kind === 'review' ? JSON.stringify({ totalPoints: 3.5, maxPoints: 3.5, criteria: rubric.map(r => ({ ...r, points: r.maxPoints, comment: 'Clear response' })), summary: 'Good response', strengths: [], improvements: [] }) : 'Return a short model response.',
  }))),
  speech: { ttsLang: 'en', sttLang: 'en', voices: [], audioPathPrefix: '/audio/listening/synthetic-en-a1' },
}
