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
  },
  afternoon: {
    icon: Sunset,
    label: "Afternoon",
    time: "2:00 PM - 2:45 PM",
  },
  evening: {
    icon: Moon,
    label: "Evening",
    time: "7:00 PM - 7:30 PM",
  },
};

const taskConfig = {
  practice: {
    icon: Target,
    label: "Practice",
  },
  revise: {
    icon: BookOpen,
    label: "Revise",
  },
  test: {
    icon: RotateCcw,
    label: "Test",
  },
};

function generateStudyPlan(
  userProfile: UserProfile,
  availableHours: number
): DailyStudyPlan {
  const blocks: StudyBlock[] = [];
  const weakTopics: { topic: string; subject: string; accuracy: number }[] = [];
  const moderateTopics: { topic: string; subject: string }[] = [];

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

  weakTopics.sort((a, b) => a.accuracy - b.accuracy);

  const totalMinutes = availableHours * 60;
  const morningMinutes = Math.round(totalMinutes * 0.45);
  const afternoonMinutes = Math.round(totalMinutes * 0.35);
  const eveningMinutes = totalMinutes - morningMinutes - afternoonMinutes;

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
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Today&apos;s Study Plan
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Based on your weak areas
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Generating..." : "Regenerate"}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Daily Progress</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {studyPlan.completedMinutes} / {studyPlan.totalMinutes} min
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {studyPlan.blocks.map((block) => {
          const slotConfig = timeSlotConfig[block.timeSlot];
          const taskCfg = taskConfig[block.task];
          const SlotIcon = slotConfig.icon;
          const TaskIcon = taskCfg.icon;
          const isCompleted = block.status === "completed";
          const isInProgress = block.status === "in-progress";

          return (
            <div
              key={block.id}
              className={`rounded-lg border p-4 transition-all ${
                isCompleted
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  : isInProgress
                    ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isInProgress
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <SlotIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {slotConfig.label}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-normal ${
                          block.priority === "high"
                            ? "border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
                            : block.priority === "medium"
                              ? "border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {block.priority}
                      </Badge>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1 text-xs font-normal bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <TaskIcon className="h-3 w-3" />
                        {taskCfg.label}
                      </Badge>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{block.topic}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({block.subject})
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {block.duration} min
                      </span>
                      <span>{slotConfig.time}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex shrink-0 gap-2">
                  {!isCompleted && !isInProgress && (
                    <Button
                      size="sm"
                      onClick={() => handleStartBlock(block)}
                      className="h-8 gap-1 text-xs"
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  )}
                  {isInProgress && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBlockAction(block)}
                        className="h-8 gap-1 text-xs"
                      >
                        {taskCfg.label}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteBlock(block.id)}
                        className="h-8 gap-1 bg-green-500 text-xs text-white hover:bg-green-600"
                      >
                        <Check className="h-3 w-3" />
                        Done
                      </Button>
                    </>
                  )}
                  {isCompleted && (
                    <Badge
                      variant="outline"
                      className="border-green-300 dark:border-green-800 text-green-600 dark:text-green-400"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
