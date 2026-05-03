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
