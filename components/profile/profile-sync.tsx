"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Code2,
  Trophy,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import type { LeetCodeProfile } from "@/lib/types";

interface ProfileSyncProps {
  onProfileSync?: (profile: LeetCodeProfile) => void;
}

// Simulated profile data generator
function generateMockProfile(username: string): LeetCodeProfile {
  const easySolved = Math.floor(Math.random() * 200) + 50;
  const mediumSolved = Math.floor(Math.random() * 150) + 30;
  const hardSolved = Math.floor(Math.random() * 50) + 10;
  
  return {
    username,
    totalSolved: easySolved + mediumSolved + hardSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking: Math.floor(Math.random() * 500000) + 100000,
    contestRating: Math.floor(Math.random() * 800) + 1400,
    topicWiseProgress: [
      { topic: "Arrays", solved: Math.floor(Math.random() * 50) + 20, total: 150 },
      { topic: "Strings", solved: Math.floor(Math.random() * 40) + 15, total: 120 },
      { topic: "Dynamic Programming", solved: Math.floor(Math.random() * 30) + 10, total: 180 },
      { topic: "Trees", solved: Math.floor(Math.random() * 35) + 15, total: 100 },
      { topic: "Graphs", solved: Math.floor(Math.random() * 25) + 10, total: 90 },
      { topic: "Linked Lists", solved: Math.floor(Math.random() * 20) + 10, total: 50 },
      { topic: "Binary Search", solved: Math.floor(Math.random() * 20) + 8, total: 60 },
      { topic: "Backtracking", solved: Math.floor(Math.random() * 15) + 5, total: 45 },
    ],
  };
}

export function ProfileSync({ onProfileSync }: ProfileSyncProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const mockProfile = generateMockProfile(username);
      setProfile(mockProfile);
      onProfileSync?.(mockProfile);
    } catch {
      setError("Failed to fetch profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: "Easy" | "Medium" | "Hard") => {
    switch (difficulty) {
      case "Easy":
        return "text-chart-1";
      case "Medium":
        return "text-chart-3";
      case "Hard":
        return "text-destructive";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <RefreshCw className="h-5 w-5 text-primary" />
          Sync LeetCode Profile
        </CardTitle>
        <CardDescription>
          Import your LeetCode progress to update your preparation data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!profile ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">LeetCode Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your LeetCode username"
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSync}
                  disabled={isLoading || !username.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="rounded-lg border border-border bg-secondary/50 p-6">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="font-medium text-foreground">Fetching profile data...</p>
                    <p className="text-sm text-muted-foreground">
                      Connecting to LeetCode servers
                    </p>
                  </div>
                  <Progress value={66} className="w-48" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <h4 className="mb-2 text-sm font-medium text-foreground">How it works:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>1. Enter your LeetCode username</li>
                <li>2. We&apos;ll fetch your problem-solving stats</li>
                <li>3. Your progress will sync with your study plan</li>
                <li>4. AI agents will use this data for better recommendations</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.username}</p>
                  <p className="text-sm text-muted-foreground">LeetCode Profile</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Synced</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
                <Trophy className="mx-auto h-5 w-5 text-chart-3" />
                <p className="mt-2 text-2xl font-bold text-foreground">{profile.totalSolved}</p>
                <p className="text-xs text-muted-foreground">Total Solved</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
                <TrendingUp className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 text-2xl font-bold text-foreground">#{profile.ranking.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Global Ranking</p>
              </div>
              <div className="col-span-2 rounded-lg border border-border bg-secondary/50 p-4">
                <p className="mb-2 text-xs text-muted-foreground">Difficulty Breakdown</p>
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <p className={`text-xl font-bold ${getDifficultyColor("Easy")}`}>{profile.easySolved}</p>
                    <p className="text-xs text-muted-foreground">Easy</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className={`text-xl font-bold ${getDifficultyColor("Medium")}`}>{profile.mediumSolved}</p>
                    <p className="text-xs text-muted-foreground">Medium</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className={`text-xl font-bold ${getDifficultyColor("Hard")}`}>{profile.hardSolved}</p>
                    <p className="text-xs text-muted-foreground">Hard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Progress */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground">Topic-wise Progress</h4>
              <div className="space-y-3">
                {profile.topicWiseProgress.map((topic) => {
                  const percentage = Math.round((topic.solved / topic.total) * 100);
                  return (
                    <div key={topic.topic} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{topic.topic}</span>
                        <span className="text-muted-foreground">
                          {topic.solved}/{topic.total}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contest Rating */}
            {profile.contestRating && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contest Rating</p>
                  <p className="text-xl font-bold text-foreground">{profile.contestRating}</p>
                </div>
                <Button variant="outline" size="sm" className="border-border" asChild>
                  <a
                    href={`https://leetcode.com/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View Profile
                  </a>
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setProfile(null)}
                className="flex-1 border-border"
              >
                Sync Different Account
              </Button>
              <Button
                onClick={handleSync}
                disabled={isLoading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
