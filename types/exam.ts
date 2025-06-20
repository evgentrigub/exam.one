export interface Question {
  id: string;
  prompt: string;
}

// Part 1: Matching situations to classified ads
export interface ExamPart1Situation {
  id: string;
  text: string;
}

export interface ExamPart1Ad {
  id: string; // e.g., 'a', 'b', 'c'
  text: string;
}

export interface ExamPart1 {
  type: 'MATCHING_SITUATION_TO_AD';
  instructions: string;
  situations: ExamPart1Situation[];
  ads: ExamPart1Ad[];
  correctAnswers: Record<string, string>; // { situationId: adId }
}

// Part 2: Multiple Choice Questions based on an article
export interface ExamPart2Option {
  id: string; // 'a', 'b', 'c'
  text: string;
}

export interface ExamPart2Question extends Question {
  options: ExamPart2Option[];
  correctAnswerId: string;
}

export interface ExamPart2 {
  type: 'MULTIPLE_CHOICE';
  instructions: string;
  article: {
    title: string;
    content: string;
  };
  questions: ExamPart2Question[];
}

// Part 3: Matching opinions to websites
export interface ExamPart3Opinion {
  id: string;
  text: string;
}

export interface ExamPart3Website {
  id: string;
  url: string;
  title: string;
  snippet: string;
}

export interface ExamPart3 {
  type: 'MATCHING_OPINION_TO_WEBSITE';
  instructions: string;
  opinions: ExamPart3Opinion[];
  websites: ExamPart3Website[];
  correctAnswers: Record<string, string>; // { opinionId: websiteId }
}

// Part 4: True/False based on informational text
export interface ExamPart4Statement extends Question {
  correctAnswer: boolean; // true for Richtig, false for Falsch
}

export interface ExamPart4 {
  type: 'TRUE_FALSE';
  instructions: string;
  context: string;
  statements: ExamPart4Statement[];
}

// The complete exam structure
export interface Exam {
  id:string;
  title: string;
  level: 'A2';
  parts: [ExamPart1, ExamPart2, ExamPart3, ExamPart4];
} 