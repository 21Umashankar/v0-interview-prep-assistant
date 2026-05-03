"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { WeakAreas } from "@/components/dashboard/weak-areas";
import { TopicBreakdown } from "@/components/dashboard/topic-breakdown";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ChatInterface } from "@/components/chat/chat-interface";
import { TestSystem } from "@/components/test/test-system";
import { ProfileSync } from "@/components/profile/profile-sync";
import { StudyResources } from "@/components/resources/study-resources";
import { userProfile as initialProfile } from "@/lib/data";
import type { UserProfile, TestResult, LeetCodeProfile } from "@/lib/types";
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Zap,
  Target,
  RefreshCw,
  BookOpen,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(
    userProfile.targetCompany
  );
  const [recommendedTopic, setRecommendedTopic] = useState<string | undefined>();

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

  // Quick action handlers
  const handleStudyTopic = () => setActiveTab("resources");
  const handleTakeTest = () => setActiveTab("test");
  const handleSyncProfile = () => setActiveTab("profile");
  const handleAskAI = () => setActiveTab("chat");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
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
            {/* Quick Actions */}
            <QuickActions
              onStudyTopic={handleStudyTopic}
              onTakeTest={handleTakeTest}
              onSyncProfile={handleSyncProfile}
              onAskAI={handleAskAI}
            />

            {/* Stats Overview */}
            <StatsCards userProfile={userProfile} />

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Progress */}
              <div className="space-y-6 lg:col-span-2">
                <ProgressOverview userProfile={userProfile} />
                <TopicBreakdown userProfile={userProfile} />
              </div>

              {/* Right Column - Weak Areas & Companies */}
              <div className="space-y-6">
                <WeakAreas userProfile={userProfile} />
                <CompanySelector
                  selectedCompany={selectedCompany}
                  onSelectCompany={setSelectedCompany}
                />
              </div>
            </div>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <TestSystem onTestComplete={handleTestComplete} />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <StudyResources recommendedTopic={recommendedTopic} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileSync onProfileSync={handleProfileSync} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="h-[calc(100vh-12rem)]">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
