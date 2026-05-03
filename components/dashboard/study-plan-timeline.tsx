"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sun,
  Sunset,
  Moon,
  BookOpen,
  Target,
  RotateCcw,
  Check,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { UserProfile, StudyBlock, DailyStudyPlan } from "@/lib/types";

interface StudyPlanTimelineProps {
  userProfile: UserProfile;
  availableHours?: number;
  onStartBlock?: (block: StudyBlock) => void;
  onCompleteBlock?: (blockId: string) => void;
  onNavigateToTopic?: (topic: string, action: "practice" | "revise" | "test") => void;
}

const timeSlotConfig = {
  morning: {
    icon: Sun,
    label: "Morning",
    time: "9:00 AM - 10:00 AM",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
  },
  afternoon: {
    icon: Sunset,
    label: "Afternoon",
    time: "2:00 PM - 2:45 PM",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
  },
  evening: {
    icon: Moon,
    label: "Evening",
    time: "7:00 PM - 7:30 PM",
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/30",
  },
};

const taskConfig = {
  practice: {
    icon: Target,
    label: "Practice",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  revise: {
    icon: BookOpen,
    label: "Revise",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  test: {
    icon: RotateCcw,
    label: "Test",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
};

function generateStudyPlan(
  userProfile: UserProfile,
  availableHours: number
): DailyStudyPlan {
  const blocks: StudyBlock[] = [];
  const weakTopics: { topic: string; subject: string; accuracy: number }[] = [];
  const moderateTopics: { topic: string; subject: string }[] = [];

  // Collect weak and moderate topics
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
        });
      }
    });
  });

  // Sort weak topics by accuracy (lowest first)
  weakTopics.sort((a, b) => a.accuracy - b.accuracy);

  // Calculate time distribution based on available hours
  const totalMinutes = availableHours * 60;
  const morningMinutes = Math.round(totalMinutes * 0.45); // 45% morning
  const afternoonMinutes = Math.round(totalMinutes * 0.35); // 35% afternoon
  const eveningMinutes = totalMinutes - morningMinutes - afternoonMinutes; // remaining evening

  // Morning: Focus on weakest topics (Practice)
  if (weakTopics.length > 0) {
    blocks.push({
      id: "morning-1",
      timeSlot: "morning",
      duration: morningMinutes,
      topic: weakTopics[0].topic,
      subject: weakTopics[0].subject,
      task: "practice",
      status: "pending",
      priority: "high",
    });
  } else if (moderateTopics.length > 0) {
    blocks.push({
      id: "morning-1",
      timeSlot: "morning",
      duration: morningMinutes,
      topic: moderateTopics[0].topic,
      subject: moderateTopics[0].subject,
      task: "practice",
      status: "pending",
      priority: "medium",
    });
  }

  // Afternoon: Revise second weakest or moderate topics
  const afternoonTopic =
    weakTopics.length > 1 ? weakTopics[1] : moderateTopics[0];
  if (afternoonTopic) {
    blocks.push({
      id: "afternoon-1",
      timeSlot: "afternoon",
      duration: afternoonMinutes,
      topic: afternoonTopic.topic,
      subject: "subject" in afternoonTopic ? afternoonTopic.subject : afternoonTopic.subject,
      task: "revise",
      status: "pending",
      priority: weakTopics.length > 1 ? "high" : "medium",
    });
  }

  // Evening: Quick test or aptitude practice
  const eveningTopic =
    weakTopics.length > 2
      ? weakTopics[2]
      : moderateTopics.length > 1
        ? moderateTopics[1]
        : { topic: "Aptitude", subject: "Aptitude" };
  blocks.push({
    id: "evening-1",
    timeSlot: "evening",
    duration: eveningMinutes,
    topic: eveningTopic.topic,
    subject: eveningTopic.subject,
    task: "test",
    status: "pending",
    priority: "low",
  });

  const completedMinutes = blocks
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.duration, 0);

  return {
    date: new Date().toISOString().split("T")[0],
    blocks,
    totalMinutes,
    completedMinutes,
  };
}

