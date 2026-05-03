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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface PerformanceAnalyticsProps {
  userProfile: UserProfile;
}

const STATUS_CONFIG = {
  strong: {
    label: "Strong",
    color: "text-success",
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
          ? "hsl(var(--success))"
          : subject.overallAccuracy >= 50
            ? "hsl(var(--warning))"
            : "hsl(var(--destructive))",
    }));
  }, [userProfile.subjects]);

  const statusDistribution = useMemo(() => {
    let strong = 0;
    let moderate = 0;
    let weak = 0;

    userProfile.subjects.forEach((subject) => {
      subject.topics.forEach((topic) => {
        if (topic.status === "strong") strong++;
        else if (topic.status === "moderate") moderate++;
        else weak++;
      });
    });

    const total = strong + moderate + weak;
    return [
      {
        name: "Strong",
        value: strong,
        percentage: Math.round((strong / total) * 100),
        fill: "hsl(var(--success))",
      },
      {
        name: "Moderate",
        value: moderate,
        percentage: Math.round((moderate / total) * 100),
        fill: "hsl(var(--warning))",
      },
      {
        name: "Weak",
        value: weak,
        percentage: Math.round((weak / total) * 100),
        fill: "hsl(var(--destructive))",
      },
    ];
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
      { name: "Progress", value: avgProgress, fill: "hsl(var(--primary))" },
      { name: "Accuracy", value: avgAccuracy, fill: "hsl(var(--chart-2))" },
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
      {/* Top Row - Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
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
                    background={{ fill: "hsl(var(--secondary))" }}
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
                <p className="text-xl font-semibold text-chart-2">
                  {overallData[1].value}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PieChartIcon className="h-4 w-4 text-chart-2" />
              Topic Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-warning" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-foreground">Weak Topics</span>
              </div>
              <Badge variant="outline" className="border-destructive/30 text-destructive">
                {weakTopics.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">Strong Topics</span>
              </div>
              <Badge variant="outline" className="border-success/30 text-success">
                {strongTopics.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
              <span className="text-sm text-foreground">Study Streak</span>
              <span className="font-semibold text-warning">
                {userProfile.studyStreak} days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Bar Chart */}
      <Card className="border border-border bg-card shadow-sm">
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
                          ? "hsl(var(--success))"
                          : key === "moderate"
                            ? "hsl(var(--warning))"
                            : "hsl(var(--destructive))",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accuracyData}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
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

      {/* Topic Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
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
              <p className="text-center text-sm text-muted-foreground">
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
              <TrendingUp className="h-4 w-4 text-success" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongTopics.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
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
                    <Badge variant="outline" className="border-success/30 text-success">
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
