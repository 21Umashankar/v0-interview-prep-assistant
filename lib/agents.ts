import type { UserProfile, CompanyProfile, AgentResponse } from "./types";
import { companies } from "./data";

// Manager Agent: Interprets user input and identifies the goal
export function managerAgent(
  userInput: string,
  userProfile: UserProfile
): AgentResponse {
  const input = userInput.toLowerCase();

  let goal = "general_improvement";
  let targetCompany: CompanyProfile | null = null;

  // Check for company-specific preparation
  for (const company of companies) {
    if (input.includes(company.name.toLowerCase())) {
      goal = "company_preparation";
      targetCompany = company;
      break;
    }
  }

  // Check for specific subject focus
  const subjects = ["dsa", "dbms", "os", "cn", "aptitude", "algorithm"];
  for (const subject of subjects) {
    if (input.includes(subject)) {
      goal = "subject_focus";
      break;
    }
  }

  // Check for weak area improvement
  if (
    input.includes("weak") ||
    input.includes("improve") ||
    input.includes("struggle")
  ) {
    goal = "weakness_improvement";
  }

  let content = "";
  if (goal === "company_preparation" && targetCompany) {
    content = `Understood! You want to prepare for ${targetCompany.name}. This is a ${targetCompany.difficulty} difficulty company with ${targetCompany.interviewRounds.length} interview rounds. I'll coordinate with other agents to create a tailored preparation plan focusing on their key areas: ${targetCompany.focusAreas.map((f) => f.subject).join(", ")}.`;
  } else if (goal === "subject_focus") {
    content = `I see you want to focus on specific subjects. Let me analyze your current performance and create a targeted study plan.`;
  } else if (goal === "weakness_improvement") {
    content = `I'll help you identify and improve your weak areas. Let me analyze your performance data to find topics that need the most attention.`;
  } else {
    content = `Welcome back, ${userProfile.name}! I'll help you with your interview preparation. Your current streak is ${userProfile.studyStreak} days with ${userProfile.totalProblems} problems solved. Let me coordinate with other agents to provide personalized guidance.`;
  }

  return {
    agent: "manager",
    title: "Goal Interpretation",
    content,
    data: { goal, targetCompany: targetCompany?.name },
  };
}

// Planner Agent: Generates structured study plans
export function plannerAgent(
  managerResponse: AgentResponse,
  userProfile: UserProfile
): AgentResponse {
  const goal = managerResponse.data?.goal as string;
  const targetCompanyName = managerResponse.data?.targetCompany as
    | string
    | undefined;

  let content = "";
  const plan: string[] = [];

  if (goal === "company_preparation" && targetCompanyName) {
    const company = companies.find((c) => c.name === targetCompanyName);
    if (company) {
      content = `Here's your structured preparation plan for ${company.name}:\n\n`;

      company.focusAreas.forEach((area, index) => {
        const weekNum = index + 1;
        plan.push(
          `Week ${weekNum}: Focus on ${area.subject} (${area.weight}% weightage)`
        );
        plan.push(`  - Key topics: ${area.importantTopics.join(", ")}`);
      });

      content += plan.join("\n");
      content += `\n\nInterview rounds to prepare for: ${company.interviewRounds.join(" → ")}`;
    }
  } else if (goal === "weakness_improvement") {
    // Find weak topics
    const weakTopics: string[] = [];
    userProfile.subjects.forEach((subject) => {
      subject.topics.forEach((topic) => {
        if (topic.status === "weak") {
          weakTopics.push(`${topic.topic} (${subject.name})`);
        }
      });
    });

    content = `Based on your performance data, here's a focused improvement plan:\n\n`;
    content += `Priority Areas:\n`;
    weakTopics.forEach((topic, index) => {
      plan.push(`${index + 1}. ${topic}`);
    });
    content += plan.join("\n");
    content += `\n\nRecommended daily practice: 3-4 problems from weak areas + 2 revision problems from strong areas.`;
  } else {
    content = `Here's your balanced study plan:\n\n`;
    content += `1. Morning (1 hr): DSA problem solving\n`;
    content += `2. Afternoon (45 min): Core subjects revision\n`;
    content += `3. Evening (30 min): Aptitude practice\n`;
    content += `4. Weekly: One mock interview session`;
  }

  return {
    agent: "planner",
    title: "Study Plan",
    content,
    data: { plan },
  };
}

