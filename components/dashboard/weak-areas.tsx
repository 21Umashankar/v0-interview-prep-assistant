"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface WeakAreasProps {
  userProfile: UserProfile;
}

export function WeakAreas({ userProfile }: WeakAreasProps) {
  const weakTopics: {
    topic: string;
    subject: string;
    accuracy: number;
    progress: number;
  }[] = [];

  userProfile.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      if (topic.status === "weak") {
        weakTopics.push({
          topic: topic.topic,
          subject: subject.name,
          accuracy: topic.accuracy,
          progress: topic.progress,
        });
      }
    });
  });

  // Sort by accuracy (lowest first)
  weakTopics.sort((a, b) => a.accuracy - b.accuracy);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Weak Areas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weakTopics.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Great job! No weak areas detected.
          </p>
        ) : (
          <div className="space-y-3">
            {weakTopics.map((item) => (
              <div
                key={`${item.subject}-${item.topic}`}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-destructive/10 p-1.5">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.subject}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className="border-destructive/30 text-destructive"
                  >
                    {item.accuracy}% accuracy
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.progress}% complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
