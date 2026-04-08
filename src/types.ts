export interface Chapter {
  id: string;
  title: string;
  duration: string;
  transcript: string;
  quiz: {
    question: string;
    options: {
      text: string;
      isCorrect: boolean;
      feedback: string;
    }[];
  };
}

export interface Module {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  color?: 'bordeaux' | 'gold' | 'blue';
}

export interface Summary {
  id: string;
  title: string;
  content: string;
  details: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  description: string;
  patientHistory: string;
  physicalExam: string;
  labs: string;
  diagnosis: string;
  management: string;
}

export interface Subject {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  modules: Module[];
  books?: Book[];
  summaries?: Summary[];
  cases?: ClinicalCase[];
}

export interface CurriculumDB {
  subjects: Subject[];
}
