"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code2, Database, Cpu, Network, Brain, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface TopicBreakdownProps {
  userProfile: UserProfile;
}

const iconMap: Record<string, React.ElementType> = {
  Code2: Code2,
  Database: Database,
  Cpu: Cpu,
  Network: Network,
  Brain: Brain,
};

const statusConfig = {
  strong: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    label: "Strong",
  },
  moderate: {
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    label: "Moderate",
  },
  weak: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    label: "Needs Work",
  },
};

export function TopicBreakdown({ userProfile }: TopicBreakdownProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-foreground">
          Detailed Topic Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {userProfile.subjects.map((subject) => {
            const Icon = iconMap[subject.icon] || Code2;
            return (
              <AccordionItem
                key={subject.name}
                value={subject.name}
                className="rounded-lg border border-border bg-secondary/30 px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">
                        {subject.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subject.topics.length} topics |{" "}
                        {subject.overallProgress}% complete
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-2 pt-2">
                    {subject.topics.map((topic) => {
                      const status = statusConfig[topic.status];
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={topic.topic}
                          className={`rounded-lg border ${status.borderColor} bg-card p-3`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StatusIcon
                                className={`h-4 w-4 ${status.color}`}
                              />
                              <span className="font-medium text-foreground">
                                {topic.topic}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${status.borderColor} ${status.color}`}
                            >
                              {status.label}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <Progress
                              value={topic.progress}
                              className="h-1.5 bg-secondary"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Progress: {topic.progress}%</span>
                            <span>|</span>
                            <span>Accuracy: {topic.accuracy}%</span>
                            <span>|</span>
                            <span>Practiced: {topic.practiceCount} times</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {topic.subtopics.map((subtopic) => (
                              <Badge
                                key={subtopic}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subtopic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