// Analyzer Agent: Analyzes user performance data
export function analyzerAgent(userProfile: UserProfile): AgentResponse {
  const analysis: Record<string, unknown> = {};
  const weakTopics: string[] = [];
  const strongTopics: string[] = [];
  let totalProgress = 0;
  let totalAccuracy = 0;
  let subjectCount = 0;

  userProfile.subjects.forEach((subject) => {
    totalProgress += subject.overallProgress;
    totalAccuracy += subject.overallAccuracy;
    subjectCount++;

    subject.topics.forEach((topic) => {
      if (topic.status === "weak") {
        weakTopics.push(`${topic.topic} (${subject.name}): ${topic.accuracy}% accuracy`);
      } else if (topic.status === "strong") {
        strongTopics.push(`${topic.topic} (${subject.name}): ${topic.accuracy}% accuracy`);
      }
    });
  });

  const avgProgress = Math.round(totalProgress / subjectCount);
  const avgAccuracy = Math.round(totalAccuracy / subjectCount);

  analysis.overallProgress = avgProgress;
  analysis.overallAccuracy = avgAccuracy;
  analysis.weakTopics = weakTopics;
  analysis.strongTopics = strongTopics;

  let content = `Performance Analysis Summary:\n\n`;
  content += `Overall Progress: ${avgProgress}%\n`;
  content += `Overall Accuracy: ${avgAccuracy}%\n`;
  content += `Study Streak: ${userProfile.studyStreak} days\n`;
  content += `Total Problems: ${userProfile.totalProblems}\n\n`;

  if (weakTopics.length > 0) {
    content += `Areas Needing Attention:\n`;
    weakTopics.forEach((topic) => {
      content += `• ${topic}\n`;
    });
  }

  if (strongTopics.length > 0) {
    content += `\nStrong Areas:\n`;
    strongTopics.forEach((topic) => {
      content += `• ${topic}\n`;
    });
  }

  return {
    agent: "analyzer",
    title: "Performance Analysis",
    content,
    data: analysis,
  };
}

// Recommendation Agent: Provides actionable suggestions
export function recommendationAgent(
  analyzerResponse: AgentResponse,
  userProfile: UserProfile
): AgentResponse {
  const weakTopics = (analyzerResponse.data?.weakTopics as string[]) || [];
  const recommendations: string[] = [];
  const suggestedResources: string[] = [];
  const suggestedTests: string[] = [];

  // Generate specific recommendations based on weak areas
  if (weakTopics.length > 0) {
    const weakestTopic = weakTopics[0].split(" (")[0];
    recommendations.push(
      `Focus on your weakest area first: ${weakestTopic}`
    );
    recommendations.push(
      `Complete at least 5 problems daily from weak topics`
    );
    suggestedResources.push(`Study ${weakestTopic} from the Resources tab`);
    suggestedTests.push(`Take a ${weakestTopic} focused test`);
  }

  // Add practice recommendations based on accuracy
  const overallAccuracy = analyzerResponse.data?.overallAccuracy as number;
  if (overallAccuracy < 70) {
    recommendations.push(
      `Review concepts before attempting more problems - focus on understanding over quantity`
    );
    suggestedResources.push(`Watch video tutorials for core concepts`);
  }

  // Check practice consistency
  userProfile.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      if (topic.practiceCount < 15 && topic.status !== "strong") {
        recommendations.push(
          `Increase practice in ${topic.topic} - currently only ${topic.practiceCount} problems attempted`
        );
      }
    });
  });

  // Add mock test recommendation
  if (userProfile.totalProblems > 200) {
    recommendations.push(`You're ready for a full mock interview - schedule one this week`);
    suggestedTests.push(`Take a 20-question mixed test to assess overall readiness`);
  }

  // Profile sync recommendation
  recommendations.push(`Sync your LeetCode profile to import your progress`);

  // General recommendations
  recommendations.push(`Take a timed mock test this weekend to assess progress`);

  let content = `Personalized Recommendations:\n\n`;
  recommendations.slice(0, 5).forEach((rec, index) => {
    content += `${index + 1}. ${rec}\n`;
  });

  content += `\nSuggested Study Resources:\n`;
  suggestedResources.slice(0, 3).forEach((res) => {
    content += `• ${res}\n`;
  });

  content += `\nRecommended Tests:\n`;
  suggestedTests.slice(0, 2).forEach((test) => {
    content += `• ${test}\n`;
  });

  content += `\nQuick Actions:\n`;
  content += `• Use the "Resources" tab to access study materials\n`;
  content += `• Use the "Test" tab to practice with timed quizzes\n`;
  content += `• Use the "Profile" tab to sync your LeetCode progress`;

  return {
    agent: "recommendation",
    title: "Action Items",
    content,
    data: { 
      recommendations: recommendations.slice(0, 5),
      suggestedResources: suggestedResources.slice(0, 3),
      suggestedTests: suggestedTests.slice(0, 2),
    },
  };
}

// Main function to process user input through all agents
export function processUserInput(
  userInput: string,
  userProfile: UserProfile
): AgentResponse[] {
  const managerResponse = managerAgent(userInput, userProfile);
  const plannerResponse = plannerAgent(managerResponse, userProfile);
  const analyzerResponse = analyzerAgent(userProfile);
  const recommendationResponse = recommendationAgent(
    analyzerResponse,
    userProfile
  );

  return [
    managerResponse,
    plannerResponse,
    analyzerResponse,
    recommendationResponse,
  ];
}
