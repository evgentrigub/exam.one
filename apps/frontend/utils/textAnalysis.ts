/**
 * Text Analysis Utility for German A2 Writing Evaluation
 * Provides basic analysis functions for writing feedback system (Stage 12)
 */

import type { WritingExercise, WritingFeedbackModel } from '~/utils/types'

type TranslateFn = (key: string, ...args: unknown[]) => string

export interface TextAnalysisResult {
  wordCount: number
  sentenceCount: number
  averageSentenceLength: number
  structureElements: StructureAnalysis
  vocabularyMetrics: VocabularyMetrics
  suggestions: string[]
}

export interface StructureAnalysis {
  hasGreeting: boolean
  hasClosing: boolean
  hasMainContent: boolean
  paragraphCount: number
  structureScore: number // 1-5 scale
}

export interface VocabularyMetrics {
  uniqueWords: number
  vocabularyDiversity: number // unique/total ratio
  commonConnectors: string[]
  formalityLevel: 'informal' | 'neutral' | 'formal'
}

/**
 * Analyzes German text for A2-level writing evaluation.
 * `t` localizes the learner-facing suggestions; German example phrases stay German.
 */
export function analyzeGermanText(
  content: string,
  topic: WritingExercise,
  t: TranslateFn
): TextAnalysisResult {
  const cleanContent = content.trim()

  // Basic metrics
  const wordCount = countWords(cleanContent)
  const sentences = splitIntoSentences(cleanContent)
  const sentenceCount = sentences.length
  const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0

  // Structure analysis
  const structureElements = analyzeStructure(cleanContent, topic)

  // Vocabulary analysis
  const vocabularyMetrics = analyzeVocabulary(cleanContent)

  // Generate suggestions
  const suggestions = generateSuggestions(
    cleanContent,
    topic,
    structureElements,
    vocabularyMetrics,
    wordCount,
    t
  )

  return {
    wordCount,
    sentenceCount,
    averageSentenceLength,
    structureElements,
    vocabularyMetrics,
    suggestions,
  }
}

/**
 * Creates WritingFeedback object for storage
 */
export function createWritingFeedback(
  analysisResult: TextAnalysisResult,
  topic: WritingExercise
): WritingFeedbackModel {
  const { wordCount, structureElements, suggestions } = analysisResult

  // Word count validation
  const wordCountValid = wordCount >= topic.wordCount.min && wordCount <= topic.wordCount.max

  // Calculate completeness score based on requirements fulfillment
  const completenessScore = calculateCompletenessScore(analysisResult, topic)

  // Overall score calculation (1-5 scale)
  const overallScore = Math.round(
    (structureElements.structureScore + completenessScore + (wordCountValid ? 5 : 2)) / 3
  )

  return {
    wordCountValid,
    structureScore: structureElements.structureScore,
    completenessScore,
    suggestions,
    overallScore: Math.max(1, Math.min(5, overallScore)),
  }
}

/**
 * Count words in German text (handles German-specific cases)
 */
function countWords(text: string): number {
  if (!text.trim()) return 0

  // Split by whitespace and filter empty strings
  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
  return words.length
}

/**
 * Split text into sentences (basic German sentence splitting)
 */
function splitIntoSentences(text: string): string[] {
  if (!text.trim()) return []

  // Split on sentence-ending punctuation
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  return sentences
}

/**
 * Analyze text structure based on writing type
 */
function analyzeStructure(content: string, topic: WritingExercise): StructureAnalysis {
  const lowerContent = content.toLowerCase()

  // Common German greetings and closings
  const greetings = [
    'hallo',
    'liebe',
    'lieber',
    'sehr geehrte',
    'sehr geehrter',
    'guten tag',
    'hi',
    'hey',
    'moin',
  ]

  const closings = [
    'viele grüße',
    'liebe grüße',
    'mit freundlichen grüßen',
    'bis bald',
    'tschüss',
    'auf wiedersehen',
    'herzliche grüße',
    'beste grüße',
  ]

  // Check for structural elements
  const hasGreeting = greetings.some(greeting => lowerContent.includes(greeting))
  const hasClosing = closings.some(closing => lowerContent.includes(closing))
  const hasMainContent = content.trim().length > 50 // Basic content check

  // Count paragraphs (simple line break counting)
  const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

  // Calculate structure score based on topic type
  let structureScore = 1

  // Base score for having content
  if (hasMainContent) structureScore += 1

  // Type-specific structure requirements
  switch (topic.topicType) {
    case 'email':
    case 'letter':
      if (hasGreeting) structureScore += 1
      if (hasClosing) structureScore += 1
      if (paragraphCount >= 2) structureScore += 1
      break

    case 'essay':
      if (paragraphCount >= 3) structureScore += 2
      else if (paragraphCount >= 2) structureScore += 1
      break

    case 'postcard':
    case 'note':
      // Less formal structure requirements
      if (hasGreeting || hasClosing) structureScore += 1
      if (hasMainContent) structureScore += 1
      break

    case 'form':
      // Application-specific structure
      if (hasGreeting) structureScore += 1
      if (hasClosing) structureScore += 1
      break
  }

  return {
    hasGreeting,
    hasClosing,
    hasMainContent,
    paragraphCount,
    structureScore: Math.min(5, structureScore),
  }
}

/**
 * Analyze vocabulary usage and diversity
 */
