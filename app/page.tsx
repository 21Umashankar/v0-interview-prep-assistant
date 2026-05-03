"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StudyPlanTimeline } from "@/components/dashboard/study-plan-timeline";
import { PerformanceAnalytics } from "@/components/dashboard/performance-analytics";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { ChatInterface } from "@/components/chat/chat-interface";
import { TestSystem } from "@/components/test/test-system";
import { ProfileSync } from "@/components/profile/profile-sync";
import { StudyResources } from "@/components/resources/study-resources";
import { userProfile as initialProfile } from "@/lib/data";
import type { UserProfile, TestResult, LeetCodeProfile, StudyBlock } from "@/lib/types";
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Zap,
  Target,
  RefreshCw,
  BookOpen,
  BarChart3,
  Sparkles,
} from "lucide-react";
// Note: Zap is kept for the "4 Active Agents" badge in the header

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardView, setDashboardView] = useState<"overview" | "analytics">("overview");
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(
    userProfile.targetCompany
  );
  const [recommendedTopic, setRecommendedTopic] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  // Handle test completion - update progress
  const handleTestComplete = useCallback((result: TestResult) => {
    setUserProfile((prev) => {
      const updated = { ...prev };
      updated.totalProblems += result.totalQuestions;
      
      // Update topic-wise progress based on test results
      result.topics.forEach((topicName) => {
        updated.subjects.forEach((subject) => {
          const topic = subject.topics.find((t) => t.topic === topicName);
          if (topic) {
            // Update practice count
            topic.practiceCount += result.totalQuestions / result.topics.length;
            
            // Update accuracy with weighted average
            const oldWeight = topic.practiceCount - result.totalQuestions / result.topics.length;
            const newWeight = result.totalQuestions / result.topics.length;
            topic.accuracy = Math.round(
              (topic.accuracy * oldWeight + result.accuracy * newWeight) / 
              (oldWeight + newWeight)
            );
            
            // Update progress
            topic.progress = Math.min(100, topic.progress + Math.round(result.accuracy / 10));
            
            // Update status based on accuracy
            if (topic.accuracy >= 75) {
              topic.status = "strong";
            } else if (topic.accuracy >= 50) {
              topic.status = "moderate";
            } else {
              topic.status = "weak";
            }
            
            topic.lastPracticed = new Date().toISOString().split("T")[0];
          }
        });
        
        // Recalculate subject overall progress and accuracy
        updated.subjects.forEach((subject) => {
          const topicsInSubject = subject.topics.length;
          subject.overallProgress = Math.round(
            subject.topics.reduce((sum, t) => sum + t.progress, 0) / topicsInSubject
          );
          subject.overallAccuracy = Math.round(
            subject.topics.reduce((sum, t) => sum + t.accuracy, 0) / topicsInSubject
          );
        });
      });
      
      return updated;
    });
    
    // Find weak topic to recommend for study
    const weakTopics = result.answers
      .filter((a) => !a.isCorrect)
      .map((a) => {
        const question = userProfile.subjects
          .flatMap((s) => s.topics)
          .find((t) => t.topic === result.topics[0]);
        return question?.topic;
      })
      .filter(Boolean);
    
    if (weakTopics[0]) {
      setRecommendedTopic(weakTopics[0]);
    }
  }, [userProfile.subjects]);

  // Handle profile sync
  const handleProfileSync = useCallback((profile: LeetCodeProfile) => {
    setUserProfile((prev) => {
      const updated = { ...prev };
      updated.totalProblems = profile.totalSolved;
      
      // Update DSA topics based on LeetCode progress
      const dsaSubject = updated.subjects.find((s) => s.name === "DSA");
      if (dsaSubject) {
        profile.topicWiseProgress.forEach((lcTopic) => {
          const matchingTopic = dsaSubject.topics.find(
            (t) => t.topic.toLowerCase() === lcTopic.topic.toLowerCase() ||
                   lcTopic.topic.toLowerCase().includes(t.topic.toLowerCase())
          );
          if (matchingTopic) {
            const percentage = Math.round((lcTopic.solved / lcTopic.total) * 100);
            matchingTopic.progress = Math.min(100, Math.max(matchingTopic.progress, percentage));
            matchingTopic.practiceCount = lcTopic.solved;
          }
        });
        
        // Recalculate DSA overall progress
        dsaSubject.overallProgress = Math.round(
          dsaSubject.topics.reduce((sum, t) => sum + t.progress, 0) / dsaSubject.topics.length
        );
      }
      
      return updated;
    });
  }, []);

  // Navigation handlers for interactive actions
  const handlePractice = useCallback((topic: string, subject: string) => {
    setRecommendedTopic(topic);
    setSelectedSubject(subject);
    setActiveTab("resources");
  }, []);

  const handleRevise = useCallback((topic: string, subject: string) => {
    setRecommendedTopic(topic);
    setSelectedSubject(subject);
    setActiveTab("resources");
  }, []);

  const handleTest = useCallback((topic?: string) => {
    if (topic) {
      setRecommendedTopic(topic);
    }
    setActiveTab("test");
  }, []);

  const handleSyncProfile = useCallback(() => {
    setActiveTab("profile");
  }, []);

  // Study plan timeline handlers
  const handleStartBlock = useCallback((block: StudyBlock) => {
    // Navigate based on task type
    if (block.task === "practice") {
      handlePractice(block.topic, block.subject);
    } else if (block.task === "revise") {
      handleRevise(block.topic, block.subject);
    } else if (block.task === "test") {
      handleTest(block.topic);
    }
  }, [handlePractice, handleRevise, handleTest]);

  const handleNavigateToTopic = useCallback((topic: string, action: "practice" | "revise" | "test") => {
    if (action === "practice" || action === "revise") {
      setRecommendedTopic(topic);
      setActiveTab("resources");
    } else {
      setRecommendedTopic(topic);
      setActiveTab("test");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PrepAI</h1>
              <p className="text-xs text-muted-foreground">
                Multi-Agent Interview System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="hidden border-primary/30 text-primary sm:flex"
            >
              <Zap className="mr-1 h-3 w-3" />4 Active Agents
            </Badge>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-medium text-primary">
                  {userProfile.name.charAt(0)}
                </span>
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {userProfile.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-secondary lg:w-auto lg:inline-grid">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Sub-navigation */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setDashboardView("overview")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  dashboardView === "overview"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Study Plan
              </button>
              <button
                onClick={() => setDashboardView("analytics")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  dashboardView === "analytics"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </div>

            {/* Stats Overview - Always visible */}
            <StatsCards userProfile={userProfile} />

            {/* Dynamic Dashboard Content */}
            {dashboardView === "overview" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <StudyPlanTimeline
                    userProfile={userProfile}
                    availableHours={2}
                    onStartBlock={handleStartBlock}
                    onNavigateToTopic={handleNavigateToTopic}
                  />
                </div>
                <div>
                  <CompanySelector
                    selectedCompany={selectedCompany}
                    onSelectCompany={setSelectedCompany}
                  />
                </div>
              </div>
            )}

            {dashboardView === "analytics" && (
              <PerformanceAnalytics userProfile={userProfile} />
            )}
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <TestSystem 
              onTestComplete={handleTestComplete}
              preSelectedTopic={recommendedTopic}
            />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <StudyResources 
              recommendedTopic={recommendedTopic}
              preSelectedSubject={selectedSubject}
            />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileSync onProfileSync={handleProfileSync} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="h-[calc(100vh-12rem)]">
            <ChatInterface
              onPractice={handlePractice}
              onRevise={handleRevise}
              onTest={handleTest}
              onSyncProfile={handleSyncProfile}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
