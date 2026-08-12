/**
 * Reading Texts Composable
 * Manages reading texts in localStorage with CRUD operations
 * Integrates with existing germanTexts and supports AI generation
 */

import { allDefaultReadingTopics } from '~/data/reading/exerciseReading'
import type { ReadingExercise } from '~/utils/exercises/reading'

const STORAGE_KEY = 'exam-one:reading:texts'
const LEGACY_STORAGE_KEY = 'exame-one-reading-texts'

// Shared state (singleton pattern)
const texts = ref<ReadingExercise[]>([])
const isInitialized = ref(false)

export const useReadingTexts = () => {
  /**
   * Initialize texts from localStorage or seed with defaults
   */
  const initializeTexts = () => {
    // Skip if already initialized or on server
    if (isInitialized.value || import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      
      if (stored) {
        const storedTexts = JSON.parse(stored)
        // Merge stored texts with defaults, avoiding duplicates
        const defaultIds = new Set(allDefaultReadingTopics.map(t => t.id))
        const uniqueStoredTexts = storedTexts.filter((t: ReadingExercise) => !defaultIds.has(t.id))
        texts.value = [...allDefaultReadingTopics, ...uniqueStoredTexts]
      } else {
        // First time: seed with default texts
        texts.value = [...allDefaultReadingTopics]
        saveToStorage()
      }
      
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load reading texts from localStorage:', error)
      // Fallback to default texts
      texts.value = [...allDefaultReadingTopics]
      isInitialized.value = true
    }
  }

  /**
   * Save texts to localStorage
   */
  const saveToStorage = () => {
    if (import.meta.server) return

    try {
      // Only save non-default texts to localStorage
      const defaultIds = new Set(allDefaultReadingTopics.map(t => t.id))
      const textsToSave = texts.value.filter(t => !defaultIds.has(t.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(textsToSave))
    } catch (error) {
      console.error('Failed to save reading texts to localStorage:', error)
    }
  }

  /**
   * Get all texts
   */
  const getTexts = (): ReadingExercise[] => {
    return texts.value.filter(text => !text.examOnly)
  }

  /**
   * Get text by ID
   */
  const getTextById = (id: string): ReadingExercise | undefined => {
    return texts.value.find(text => text.id === id)
  }

  /**
   * Delete text by ID
   */
  const deleteText = (id: string): boolean => {
    // Prevent deletion of default texts
    const isDefaultText = allDefaultReadingTopics.some(t => t.id === id)
    if (isDefaultText) {
      console.warn('Cannot delete default text')
      return false
    }

    const index = texts.value.findIndex(text => text.id === id)
    
    if (index === -1) {
      console.warn(`Text with id ${id} not found`)
      return false
    }

    texts.value.splice(index, 1)
    saveToStorage()
    return true
  }

  /**
   * Add new text (for AI generation)
   */
  const addText = (text: ReadingExercise): void => {
    // Check for duplicate ID
    const exists = texts.value.some(t => t.id === text.id)
    
    if (exists) {
      console.warn(`Text with id ${text.id} already exists`)
      return
    }

    texts.value.push(text)
    saveToStorage()
  }

  /**
   * Add multiple texts at once
   */
  const addTexts = (newTexts: ReadingExercise[]): void => {
    console.log(`📥 Attempting to add ${newTexts.length} reading texts:`, newTexts.map(t => ({ id: t.id, title: t.title, difficulty: t.difficulty })))
    
    const uniqueTexts = newTexts.filter(
      newText => !texts.value.some(t => t.id === newText.id)
    )

    if (uniqueTexts.length < newTexts.length) {
      console.warn(`⚠️ Skipped ${newTexts.length - uniqueTexts.length} duplicate text(s)`)
    }

    texts.value.push(...uniqueTexts)
    saveToStorage()
    
    console.log(`✅ Successfully saved ${uniqueTexts.length} new reading text(s). Total texts: ${texts.value.length}`)
  }

  /**
   * Reset to default texts (useful for testing or reset feature)
   */
  const resetToDefaults = (): void => {
    texts.value = [...allDefaultReadingTopics]
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Get texts count
   */
  const getTextsCount = (): number => {
    return getTexts().length
  }

  // Initialize immediately if on client and not initialized
  if (import.meta.client && !isInitialized.value) {
    initializeTexts()
  }

  return {
    // State
    texts: computed(() => texts.value.filter(text => !text.examOnly)),
    isInitialized: readonly(isInitialized),

    // Methods
    getTexts,
    getTextById,
    deleteText,
    addText,
    addTexts,
    resetToDefaults,
    getTextsCount
  }
}
