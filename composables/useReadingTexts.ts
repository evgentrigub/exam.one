/**
 * Reading Texts Composable
 * Manages reading texts in localStorage with CRUD operations
 * Integrates with existing germanTexts and supports AI generation
 */

import { defaultReadingTopics } from '~/data/reading/exerciseReading'
import type { GermanText } from '~/utils/types'

const STORAGE_KEY = 'exame-one-reading-texts'

// Shared state (singleton pattern)
const texts = ref<GermanText[]>([])
const isInitialized = ref(false)

export const useReadingTexts = () => {
  /**
   * Initialize texts from localStorage or seed with defaults
   */
  const initializeTexts = () => {
    // Skip if already initialized or on server
    if (isInitialized.value || import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      
      if (stored) {
        const storedTexts = JSON.parse(stored)
        // Merge stored texts with defaults, avoiding duplicates
        const defaultIds = new Set(defaultReadingTopics.map(t => t.id))
        const uniqueStoredTexts = storedTexts.filter((t: GermanText) => !defaultIds.has(t.id))
        texts.value = [...defaultReadingTopics, ...uniqueStoredTexts]
      } else {
        // First time: seed with default texts
        texts.value = [...defaultReadingTopics]
        saveToStorage()
      }
      
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load reading texts from localStorage:', error)
      // Fallback to default texts
      texts.value = [...defaultReadingTopics]
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
      const defaultIds = new Set(defaultReadingTopics.map(t => t.id))
      const textsToSave = texts.value.filter(t => !defaultIds.has(t.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(textsToSave))
    } catch (error) {
      console.error('Failed to save reading texts to localStorage:', error)
    }
  }

  /**
   * Get all texts
   */
  const getTexts = (): GermanText[] => {
    return texts.value
  }

  /**
   * Get text by ID
   */
  const getTextById = (id: string): GermanText | undefined => {
    return texts.value.find(text => text.id === id)
  }

  /**
   * Delete text by ID
   */
  const deleteText = (id: string): boolean => {
    // Prevent deletion of default texts
    const isDefaultText = defaultReadingTopics.some(t => t.id === id)
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
  const addText = (text: GermanText): void => {
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
  const addTexts = (newTexts: GermanText[]): void => {
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
    texts.value = [...defaultReadingTopics]
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Get texts count
   */
  const getTextsCount = (): number => {
    return texts.value.length
  }

  // Initialize immediately if on client and not initialized
  if (import.meta.client && !isInitialized.value) {
    initializeTexts()
  }

  return {
    // State
    texts: readonly(texts),
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
