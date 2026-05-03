"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakHeatmapProps {
  studyStreak: number;
}

export function StreakHeatmap({ studyStreak }: StreakHeatmapProps) {
  // Generate activity data for the last 12 weeks (84 days)
  const activityData = useMemo(() => {
    const data: { date: Date; level: number; count: number }[] = [];
    const today = new Date();
    
    // Generate mock activity data - in real app this would come from the database
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate activity levels based on streak and randomness
      let level = 0;
      let count = 0;
      
      if (i < studyStreak) {
        // Within streak - higher activity
        const random = Math.random();
        if (random > 0.1) {
          level = Math.ceil(Math.random() * 4);
          count = level * 2 + Math.floor(Math.random() * 3);
        }
      } else {
        // Outside streak - lower/no activity
        const random = Math.random();
        if (random > 0.7) {
          level = Math.ceil(Math.random() * 2);
          count = level * 2;
        }
      }
      
      data.push({ date, level, count });
    }
    
    return data;
  }, [studyStreak]);

  // Group by weeks for display
  const weeks = useMemo(() => {
    const result: { date: Date; level: number; count: number }[][] = [];
    for (let i = 0; i < 12; i++) {
      result.push(activityData.slice(i * 7, (i + 1) * 7));
    }
    return result;
  }, [activityData]);

  // Get day labels
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get month labels
  const getMonthLabel = (weekIndex: number) => {
    if (weeks[weekIndex] && weeks[weekIndex][0]) {
      const date = weeks[weekIndex][0].date;
      if (date.getDate() <= 7) {
        return date.toLocaleDateString("en-US", { month: "short" });
      }
    }
    return "";
  };

  // Get level color
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-secondary";
      case 1:
        return "bg-green-200 dark:bg-green-900";
      case 2:
        return "bg-green-400 dark:bg-green-700";
      case 3:
        return "bg-green-500 dark:bg-green-500";
      case 4:
        return "bg-green-600 dark:bg-green-400";
      default:
        return "bg-secondary";
    }
  };

  // Calculate stats
  const totalDaysActive = activityData.filter((d) => d.level > 0).length;
  const totalProblems = activityData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-base font-semibold">Activity Streak</div>
              <div className="text-sm font-normal text-muted-foreground">
                {studyStreak} day streak - Keep it going!
              </div>
            </div>
          </CardTitle>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-lg font-semibold text-foreground">{totalDaysActive}</p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{totalProblems}</p>
              <p className="text-xs text-muted-foreground">Problems</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex pl-8 mb-1">
            {weeks.map((_, weekIndex) => (
              <div
                key={weekIndex}
                className="w-3 mx-[1px] text-[10px] text-muted-foreground"
              >
                {getMonthLabel(weekIndex)}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col pr-2">
              {dayLabels.map((day, index) => (
                <div
                  key={day}
                  className={`h-3 my-[1px] text-[10px] text-muted-foreground leading-3 ${
                    index % 2 === 0 ? "opacity-0" : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 mx-[1px] my-[1px] rounded-sm ${getLevelColor(
                        day.level
                      )} transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/20`}
                      title={`${day.date.toLocaleDateString()}: ${day.count} problems`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="flex gap-[2px]">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
