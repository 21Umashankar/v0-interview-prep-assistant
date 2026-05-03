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
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    label: "Manager Agent",
  },
  planner: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    label: "Planner Agent",
  },
  analyzer: {
    icon: LineChart,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    label: "Analyzer Agent",
  },
  recommendation: {
    icon: Lightbulb,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    label: "Recommendation Agent",
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-destructive">
              <Target className="h-3 w-3" />
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
                  className="group flex w-full items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left transition-all hover:bg-destructive/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-destructive/10 p-1.5">
                      <Target className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~30 min
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-destructive/30 text-destructive text-xs">
                      High
                    </Badge>
                    <Play className="h-4 w-4 text-destructive transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {otherItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              Recommended Actions
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {otherItems.map((item, index) => {
                const ActionIcon =
                  item.type === "practice"
                    ? Target
                    : item.type === "revise"
                    ? BookOpen
                    : item.type === "test"
                    ? Play
                    : RefreshCw;
                const colorClass =
                  item.type === "practice"
                    ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10"
                    : item.type === "revise"
                    ? "text-chart-2 border-chart-2/30 bg-chart-2/5 hover:bg-chart-2/10"
                    : item.type === "test"
                    ? "text-chart-3 border-chart-3/30 bg-chart-3/5 hover:bg-chart-3/10"
                    : "text-chart-4 border-chart-4/30 bg-chart-4/5 hover:bg-chart-4/10";

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
                    className={`group flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${colorClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <ActionIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Play className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Quick Start</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTest?.()}
              className="h-8 border-border text-xs hover:border-primary"
            >
              <Target className="mr-1 h-3 w-3" />
              Test
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const firstPriority = priorityItems[0] || otherItems[0];
                if (firstPriority?.topic && onPractice) {
                  onPractice(firstPriority.topic, firstPriority.subject || "DSA");
                }
              }}
              className="h-8 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
            >
              <Play className="mr-1 h-3 w-3" />
              Practice
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
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
          <Target className="h-3 w-3" />
          Click to practice weak areas
        </div>
        <div className="flex flex-wrap gap-2">
          {data.weakTopics.slice(0, 3).map((topic, index) => {
            const topicName = topic.split(" (")[0];
            return (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => onPractice?.(topicName, "DSA")}
                className="h-7 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
              >
                <Target className="mr-1 h-3 w-3" />
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
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            Start studying now
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTest?.()}
            className="h-7 border-primary/30 text-xs text-primary hover:bg-primary/10"
          >
            <Play className="mr-1 h-3 w-3" />
            Take a Test
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`border ${config.borderColor} bg-card`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-1.5 ${config.bgColor}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <CardTitle className="text-sm font-medium text-foreground">
              {response.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${config.borderColor} ${config.color}`}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
          {response.content}
        </pre>
        {renderAnalyzerActions()}
        {renderPlannerActions()}
        {renderActionButtons()}
      </CardContent>
    </Card>
  );
}
