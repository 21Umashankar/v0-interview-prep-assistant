"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface PerformanceAnalyticsProps {
  userProfile: UserProfile;
}

const STATUS_CONFIG = {
  strong: {
    label: "Strong",
    color: "text-primary",
  },
  moderate: {
    label: "Moderate",
    color: "text-warning",
  },
  weak: {
    label: "Needs Work",
    color: "text-destructive",
  },
};

// Use direct colors for charts that work in both themes
const CHART_COLORS = {
  primary: "#3b82f6",      // Blue
  success: "#22c55e",      // Green
  warning: "#f59e0b",      // Amber
  destructive: "#ef4444",  // Red
  secondary: "#6b7280",    // Gray
  purple: "#a855f7",       // Purple
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            {entry.name}: <span className="font-medium text-foreground">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function PerformanceAnalytics({ userProfile }: PerformanceAnalyticsProps) {
  const accuracyData = useMemo(() => {
    return userProfile.subjects.map((subject) => ({
      name:
        subject.name === "Operating Systems"
          ? "OS"
          : subject.name === "Computer Networks"
            ? "CN"
            : subject.name,
      accuracy: subject.overallAccuracy,
      progress: subject.overallProgress,
      fill:
        subject.overallAccuracy >= 75
          ? CHART_COLORS.success
          : subject.overallAccuracy >= 50
            ? CHART_COLORS.warning
            : CHART_COLORS.destructive,
    }));
  }, [userProfile.subjects]);

  const overallData = useMemo(() => {
    const totalProgress = userProfile.subjects.reduce(
      (sum, s) => sum + s.overallProgress,
      0
    );
    const avgProgress = Math.round(totalProgress / userProfile.subjects.length);
    const totalAccuracy = userProfile.subjects.reduce(
      (sum, s) => sum + s.overallAccuracy,
      0
    );
    const avgAccuracy = Math.round(totalAccuracy / userProfile.subjects.length);

    return [
      { name: "Progress", value: avgProgress, fill: CHART_COLORS.primary },
      { name: "Accuracy", value: avgAccuracy, fill: CHART_COLORS.success },
    ];
  }, [userProfile.subjects]);

  const topicDetails = useMemo(() => {
    const details: {
      topic: string;
      subject: string;
      accuracy: number;
      status: "strong" | "moderate" | "weak";
    }[] = [];

    userProfile.subjects.forEach((subject) => {
      subject.topics.forEach((topic) => {
        details.push({
          topic: topic.topic,
          subject: subject.name,
          accuracy: topic.accuracy,
          status: topic.status,
        });
      });
    });

    details.sort((a, b) => a.accuracy - b.accuracy);
    return details;
  }, [userProfile.subjects]);

  const weakTopics = topicDetails.filter((t) => t.status === "weak");
  const strongTopics = topicDetails.filter((t) => t.status === "strong");

  return (
    <div className="space-y-6">
      {/* Top Row - Overall Progress and Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Overall Progress Radial */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="85%"
                  barSize={10}
                  data={overallData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={5}
                    background={{ fill: "var(--secondary)" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <p className="text-xl font-semibold text-primary">
                  {overallData[0].value}%
                </p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-green-500">
                  {overallData[1].value}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Bar Chart */}
        <Card className="border border-border bg-card shadow-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Subject-wise Performance
              </CardTitle>
              <div className="flex gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          key === "strong"
                            ? CHART_COLORS.success
                            : key === "moderate"
                              ? CHART_COLORS.warning
                              : CHART_COLORS.destructive,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={accuracyData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--secondary)" }} />
                  <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Topic Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weak Topics */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Areas Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Great job! No weak areas detected.
              </p>
            ) : (
              <div className="space-y-2">
                {weakTopics.slice(0, 5).map((topic) => (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground">{topic.subject}</p>
                    </div>
                    <Badge variant="outline" className="border-destructive/30 text-destructive">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strong Topics */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongTopics.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Keep practicing to build strong areas!
              </p>
            ) : (
              <div className="space-y-2">
                {strongTopics.slice(0, 5).map((topic) => (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground">{topic.subject}</p>
                    </div>
                    <Badge variant="outline" className="border-green-500/30 text-green-500">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Cell import for Bar chart
import { Cell } from "recharts";
