import type { WritingExercise } from '@exam-one/exam-content'
import type { LanguageOptions } from '~/utils/types'
import { readingA2Parts } from '~/data/reading/a2/exerciseGeneratorReadingA2'
import { listeningA2Parts } from '~/data/listening/a2/exerciseGeneratorListeningA2'
import {
  generateTopicsA2Part1,
  generateTopicsA2Part2,
} from '~/data/writing/a2/exerciseGeneratorWritingA2'
import {
  generateModelAnswerA2Part1,
  generateModelAnswerA2Part2,
} from '~/data/writing/a2/answerGeneratorWritingA2'
import { reviewPromptA2Teil1, reviewPromptA2Teil2 } from '~/data/writing/a2/reviewWritingA2'
import { speakingA2Parts } from '~/data/speaking/a2/exerciseGeneratorSpeakingA2'
import {
  generateModelAnswerSpeakingA2Teil1,
  generateModelAnswerSpeakingA2Teil2,
} from '~/data/speaking/a2/answerGeneratorSpeakingA2'
import {
  reviewPromptSpeakingA2Teil1,
  reviewPromptSpeakingA2Teil2,
} from '~/data/speaking/a2/reviewSpeakingA2'
import type { SpeakingTopicA2Teil1, SpeakingTopicA2Teil2 } from '~/utils/exercises/speaking'

export type PromptSkillId = 'reading' | 'writing' | 'listening' | 'speaking'
export type PromptKindId = 'generator' | 'answer' | 'review'

export interface PromptSlotKey {
  skill: PromptSkillId
  level: 'A2'
  part: number
  kind: PromptKindId
}

export const PROMPT_SKILLS: PromptSkillId[] = ['reading', 'writing', 'listening', 'speaking']

export const PROMPT_MATRIX: Record<PromptSkillId, { parts: number[]; kinds: PromptKindId[] }> = {
  reading: { parts: [1, 2, 3, 4], kinds: ['generator'] },
  listening: { parts: [1, 2, 3, 4], kinds: ['generator'] },
  writing: { parts: [1, 2], kinds: ['generator', 'answer', 'review'] },
  speaking: { parts: [1, 2], kinds: ['generator', 'answer', 'review'] },
}

const SENTINEL_OUTPUT = '{{outputLanguage}}' as LanguageOptions

const SENTINEL_WRITING: WritingExercise = {
  id: '{{topicId}}',
  title: '',
  topicType: 'note',
  difficulty: 'A2',
  testingPart: 1,
  estimatedTime: 0,
  wordCount: { min: 0, max: 0 },
  category: [],
  createdAt: '',
  description: '',
  task: '{{task}}',
  requirements: ['{{requirements}}'],
}

const SENTINEL_SPEAKING_TEIL1: SpeakingTopicA2Teil1 = {
  id: '{{topicId}}',
  difficulty: 'A2',
  createdAt: '',
  testingPart: 1,
  topicType: 'interview',
  theme: '{{theme}}',
  answerQuestions: ['{{answerQuestions}}', '—', '—', '—'],
  askQuestions: ['{{askQuestions}}', '—', '—', '—'],
}

const SENTINEL_SPEAKING_TEIL2: SpeakingTopicA2Teil2 = {
  id: '{{topicId}}',
  difficulty: 'A2',
  createdAt: '',
  testingPart: 2,
  topicType: 'monologue',
  theme: '{{theme}}',
  keywords: ['{{keywords}}', '—', '—', '—'],
}

export function isValidPromptSlot(slot: PromptSlotKey): boolean {
  if (slot.level !== 'A2') return false
  const spec = PROMPT_MATRIX[slot.skill]
  return spec.parts.includes(slot.part) && spec.kinds.includes(slot.kind)
}

export function clampPromptSlot(skill: PromptSkillId, part: number, kind: PromptKindId): PromptSlotKey {
  const spec = PROMPT_MATRIX[skill]
  return {
    skill,
    level: 'A2',
    part: spec.parts.includes(part) ? part : spec.parts[0]!,
    kind: spec.kinds.includes(kind) ? kind : spec.kinds[0]!,
  }
}

function generatorDefault(skill: PromptSkillId, part: number, count: number): string {
  if (skill === 'reading') {
    return readingA2Parts(count).find(item => item.part === part)?.prompt ?? ''
  }
  if (skill === 'listening') {
    return listeningA2Parts(count).find(item => item.part === part)?.prompt ?? ''
  }
  if (skill === 'speaking') {
    return speakingA2Parts(count).find(item => item.part === part)?.prompt ?? ''
  }
  return part === 1 ? generateTopicsA2Part1(count) : generateTopicsA2Part2(count)
}

export function defaultPromptBody(slot: PromptSlotKey, count = 1): string {
  if (!isValidPromptSlot(slot)) return ''

  if (slot.kind === 'generator') {
    return generatorDefault(slot.skill, slot.part, count)
  }

  if (slot.kind === 'answer') {
    if (slot.skill === 'writing') {
      return slot.part === 1
        ? generateModelAnswerA2Part1('{{task}}', '{{topicId}}')
        : generateModelAnswerA2Part2('{{task}}', '{{topicId}}')
    }
    if (slot.skill === 'speaking') {
      return slot.part === 1
        ? generateModelAnswerSpeakingA2Teil1('{{task}}', '{{topicId}}')
        : generateModelAnswerSpeakingA2Teil2('{{task}}', '{{topicId}}')
    }
    return ''
  }

  if (slot.skill === 'writing') {
    const topic: WritingExercise = {
      ...SENTINEL_WRITING,
      testingPart: slot.part === 2 ? 2 : 1,
    }
    return slot.part === 1
      ? reviewPromptA2Teil1(topic, '{{userContent}}', SENTINEL_OUTPUT)
      : reviewPromptA2Teil2(topic, '{{userContent}}', SENTINEL_OUTPUT)
  }

  if (slot.skill === 'speaking') {
    return slot.part === 1
      ? reviewPromptSpeakingA2Teil1(
          SENTINEL_SPEAKING_TEIL1,
          '{{answers}}',
          '{{questions}}',
          SENTINEL_OUTPUT
        )
      : reviewPromptSpeakingA2Teil2(SENTINEL_SPEAKING_TEIL2, '{{monologue}}', SENTINEL_OUTPUT)
  }

  return ''
}