export function StudyPlanTimeline({
  userProfile,
  availableHours = 2,
  onStartBlock,
  onCompleteBlock,
  onNavigateToTopic,
}: StudyPlanTimelineProps) {
  const [studyPlan, setStudyPlan] = useState<DailyStudyPlan>(() =>
    generateStudyPlan(userProfile, availableHours)
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const progressPercentage = useMemo(() => {
    if (studyPlan.totalMinutes === 0) return 0;
    return Math.round(
      (studyPlan.completedMinutes / studyPlan.totalMinutes) * 100
    );
  }, [studyPlan]);

  const handleStartBlock = (block: StudyBlock) => {
    setStudyPlan((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === block.id ? { ...b, status: "in-progress" as const } : b
      ),
    }));
    onStartBlock?.(block);
  };

  const handleCompleteBlock = (blockId: string) => {
    setStudyPlan((prev) => {
      const block = prev.blocks.find((b) => b.id === blockId);
      const newCompleted = block
        ? prev.completedMinutes + block.duration
        : prev.completedMinutes;
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, status: "completed" as const } : b
        ),
        completedMinutes: newCompleted,
      };
    });
    onCompleteBlock?.(blockId);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStudyPlan(generateStudyPlan(userProfile, availableHours));
    setIsGenerating(false);
  };

  const handleBlockAction = (block: StudyBlock) => {
    if (onNavigateToTopic) {
      onNavigateToTopic(block.topic, block.task);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">
                Today&apos;s Study Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adaptive plan based on your weak areas
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="border-border hover:border-primary"
          >
            <RotateCcw
              className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Generating..." : "Regenerate"}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-medium text-foreground">
              {studyPlan.completedMinutes} / {studyPlan.totalMinutes} min (
              {progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-secondary" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="relative space-y-4">
          {/* Vertical line connector */}
          <div className="absolute left-[22px] top-8 h-[calc(100%-4rem)] w-0.5 bg-border" />

          {studyPlan.blocks.map((block, index) => {
            const slotConfig = timeSlotConfig[block.timeSlot];
            const taskCfg = taskConfig[block.task];
            const SlotIcon = slotConfig.icon;
            const TaskIcon = taskCfg.icon;
            const isCompleted = block.status === "completed";
            const isInProgress = block.status === "in-progress";

            return (
              <div key={block.id} className="relative flex gap-4">
                {/* Time indicator */}
                <div
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isInProgress
                        ? `border-primary ${slotConfig.bgColor}`
                        : `${slotConfig.borderColor} ${slotConfig.bgColor}`
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <SlotIcon
                      className={`h-5 w-5 ${isInProgress ? "text-primary" : slotConfig.color}`}
                    />
                  )}
                </div>

                {/* Block content */}
                <div
                  className={`flex-1 rounded-lg border p-4 transition-all ${
                    isCompleted
                      ? "border-primary/30 bg-primary/5"
                      : isInProgress
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isCompleted
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {slotConfig.label}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            block.priority === "high"
                              ? "border-destructive/30 text-destructive"
                              : block.priority === "medium"
                                ? "border-chart-3/30 text-chart-3"
                                : "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {block.priority} priority
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <div
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${taskCfg.bgColor}`}
                        >
                          <TaskIcon className={`h-3.5 w-3.5 ${taskCfg.color}`} />
                          <span className={`text-xs font-medium ${taskCfg.color}`}>
                            {taskCfg.label}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {block.topic}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({block.subject})
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {block.duration} min
                        </span>
                        <span>{slotConfig.time}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {!isCompleted && !isInProgress && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartBlock(block)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      )}
                      {isInProgress && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBlockAction(block)}
                            className="border-border hover:border-primary"
                          >
                            Go to {taskCfg.label}
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteBlock(block.id)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Done
                          </Button>
                        </>
                      )}
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
