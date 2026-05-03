"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  BookOpen,
  RotateCcw,
  RefreshCw,
  Lightbulb,
  ChevronRight,
  Clock,
  AlertTriangle,
  Zap,
  TrendingUp,
  Play,
} from "lucide-react";
import type { UserProfile, ActionItem } from "@/lib/types";

interface InteractiveActionsProps {
  userProfile: UserProfile;
  onPractice: (topic: string, subject: string) => void;
  onRevise: (topic: string, subject: string) => void;
  onTest: (topic?: string) => void;
  onSyncProfile: () => void;
}

const actionConfig = {
  practice: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    hoverBg: "hover:bg-primary/20",
    buttonColor: "bg-primary hover:bg-primary/90",
  },
  revise: {
    icon: BookOpen,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/30",
    hoverBg: "hover:bg-chart-2/20",
    buttonColor: "bg-chart-2 hover:bg-chart-2/90",
  },
  test: {
    icon: RotateCcw,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/30",
    hoverBg: "hover:bg-chart-3/20",
    buttonColor: "bg-chart-3 hover:bg-chart-3/90",
  },
  sync: {
    icon: RefreshCw,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/30",
    hoverBg: "hover:bg-chart-4/20",
    buttonColor: "bg-chart-4 hover:bg-chart-4/90",
  },
};

function generateActionItems(userProfile: UserProfile): ActionItem[] {
  const actions: ActionItem[] = [];
  const weakTopics: { topic: string; subject: string; accuracy: number }[] = [];
  const moderateTopics: { topic: string; subject: string; accuracy: number }[] = [];

  // Collect topics by status
  userProfile.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      if (topic.status === "weak") {
        weakTopics.push({
          topic: topic.topic,
          subject: subject.name,
          accuracy: topic.accuracy,
        });
      } else if (topic.status === "moderate") {
        moderateTopics.push({
          topic: topic.topic,
          subject: subject.name,
          accuracy: topic.accuracy,
        });
      }
    });
  });

  // Sort by accuracy (lowest first)
  weakTopics.sort((a, b) => a.accuracy - b.accuracy);
  moderateTopics.sort((a, b) => a.accuracy - b.accuracy);

  // Add practice actions for weak topics
  weakTopics.slice(0, 3).forEach((topic, index) => {
    actions.push({
      id: `practice-${index}`,
      title: `Practice ${topic.topic}`,
      description: `Your accuracy is ${topic.accuracy}%. Focus on solving more problems.`,
      type: "practice",
      topic: topic.topic,
      subject: topic.subject,
      priority: "high",
      estimatedTime: 30,
    });
  });

  // Add revise actions for moderate topics
  moderateTopics.slice(0, 2).forEach((topic, index) => {
    actions.push({
      id: `revise-${index}`,
      title: `Revise ${topic.topic}`,
      description: `At ${topic.accuracy}% accuracy. Review concepts to strengthen.`,
      type: "revise",
      topic: topic.topic,
      subject: topic.subject,
      priority: "medium",
      estimatedTime: 20,
    });
  });

  // Add test action
  if (weakTopics.length > 0) {
    actions.push({
      id: "test-weak",
      title: `Take ${weakTopics[0].topic} Quiz`,
      description: `Test your knowledge after practice to measure improvement.`,
      type: "test",
      topic: weakTopics[0].topic,
      subject: weakTopics[0].subject,
      priority: "medium",
      estimatedTime: 15,
    });
  }

  // Add general test
  actions.push({
    id: "test-mixed",
    title: "Take Mixed Subject Test",
    description: "Assess overall readiness with questions from all subjects.",
    type: "test",
    priority: "low",
    estimatedTime: 25,
  });

  // Add sync action
  actions.push({
    id: "sync-profile",
    title: "Sync LeetCode Profile",
    description: "Import your LeetCode progress to update your stats.",
    type: "sync",
    priority: "low",
    estimatedTime: 2,
  });

  return actions;
}

export function InteractiveActions({
  userProfile,
  onPractice,
  onRevise,
  onTest,
  onSyncProfile,
}: InteractiveActionsProps) {
  const actions = useMemo(() => generateActionItems(userProfile), [userProfile]);

  const handleActionClick = (action: ActionItem) => {
    switch (action.type) {
      case "practice":
        if (action.topic && action.subject) {
          onPractice(action.topic, action.subject);
        }
        break;
      case "revise":
        if (action.topic && action.subject) {
          onRevise(action.topic, action.subject);
        }
        break;
      case "test":
        onTest(action.topic);
        break;
      case "sync":
        onSyncProfile();
        break;
    }
  };

  const priorityActions = actions.filter((a) => a.priority === "high");
  const otherActions = actions.filter((a) => a.priority !== "high");

  return (
    <div className="space-y-6">
      {/* Priority Actions */}
      {priorityActions.length > 0 && (
        <Card className="border-destructive/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Priority Actions
              <Badge variant="outline" className="ml-2 border-destructive/30 text-destructive">
                {priorityActions.length} urgent
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityActions.map((action) => {
              const config = actionConfig[action.type];
              const Icon = config.icon;

              return (
                <div
                  key={action.id}
                  className={`group flex items-center justify-between rounded-lg border ${config.borderColor} p-4 transition-all ${config.hoverBg}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-2 ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{action.title}</h4>
                        <Badge
                          variant="outline"
                          className="border-destructive/30 text-xs text-destructive"
                        >
                          High Priority
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {action.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {action.estimatedTime} min
                        </span>
                        {action.subject && (
                          <span className="rounded bg-secondary px-1.5 py-0.5">
                            {action.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleActionClick(action)}
                    className={`${config.buttonColor} text-primary-foreground`}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Other Actions */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-chart-3" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {otherActions.map((action) => {
              const config = actionConfig[action.type];
              const Icon = config.icon;

              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`group flex items-start gap-3 rounded-lg border ${config.borderColor} p-4 text-left transition-all ${config.hoverBg} hover:border-primary`}
                >
                  <div className={`shrink-0 rounded-lg p-2 ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">
                        {action.title}
                      </h4>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {action.estimatedTime} min
                      {action.priority === "medium" && (
                        <Badge
                          variant="outline"
                          className="ml-1 border-chart-3/30 text-chart-3"
                        >
                          Medium
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Section */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Quick Start</h3>
              <p className="text-sm text-muted-foreground">
                Jump straight into your weakest topic
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onTest()}
              className="border-border hover:border-primary"
            >
              <Target className="mr-2 h-4 w-4" />
              Take Test
            </Button>
            <Button
              onClick={() => {
                const weakest = priorityActions[0];
                if (weakest) handleActionClick(weakest);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
