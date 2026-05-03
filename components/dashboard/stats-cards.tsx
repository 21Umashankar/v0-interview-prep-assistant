"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Flame, Trophy, TrendingUp } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface StatsCardsProps {
  userProfile: UserProfile;
}

export function StatsCards({ userProfile }: StatsCardsProps) {
  const totalTopics = userProfile.subjects.reduce(
    (acc, subject) => acc + subject.topics.length,
    0
  );

  const avgProgress = Math.round(
    userProfile.subjects.reduce((acc, s) => acc + s.overallProgress, 0) /
      userProfile.subjects.length
  );

  const avgAccuracy = Math.round(
    userProfile.subjects.reduce((acc, s) => acc + s.overallAccuracy, 0) /
      userProfile.subjects.length
  );

  const stats = [
    {
      label: "Study Streak",
      value: `${userProfile.studyStreak} days`,
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      label: "Problems Solved",
      value: userProfile.totalProblems.toString(),
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Overall Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Avg Accuracy",
      value: `${avgAccuracy}%`,
      icon: Target,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
