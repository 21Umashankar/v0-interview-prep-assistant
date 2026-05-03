"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Pencil,
  Plus,
  Trash2,
  GripVertical,
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

const availableTopics = [
  { topic: "Arrays", subject: "DSA" },
  { topic: "Strings", subject: "DSA" },
  { topic: "Linked Lists", subject: "DSA" },
  { topic: "Trees", subject: "DSA" },
  { topic: "Graphs", subject: "DSA" },
  { topic: "Dynamic Programming", subject: "DSA" },
  { topic: "Sorting", subject: "DSA" },
  { topic: "Searching", subject: "DSA" },
  { topic: "SQL Queries", subject: "DBMS" },
  { topic: "Normalization", subject: "DBMS" },
  { topic: "Process Management", subject: "Operating Systems" },
  { topic: "Memory Management", subject: "Operating Systems" },
  { topic: "TCP/IP", subject: "Computer Networks" },
  { topic: "OSI Model", subject: "Computer Networks" },
  { topic: "Percentages", subject: "Aptitude" },
  { topic: "Time & Work", subject: "Aptitude" },
  { topic: "Logical Reasoning", subject: "Aptitude" },
];

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  
  // New block form state
  const [newBlockTopic, setNewBlockTopic] = useState("");
  const [newBlockTimeSlot, setNewBlockTimeSlot] = useState<"morning" | "afternoon" | "evening">("morning");
  const [newBlockTask, setNewBlockTask] = useState<"practice" | "revise" | "test">("practice");
  const [newBlockDuration, setNewBlockDuration] = useState(30);
  const [newBlockPriority, setNewBlockPriority] = useState<"high" | "medium" | "low">("medium");

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

  const handleDeleteBlock = (blockId: string) => {
    setStudyPlan((prev) => {
      const block = prev.blocks.find((b) => b.id === blockId);
      return {
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== blockId),
        totalMinutes: prev.totalMinutes - (block?.duration || 0),
      };
    });
  };

  const handleEditBlock = (block: StudyBlock) => {
    setEditingBlock(block);
    setNewBlockTopic(block.topic);
    setNewBlockTimeSlot(block.timeSlot);
    setNewBlockTask(block.task);
    setNewBlockDuration(block.duration);
    setNewBlockPriority(block.priority);
  };

  const handleSaveEditBlock = () => {
    if (!editingBlock || !newBlockTopic) return;
    
    const selectedTopic = availableTopics.find(t => t.topic === newBlockTopic);
    
    setStudyPlan((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === editingBlock.id
          ? {
              ...b,
              topic: newBlockTopic,
              subject: selectedTopic?.subject || b.subject,
              timeSlot: newBlockTimeSlot,
              task: newBlockTask,
              duration: newBlockDuration,
              priority: newBlockPriority,
            }
          : b
      ),
      totalMinutes: prev.totalMinutes - editingBlock.duration + newBlockDuration,
    }));
    
    setEditingBlock(null);
    resetForm();
  };

  const handleAddBlock = () => {
    if (!newBlockTopic) return;
    
    const selectedTopic = availableTopics.find(t => t.topic === newBlockTopic);
    const newBlock: StudyBlock = {
      id: `block-${Date.now()}`,
      timeSlot: newBlockTimeSlot,
      duration: newBlockDuration,
      topic: newBlockTopic,
      subject: selectedTopic?.subject || "General",
      task: newBlockTask,
      status: "pending",
      priority: newBlockPriority,
    };
    
    setStudyPlan((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      totalMinutes: prev.totalMinutes + newBlockDuration,
    }));
    
    setIsAddingBlock(false);
    resetForm();
  };

  const resetForm = () => {
    setNewBlockTopic("");
    setNewBlockTimeSlot("morning");
    setNewBlockTask("practice");
    setNewBlockDuration(30);
    setNewBlockPriority("medium");
  };

  const BlockForm = ({ onSave, onCancel, title, description }: { onSave: () => void; onCancel: () => void; title: string; description: string }) => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Topic</Label>
          <Select value={newBlockTopic} onValueChange={setNewBlockTopic}>
            <SelectTrigger className="border-border bg-secondary">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {availableTopics.map((t) => (
                <SelectItem key={t.topic} value={t.topic}>
                  {t.topic} ({t.subject})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select value={newBlockTimeSlot} onValueChange={(v) => setNewBlockTimeSlot(v as "morning" | "afternoon" | "evening")}>
              <SelectTrigger className="border-border bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select value={newBlockTask} onValueChange={(v) => setNewBlockTask(v as "practice" | "revise" | "test")}>
              <SelectTrigger className="border-border bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="revise">Revise</SelectItem>
                <SelectItem value="test">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={newBlockDuration}
              onChange={(e) => setNewBlockDuration(parseInt(e.target.value) || 30)}
              min={15}
              max={120}
              className="border-border bg-secondary"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={newBlockPriority} onValueChange={(v) => setNewBlockPriority(v as "high" | "medium" | "low")}>
              <SelectTrigger className="border-border bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave} disabled={!newBlockTopic}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Today&apos;s Study Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on your weak areas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={`h-8 gap-1.5 text-xs ${isEditing ? "bg-green-500 text-white hover:bg-green-600 border-green-500" : ""}`}
            >
              {isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              {isEditing ? "Done" : "Edit"}
            </Button>
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
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="font-medium text-foreground">
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
                  ? "border-primary/30 bg-primary/5"
                  : isInProgress
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/30 hover:border-border/80"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {isEditing && (
                    <div className="mt-2 cursor-grab text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isInProgress
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
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
                          isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {slotConfig.label}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-normal ${
                          block.priority === "high"
                            ? "border-destructive/30 text-destructive"
                            : block.priority === "medium"
                              ? "border-warning/30 text-warning"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {block.priority}
                      </Badge>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1 text-xs font-normal">
                        <TaskIcon className="h-3 w-3" />
                        {taskCfg.label}
                      </Badge>
                      <span className="text-sm text-foreground">{block.topic}</span>
                      <span className="text-xs text-muted-foreground">
                        ({block.subject})
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
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
                  {isEditing ? (
                    <>
                      <Dialog open={editingBlock?.id === block.id} onOpenChange={(open) => !open && setEditingBlock(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBlock(block)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <BlockForm
                          onSave={handleSaveEditBlock}
                          onCancel={() => { setEditingBlock(null); resetForm(); }}
                          title="Edit Study Block"
                          description="Modify your study block details"
                        />
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
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
                          className="border-primary/30 text-primary"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add new block button when editing */}
        {isEditing && (
          <Dialog open={isAddingBlock} onOpenChange={setIsAddingBlock}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-dashed border-border"
                onClick={() => { setIsAddingBlock(true); resetForm(); }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Study Block
              </Button>
            </DialogTrigger>
            <BlockForm
              onSave={handleAddBlock}
              onCancel={() => { setIsAddingBlock(false); resetForm(); }}
              title="Add Study Block"
              description="Create a new study block for your plan"
            />
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
