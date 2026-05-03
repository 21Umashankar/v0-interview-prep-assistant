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
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChartIcon,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface PerformanceAnalyticsProps {
  userProfile: UserProfile;
}

const CHART_COLORS = {
  strong: "hsl(var(--chart-1))",
  moderate: "hsl(var(--chart-3))",
  weak: "hsl(var(--destructive))",
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--chart-2))",
};

const STATUS_CONFIG = {
  strong: {
    label: "Strong",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  moderate: {
    label: "Moderate",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/30",
  },
  weak: {
    label: "Weak",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-1 font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {entry.name}: <span className="font-medium text-foreground">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function PerformanceAnalytics({ userProfile }: PerformanceAnalyticsProps) {
  // Prepare data for bar chart (topic-wise accuracy)
  const accuracyData = useMemo(() => {
    return userProfile.subjects.map((subject) => ({
      name: subject.name === "Operating Systems" ? "OS" : 
            subject.name === "Computer Networks" ? "CN" : 
            subject.name,
      accuracy: subject.overallAccuracy,
      progress: subject.overallProgress,
      fill: subject.overallAccuracy >= 75
        ? CHART_COLORS.strong
        : subject.overallAccuracy >= 50
          ? CHART_COLORS.moderate
          : CHART_COLORS.weak,
    }));
  }, [userProfile.subjects]);

  // Prepare data for pie chart (status distribution)
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
      { name: "Strong", value: strong, percentage: Math.round((strong / total) * 100), fill: CHART_COLORS.strong },
      { name: "Moderate", value: moderate, percentage: Math.round((moderate / total) * 100), fill: CHART_COLORS.moderate },
      { name: "Weak", value: weak, percentage: Math.round((weak / total) * 100), fill: CHART_COLORS.weak },
    ];
  }, [userProfile.subjects]);

  // Prepare data for radial chart (overall progress)
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
      { name: "Accuracy", value: avgAccuracy, fill: CHART_COLORS.secondary },
    ];
  }, [userProfile.subjects]);

  // Get topic details for the legend
  const topicDetails = useMemo(() => {
    const details: { topic: string; subject: string; accuracy: number; status: "strong" | "moderate" | "weak" }[] = [];
    
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

    // Sort by accuracy
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
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  barSize={12}
                  data={overallData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={6}
                    background={{ fill: "hsl(var(--secondary))" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{overallData[0].value}%</p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-chart-2">{overallData[1].value}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PieChartIcon className="h-4 w-4 text-chart-2" />
              Topic Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
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
                    className="h-2.5 w-2.5 rounded-full"
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
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-chart-3" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-foreground">Weak Topics</span>
              </div>
              <Badge variant="outline" className="border-destructive/30 text-destructive">
                {weakTopics.length} topics
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Strong Topics</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {strongTopics.length} topics
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <span className="text-sm text-foreground">Study Streak</span>
              <span className="font-bold text-chart-3">{userProfile.studyStreak} days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Bar Chart */}
      <Card className="border-border bg-card">
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
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        key === "strong"
                          ? CHART_COLORS.strong
                          : key === "moderate"
                            ? CHART_COLORS.moderate
                            : CHART_COLORS.weak,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="accuracy"
                  name="Accuracy"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                >
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
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Areas Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Great job! No weak areas detected.
              </p>
            ) : (
              <div className="space-y-2">
                {weakTopics.slice(0, 5).map((topic) => (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{topic.topic}</p>
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
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongTopics.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Keep practicing to build strong areas!
              </p>
            ) : (
              <div className="space-y-2">
                {strongTopics.slice(0, 5).map((topic) => (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground">{topic.subject}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
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