function analyzeVocabulary(content: string): VocabularyMetrics {
  const words = content
    .toLowerCase()
    .replace(/[^\w\säöüß]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2) // Filter short words

  const totalWords = words.length
  const uniqueWords = new Set(words).size
  const vocabularyDiversity = totalWords > 0 ? uniqueWords / totalWords : 0

  // Common German connectors for A2 level
  const a2Connectors = [
    'und',
    'aber',
    'oder',
    'weil',
    'dass',
    'wenn',
    'als',
    'seit',
    'außerdem',
    'deshalb',
    'trotzdem',
    'jedoch',
    'dann',
    'danach',
  ]

  const foundConnectors = a2Connectors.filter(
    connector =>
      content.toLowerCase().includes(` ${connector} `) ||
      content.toLowerCase().includes(`${connector} `)
  )

  // Determine formality level based on vocabulary
  const formalWords = ['sehr geehrte', 'mit freundlichen grüßen', 'hiermit', 'diesbezüglich']
  const informalWords = ['hallo', 'hi', 'tschüss', 'bis bald', 'cool', 'super']

  const formalCount = formalWords.filter(word => content.toLowerCase().includes(word)).length
  const informalCount = informalWords.filter(word => content.toLowerCase().includes(word)).length

  let formalityLevel: 'informal' | 'neutral' | 'formal' = 'neutral'
  if (formalCount > informalCount) formalityLevel = 'formal'
  else if (informalCount > formalCount) formalityLevel = 'informal'

  return {
    uniqueWords,
    vocabularyDiversity,
    commonConnectors: foundConnectors,
    formalityLevel,
  }
}

/**
 * Calculate completeness score based on topic requirements
 */
function calculateCompletenessScore(analysis: TextAnalysisResult, topic: WritingExercise): number {
  let score = 1

  // Word count compliance
  if (analysis.wordCount >= topic.wordCount.min && analysis.wordCount <= topic.wordCount.max) {
    score += 2
  } else if (analysis.wordCount >= topic.wordCount.min * 0.8) {
    score += 1
  }

  // Structure completeness
  if (analysis.structureElements.hasMainContent) score += 1

  // Topic-specific completeness
  switch (topic.topicType) {
    case 'email':
    case 'letter':
      if (analysis.structureElements.hasGreeting && analysis.structureElements.hasClosing) {
        score += 1
      }
      break

    case 'essay':
      if (analysis.structureElements.paragraphCount >= 3) {
        score += 1
      }
      break
  }

  return Math.min(5, score)
}

/**
 * Generate improvement suggestions based on analysis
 */
function generateSuggestions(
  content: string,
  topic: WritingExercise,
  structure: StructureAnalysis,
  vocabulary: VocabularyMetrics,
  wordCount: number,
  t: TranslateFn
): string[] {
  const suggestions: string[] = []

  // Word count suggestions
  if (wordCount < topic.wordCount.min) {
    const needed = topic.wordCount.min - wordCount
    suggestions.push(t('writing.analysis.wordsNeeded', { count: needed }, needed))
  } else if (wordCount > topic.wordCount.max) {
    const excess = wordCount - topic.wordCount.max
    suggestions.push(t('writing.analysis.wordsExcess', { count: excess }, excess))
  }

  // Structure suggestions
  if (!structure.hasGreeting && ['email', 'letter', 'form'].includes(topic.topicType)) {
    suggestions.push(
      t('writing.analysis.missingGreeting', {
        informal: 'Hallo',
        formal: 'Sehr geehrte Damen und Herren',
      })
    )
  }

  if (!structure.hasClosing && ['email', 'letter', 'form'].includes(topic.topicType)) {
    suggestions.push(
      t('writing.analysis.missingClosing', {
        informal: 'Viele Grüße',
        formal: 'Mit freundlichen Grüßen',
      })
    )
  }

  if (structure.paragraphCount < 2 && ['essay', 'letter', 'email'].includes(topic.topicType)) {
    suggestions.push(t('writing.analysis.moreParagraphs'))
  }

  // Vocabulary suggestions
  if (vocabulary.vocabularyDiversity < 0.6) {
    suggestions.push(t('writing.analysis.moreVariety'))
  }

  if (vocabulary.commonConnectors.length < 2) {
    suggestions.push(
      t('writing.analysis.moreConnectors', { examples: '"und", "aber", "weil", "außerdem"' })
    )
  }

  // Topic-specific suggestions
  switch (topic.topicType) {
    case 'email':
      if (vocabulary.formalityLevel === 'formal' && topic.category.includes('Persönlich')) {
        suggestions.push(t('writing.analysis.informalForPersonal'))
      }
      break

    case 'form':
      if (vocabulary.formalityLevel === 'informal') {
        suggestions.push(t('writing.analysis.formalForForms'))
      }
      break

    case 'essay':
      if (structure.paragraphCount < 3) {
        suggestions.push(t('writing.analysis.essayStructure'))
      }
      break
  }

  // Positive feedback
  if (suggestions.length === 0) {
    suggestions.push(t('writing.analysis.allRequirementsMet'))
  } else if (structure.structureScore >= 4) {
    suggestions.push(t('writing.analysis.goodStructure'))
  }

  return suggestions
}

/**
 * Format feedback for display
 */
export function formatFeedbackDisplay(
  feedback: WritingFeedbackModel,
  t: TranslateFn
): {
  title: string
  color: string
  icon: string
} {
  const score = feedback.overallScore

  if (score >= 4) {
    return {
      title: t('writing.analysis.ratingExcellent'),
      color: 'green',
      icon: '🌟',
    }
  } else if (score >= 3) {
    return {
      title: t('writing.analysis.ratingGood'),
      color: 'blue',
      icon: '👍',
    }
  } else if (score >= 2) {
    return {
      title: t('writing.analysis.ratingStart'),
      color: 'yellow',
      icon: '📝',
    }
  } else {
    return {
      title: t('writing.analysis.ratingKeepPracticing'),
      color: 'red',
      icon: '💪',
    }
  }
}
