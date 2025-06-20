import type { Exam } from '~/types/exam'

export const useExamApi = () => {
  const fetchSampleExam = async (): Promise<Exam> => {
    try {
      // In a Nuxt app, the public directory is served at the root.
      const examData = await $fetch<Exam>('/data/a2-sample-exam.json')
      // TODO: Add validation logic here (e.g., with Zod) to ensure data matches the interface.
      return examData
    }
    catch (error) {
      console.error('Failed to fetch sample exam:', error)
      // Rethrow or return a default/error state
      throw new Error('Could not load the exam data.')
    }
  }

  return {
    fetchSampleExam
  }
} 