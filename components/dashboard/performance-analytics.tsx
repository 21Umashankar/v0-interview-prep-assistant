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
    color: "text-green-600 dark:text-green-400",
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-600 dark:text-amber-400",
  },
  weak: {
    label: "Needs Work",
    color: "text-red-600 dark:text-red-400",
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
            {entry.name}: <span className="font-medium text-gray-900 dark:text-gray-100">{entry.value}%</span>
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
        fill: CHART_COLORS.success,
      },
      {
        name: "Moderate",
        value: moderate,
        percentage: Math.round((moderate / total) * 100),
        fill: CHART_COLORS.warning,
      },
      {
        name: "Weak",
        value: weak,
        percentage: Math.round((weak / total) * 100),
        fill: CHART_COLORS.destructive,
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
      {/* Top Row - Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Overall Progress Radial */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                    background={{ fill: "#e5e7eb" }}
                    className="dark:[&_.recharts-radial-bar-background-sector]:fill-gray-700"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {overallData[0].value}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                  {overallData[1].value}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <PieChartIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Weak Topics</span>
              </div>
              <Badge variant="outline" className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400">
                {weakTopics.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Strong Topics</span>
              </div>
              <Badge variant="outline" className="border-green-300 dark:border-green-800 text-green-600 dark:text-green-400">
                {strongTopics.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
              <span className="text-sm text-gray-900 dark:text-gray-100">Study Streak</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {userProfile.studyStreak} days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Bar Chart */}
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">{config.label}</span>
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
                  className="stroke-gray-200 dark:stroke-gray-700"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400 [&_.recharts-cartesian-axis-tick-value]:fill-gray-600 dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-600 dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(107, 114, 128, 0.1)" }} />
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
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              Areas Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Great job! No weak areas detected.
              </p>
            ) : (
              <div className="space-y-2">
                {weakTopics.slice(0, 5).map((topic) => (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic.topic}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{topic.subject}</p>
                    </div>
                    <Badge variant="outline" className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strong Topics */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongTopics.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Keep practicing to build strong areas!
              </p>
            ) : (
              <div className="space-y-2">
                {strongTopics.slice(0, 5).map((topic) => (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic.topic}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{topic.subject}</p>
                    </div>
                    <Badge variant="outline" className="border-green-300 dark:border-green-800 text-green-600 dark:text-green-400">
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
