/**
 * useModelAnswer composable
 * Manages generation and storage of AI model answers for writing topics.
 * 
 * Storage: localStorage under key `model-answers`
 */

import type { WritingTopic } from '~/utils/types'
import type { ModelAnswer } from '~/data/writing/modelAnswers'
import { ref } from 'vue'
import { generateModelAnswerC1Part1, generateModelAnswerC1Part2 } from '~/data/writing/modelAnswerGeneratorPrompt'
import { generateUUID } from '~/utils/uuid'

type GenerationStatus = 'idle' | 'pending' | 'ready' | 'error'

interface ModelAnswerRecord {
  topicId: string
  status: GenerationStatus
  prompt: string
  requestedAt: string
  completedAt?: string
  modelAnswer?: ModelAnswer
  error?: string
}

const MODEL_ANSWER_KEY = 'model-answers'

// Global reactive tick to notify UI of updates
const modelAnswerVersion = ref(0)

function readAllModelAnswers(): Record<string, ModelAnswerRecord> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(MODEL_ANSWER_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ModelAnswerRecord>) : {}
  } catch {
    return {}
  }
}

function writeAllModelAnswers(map: Record<string, ModelAnswerRecord>): void {
  if (!import.meta.client) return
  localStorage.setItem(MODEL_ANSWER_KEY, JSON.stringify(map))
  modelAnswerVersion.value++
}

function saveRecord(record: ModelAnswerRecord): void {
  const all = readAllModelAnswers()
  all[record.topicId] = record
  writeAllModelAnswers(all)
}

function getRecord(topicId: string): ModelAnswerRecord | null {
  const all = readAllModelAnswers()
  return all[topicId] || null
}

export function useModelAnswer() {
  function getModelAnswer(topicId: string): ModelAnswer | null {
    const record = getRecord(topicId)
    return record?.modelAnswer || null
  }

  function isGenerating(topicId: string): boolean {
    return getRecord(topicId)?.status === 'pending'
  }

  function hasModelAnswer(topicId: string): boolean {
    const rec = getRecord(topicId)
    return rec?.status === 'ready' && !!rec?.modelAnswer
  }

  function clearModelAnswer(topicId: string): void {
    const all = readAllModelAnswers()
    const { [topicId]: _removed, ...rest } = all
    writeAllModelAnswers(rest)
  }

  function getGenerationPrompt(topic: WritingTopic): string {
    if (topic.testingPart === 1) {
      return generateModelAnswerC1Part1(topic.task, topic.id)
    } else {
      return generateModelAnswerC1Part2(topic.task, topic.id)
    }
  }

  /**
   * Request generation of a model answer for the given topic.
   * Uses OpenAI API if available, otherwise returns error.
   */
  async function generateModelAnswer(topic: WritingTopic): Promise<void> {
    const prompt = getGenerationPrompt(topic)
    
    saveRecord({
      topicId: topic.id,
      status: 'pending',
      prompt,
      requestedAt: new Date().toISOString(),
    })

    try {
      const result: { text: string; data?: Partial<ModelAnswer> | null } = await $fetch(
        '/api/generate-model-answer',
        { method: 'POST', body: { topic, prompt } }
      )
      
      const current = getRecord(topic.id)
      if (current) {
        // Try to get data from result.data or parse from result.text
        let parsedData: Partial<ModelAnswer> | null = result.data || null
        
        if (!parsedData && result.text) {
          console.log('📄 Parsing model answer from text field...')
          parsedData = JSON.parse(result.text)
        }
        
        if (parsedData) {
          // Generate UUID for the model answer
          const modelAnswer: ModelAnswer = {
            id: generateUUID(),
            topicId: topic.id,
            content: parsedData.content || '',
            wordCount: parsedData.wordCount || 0,
            highlights: parsedData.highlights || {},
          }
          
          const update: ModelAnswerRecord = {
            ...current,
            status: 'ready',
            completedAt: new Date().toISOString(),
            modelAnswer,
          }
          
          saveRecord(update)
        } else {
          console.error('❌ Failed to parse model answer from response', { result })
          saveRecord({ 
            ...current, 
            status: 'error', 
            completedAt: new Date().toISOString(), 
            error: 'Failed to parse model answer from response' 
          })
          console.log('⚠️ Status set to error, version:', modelAnswerVersion.value)
        }
      }
    } catch (error) {
      console.error('❌ Error during model answer generation:', error)
      const current = getRecord(topic.id)
      if (current) {
        saveRecord({ 
          ...current, 
          status: 'error', 
          completedAt: new Date().toISOString(), 
          error: String(error) 
        })
        console.log('⚠️ Status set to error (catch), version:', modelAnswerVersion.value)
      }
    }
  }

  return {
    // queries
    getModelAnswer,
    isGenerating,
    hasModelAnswer,
    modelAnswerVersion,
    // commands
    generateModelAnswer,
    clearModelAnswer,
  }
}

