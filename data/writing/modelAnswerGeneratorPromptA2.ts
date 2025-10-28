import { dataAnswerRuleA2Part1, dataAnswerRuleA2Part2 } from './dataToGenerateTopicsA2'

export const generateModelAnswerA2Part1 = (topicTask: string, topicId: string) => {
  return `[MOCK PROMPT - User will fill this with actual A2 Teil 1 model answer generation prompt]
  
  Topic Task: ${topicTask}
  Topic ID: ${topicId}
  Answer Rules: ${dataAnswerRuleA2Part1}
  
  Generate a model answer following A2 level standards.
  `
}

export const generateModelAnswerA2Part2 = (topicTask: string, topicId: string) => {
  return `[MOCK PROMPT - User will fill this with actual A2 Teil 2 model answer generation prompt]
  
  Topic Task: ${topicTask}
  Topic ID: ${topicId}
  Answer Rules: ${dataAnswerRuleA2Part2}
  
  Generate a model answer following A2 level standards.
  `
}

