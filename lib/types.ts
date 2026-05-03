// User performance data types
export interface TopicProgress {
  topic: string;
  subtopics: string[];
  progress: number; // 0-100
  accuracy: number; // 0-100
  practiceCount: number;
  lastPracticed: string;
  status: "strong" | "moderate" | "weak";
}

export interface SubjectArea {
  name: string;
  icon: string;
  topics: TopicProgress[];
  overallProgress: number;
  overallAccuracy: number;
}

export interface UserProfile {
  name: string;
  targetCompany: string;
  studyStreak: number;
  totalProblems: number;
  subjects: SubjectArea[];
}

export interface CompanyProfile {
  name: string;
  logo: string;
  focusAreas: {
    subject: string;
    weight: number;
    importantTopics: string[];
  }[];
  difficulty: "Easy" | "Medium" | "Hard";
  interviewRounds: string[];
}

// Agent response types
export interface AgentResponse {
  agent: "manager" | "planner" | "analyzer" | "recommendation";
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentResponses?: AgentResponse[];
}

// Study Resources
export interface StudyResource {
  title: string;
  platform: "LeetCode" | "GeeksforGeeks" | "YouTube" | "HackerRank" | "InterviewBit";
  url: string;
  type: "video" | "article" | "practice";
  difficulty?: "Easy" | "Medium" | "Hard";
}

export interface TopicResources {
  topic: string;
  subject: string;
  resources: StudyResource[];
}

// Test System
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  explanation?: string;
}

export interface TestResult {
  id: string;
  date: Date;
  subject: string;
  topics: string[];
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  accuracy: number;
  timeTaken: number; // in seconds
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

// Study Plan Types
export interface StudyBlock {
  id: string;
  timeSlot: "morning" | "afternoon" | "evening";
  duration: number; // in minutes
  topic: string;
  subject: string;
  task: "practice" | "revise" | "test";
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

export interface DailyStudyPlan {
  date: string;
  blocks: StudyBlock[];
  totalMinutes: number;
  completedMinutes: number;
}

// Action Item Types
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: "practice" | "revise" | "test" | "sync";
  topic?: string;
  subject?: string;
  priority: "high" | "medium" | "low";
  estimatedTime: number; // in minutes
}

// LeetCode Profile
export interface LeetCodeProfile {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  contestRating?: number;
  topicWiseProgress: {
    topic: string;
    solved: number;
    total: number;
  }[];
}
