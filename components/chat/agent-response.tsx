"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  LineChart,
  Lightbulb,
  Users,
  BookOpen,
  Play,
  RefreshCw,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { AgentResponse } from "@/lib/types";

interface AgentResponseCardProps {
  response: AgentResponse;
  onPractice?: (topic: string, subject: string) => void;
  onRevise?: (topic: string, subject: string) => void;
  onTest?: (topic?: string) => void;
  onSyncProfile?: () => void;
}

const agentConfig = {
  manager: {
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    label: "Manager",
  },
  planner: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    label: "Planner",
  },
  analyzer: {
    icon: LineChart,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    label: "Analyzer",
  },
  recommendation: {
    icon: Lightbulb,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    label: "Recommendations",
  },
};

export function AgentResponseCard({
  response,
  onPractice,
  onRevise,
  onTest,
  onSyncProfile,
}: AgentResponseCardProps) {
  const config = agentConfig[response.agent];
  const Icon = config.icon;

  // Extract actionable items from recommendation agent
  const renderActionButtons = () => {
    if (response.agent !== "recommendation") return null;

    const data = response.data as {
      recommendations?: string[];
      suggestedResources?: string[];
      suggestedTests?: string[];
    };

    if (!data) return null;

    // Parse recommendations to extract actionable topics
    const actionItems: {
      type: "practice" | "revise" | "test" | "sync";
      topic?: string;
      subject?: string;
      label: string;
      priority?: "high" | "medium" | "low";
    }[] = [];

    // Parse recommendations for weak areas
    data.recommendations?.forEach((rec) => {
      const lower = rec.toLowerCase();
      if (lower.includes("focus on") || lower.includes("weakest area")) {
        const match = rec.match(/:\s*([^(]+)/);
        if (match) {
          actionItems.push({
            type: "practice",
            topic: match[1].trim(),
            subject: "DSA",
            label: `Practice ${match[1].trim()}`,
            priority: "high",
          });
        }
      } else if (lower.includes("increase practice in")) {
        const match = rec.match(/in\s+([^-]+)/);
        if (match) {
          actionItems.push({
            type: "practice",
            topic: match[1].trim(),
            subject: "DSA",
            label: `Practice ${match[1].trim()}`,
            priority: "medium",
          });
        }
      } else if (lower.includes("sync your leetcode")) {
        actionItems.push({
          type: "sync",
          label: "Sync LeetCode Profile",
          priority: "low",
        });
      }
    });

    // Parse suggested tests
    data.suggestedTests?.forEach((test) => {
      const topicMatch = test.match(/Take a (\w+[\w\s]*?) (?:focused )?test/i);
      if (topicMatch) {
        actionItems.push({
          type: "test",
          topic: topicMatch[1].trim(),
          label: `Test: ${topicMatch[1].trim()}`,
          priority: "medium",
        });
      } else if (test.toLowerCase().includes("mixed") || test.toLowerCase().includes("20-question")) {
        actionItems.push({
          type: "test",
          label: "Take Mixed Test",
          priority: "medium",
        });
      }
    });

    // Parse suggested resources
    data.suggestedResources?.forEach((res) => {
      const topicMatch = res.match(/Study\s+(\w+[\w\s]*?)\s+from/i);
      if (topicMatch) {
        actionItems.push({
          type: "revise",
          topic: topicMatch[1].trim(),
          subject: "DSA",
          label: `Study ${topicMatch[1].trim()}`,
          priority: "medium",
        });
      } else if (res.toLowerCase().includes("video tutorial")) {
        actionItems.push({
          type: "revise",
          label: "Watch Tutorials",
          priority: "low",
        });
      }
    });

    if (actionItems.length === 0) return null;

    // Separate priority and other actions
    const priorityItems = actionItems.filter((a) => a.priority === "high");
    const otherItems = actionItems.filter((a) => a.priority !== "high").slice(0, 4);

    return (
      <div className="mt-4 space-y-4 border-t border-border pt-4">
        {/* Priority Actions */}
        {priorityItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400">
              <Target className="h-4 w-4" />
              Priority Actions
            </div>
            <div className="space-y-2">
              {priorityItems.map((item, index) => (
                <button
                  key={`priority-${index}`}
                  onClick={() => {
                    if (item.type === "practice" && item.topic && onPractice) {
                      onPractice(item.topic, item.subject || "DSA");
                    } else if (item.type === "test" && onTest) {
                      onTest(item.topic);
                    } else if (item.type === "sync" && onSyncProfile) {
                      onSyncProfile();
                    }
                  }}
                  className="group flex w-full items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 p-3.5 text-left transition-all hover:bg-red-500/10 dark:border-red-400/30 dark:bg-red-400/5 dark:hover:bg-red-400/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500/10 p-2 dark:bg-red-400/10">
                      <Target className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <span className="text-base font-medium text-foreground">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~30 min
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-500/30 text-red-500 dark:border-red-400/30 dark:text-red-400">
                      High Priority
                    </Badge>
                    <Play className="h-4 w-4 text-red-500 transition-transform group-hover:translate-x-1 dark:text-red-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {otherItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Recommended Actions
            </div>
            <div className="flex flex-wrap gap-2">
              {otherItems.map((item, index) => {
                const ActionIcon =
                  item.type === "practice"
                    ? Target
                    : item.type === "revise"
                    ? BookOpen
                    : item.type === "test"
                    ? Play
                    : RefreshCw;

                return (
                  <button
                    key={`other-${index}`}
                    onClick={() => {
                      if (item.type === "practice" && item.topic && onPractice) {
                        onPractice(item.topic, item.subject || "DSA");
                      } else if (item.type === "revise" && onRevise) {
                        onRevise(item.topic || "", item.subject || "DSA");
                      } else if (item.type === "test" && onTest) {
                        onTest(item.topic);
                      } else if (item.type === "sync" && onSyncProfile) {
                        onSyncProfile();
                      }
                    }}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-left text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-secondary"
                  >
                    <ActionIcon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Play className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-medium text-foreground">Quick Start</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="default"
              variant="outline"
              onClick={() => onTest?.()}
              className="border-border hover:border-primary"
            >
              <Target className="mr-2 h-4 w-4" />
              Take Test
            </Button>
            <Button
              size="default"
              onClick={() => {
                const firstPriority = priorityItems[0] || otherItems[0];
                if (firstPriority?.topic && onPractice) {
                  onPractice(firstPriority.topic, firstPriority.subject || "DSA");
                }
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Practice
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render analyzer weak areas as clickable
  const renderAnalyzerActions = () => {
    if (response.agent !== "analyzer") return null;

    const data = response.data as {
      weakTopics?: string[];
      strongTopics?: string[];
    };

    if (!data?.weakTopics || data.weakTopics.length === 0) return null;

    return (
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <Target className="h-4 w-4" />
          Click to practice weak areas
        </div>
        <div className="flex flex-wrap gap-2">
          {data.weakTopics.slice(0, 4).map((topic, index) => {
            const topicName = topic.split(" (")[0];
            return (
              <Button
                key={index}
                size="default"
                variant="outline"
                onClick={() => onPractice?.(topicName, "DSA")}
                className="border-red-500/30 text-red-500 hover:bg-red-500/10 dark:border-red-400/30 dark:text-red-400 dark:hover:bg-red-400/10"
              >
                <Target className="mr-2 h-4 w-4" />
                {topicName}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render planner study plan as clickable items
  const renderPlannerActions = () => {
    if (response.agent !== "planner") return null;

    return (
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Ready to start studying?
          </div>
          <Button
            size="default"
            variant="outline"
            onClick={() => onTest?.()}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <Play className="mr-2 h-4 w-4" />
            Take a Practice Test
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`border-2 ${config.borderColor} bg-card shadow-sm`}>
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              {response.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-medium ${config.borderColor} ${config.color}`}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-0">
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-muted-foreground">
          {response.content}
        </pre>
        {renderAnalyzerActions()}
        {renderPlannerActions()}
        {renderActionButtons()}
      </CardContent>
    </Card>
  );
}
