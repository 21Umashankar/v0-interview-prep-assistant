"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  RefreshCw,
  MessageSquare,
  Zap,
} from "lucide-react";

interface QuickActionsProps {
  onStudyTopic: () => void;
  onTakeTest: () => void;
  onSyncProfile: () => void;
  onAskAI: () => void;
}

export function QuickActions({
  onStudyTopic,
  onTakeTest,
  onSyncProfile,
  onAskAI,
}: QuickActionsProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="outline"
            onClick={onStudyTopic}
            className="h-auto flex-col gap-2 border-border py-4 hover:border-primary hover:bg-primary/10"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-foreground">Study Topic</span>
          </Button>
          <Button
            variant="outline"
            onClick={onTakeTest}
            className="h-auto flex-col gap-2 border-border py-4 hover:border-primary hover:bg-primary/10"
          >
            <Target className="h-5 w-5 text-chart-3" />
            <span className="text-foreground">Take Test</span>
          </Button>
          <Button
            variant="outline"
            onClick={onSyncProfile}
            className="h-auto flex-col gap-2 border-border py-4 hover:border-primary hover:bg-primary/10"
          >
            <RefreshCw className="h-5 w-5 text-chart-2" />
            <span className="text-foreground">Sync Profile</span>
          </Button>
          <Button
            variant="outline"
            onClick={onAskAI}
            className="h-auto flex-col gap-2 border-border py-4 hover:border-primary hover:bg-primary/10"
          >
            <MessageSquare className="h-5 w-5 text-chart-4" />
            <span className="text-foreground">Ask AI</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
