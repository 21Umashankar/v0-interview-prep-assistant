"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Flame, Trophy, TrendingUp } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface StatsCardsProps {
  userProfile: UserProfile;
}

export function StatsCards({ userProfile }: StatsCardsProps) {
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
      iconColor: "text-amber-500 dark:text-amber-400",
      borderColor: "border-l-amber-500 dark:border-l-amber-400",
    },
    {
      label: "Problems Solved",
      value: userProfile.totalProblems.toString(),
      icon: Trophy,
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-l-blue-600 dark:border-l-blue-400",
    },
    {
      label: "Overall Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-l-purple-600 dark:border-l-purple-400",
    },
    {
      label: "Avg Accuracy",
      value: `${avgAccuracy}%`,
      icon: Target,
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-l-green-600 dark:border-l-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${stat.borderColor} border-l-2`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
