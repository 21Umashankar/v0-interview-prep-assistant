"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Code2, Database, Cpu, Network, Brain } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface ProgressOverviewProps {
  userProfile: UserProfile;
}

const iconMap: Record<string, React.ElementType> = {
  Code2: Code2,
  Database: Database,
  Cpu: Cpu,
  Network: Network,
  Brain: Brain,
};

export function ProgressOverview({ userProfile }: ProgressOverviewProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-foreground">
          Subject Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {userProfile.subjects.map((subject) => {
          const Icon = iconMap[subject.icon] || Code2;
          return (
            <div key={subject.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {subject.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-border text-xs text-muted-foreground"
                  >
                    {subject.overallAccuracy}% accuracy
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {subject.overallProgress}%
                  </span>
                </div>
              </div>
              <Progress
                value={subject.overallProgress}
                className="h-2 bg-secondary"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
