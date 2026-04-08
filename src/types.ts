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

export interface Subject {
  id: string;
  title: string;
  subtitle: string;
  modules: Module[];
}

export interface CurriculumDB {
  subjects: Subject[];
}
