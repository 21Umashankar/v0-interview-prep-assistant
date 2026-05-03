"use client";

import { useState, useCallback } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/components/auth/login-page";
import { SignupPage } from "@/components/auth/signup-page";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(
    userProfile.targetCompany
  );
  const [recommendedTopic, setRecommendedTopic] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  // Handle test completion
  const handleTestComplete = useCallback((result: TestResult) => {
    setUserProfile((prev) => {
      const updated = { ...prev };
      updated.totalProblems += result.totalQuestions;
      
      result.topics.forEach((topicName) => {
        updated.subjects.forEach((subject) => {
          const topic = subject.topics.find((t) => t.topic === topicName);
          if (topic) {
            topic.practiceCount += result.totalQuestions / result.topics.length;
            const oldWeight = topic.practiceCount - result.totalQuestions / result.topics.length;
            const newWeight = result.totalQuestions / result.topics.length;
            topic.accuracy = Math.round(
              (topic.accuracy * oldWeight + result.accuracy * newWeight) / (oldWeight + newWeight)
            );
            topic.progress = Math.min(100, topic.progress + Math.round(result.accuracy / 10));
            
            if (topic.accuracy >= 75) topic.status = "strong";
            else if (topic.accuracy >= 50) topic.status = "moderate";
            else topic.status = "weak";
            
            topic.lastPracticed = new Date().toISOString().split("T")[0];
          }
        });
        
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
  }, []);

  // Handle profile sync
  const handleProfileSync = useCallback((profile: LeetCodeProfile) => {
    setUserProfile((prev) => {
      const updated = { ...prev };
      updated.totalProblems = profile.totalSolved;
      
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
        
        dsaSubject.overallProgress = Math.round(
          dsaSubject.topics.reduce((sum, t) => sum + t.progress, 0) / dsaSubject.topics.length
        );
      }
      
      return updated;
    });
  }, []);

  // Navigation handlers
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
    if (topic) setRecommendedTopic(topic);
    setActiveTab("test");
  }, []);

  const handleSyncProfile = useCallback(() => {
    setActiveTab("profile");
  }, []);

  const handleStartBlock = useCallback((block: StudyBlock) => {
    if (block.task === "practice") handlePractice(block.topic, block.subject);
    else if (block.task === "revise") handleRevise(block.topic, block.subject);
    else if (block.task === "test") handleTest(block.topic);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Auth pages
  if (!user) {
    if (authView === "login") {
      return <LoginPage onSwitchToSignup={() => setAuthView("signup")} />;
    }
    return <SignupPage onSwitchToLogin={() => setAuthView("login")} />;
  }

  // Main dashboard
  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <StatsCards userProfile={userProfile} />
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
        </div>
      )}

      {activeTab === "test" && (
        <TestSystem 
          onTestComplete={handleTestComplete}
          preSelectedTopic={recommendedTopic}
        />
      )}

      {activeTab === "resources" && (
        <StudyResources 
          recommendedTopic={recommendedTopic}
          preSelectedSubject={selectedSubject}
        />
      )}

      {activeTab === "analytics" && (
        <PerformanceAnalytics userProfile={userProfile} />
      )}

      {activeTab === "profile" && (
        <ProfileSync onProfileSync={handleProfileSync} />
      )}

      {activeTab === "chat" && (
        <div className="h-[calc(100vh-10rem)]">
          <ChatInterface
            onPractice={handlePractice}
            onRevise={handleRevise}
            onTest={handleTest}
            onSyncProfile={handleSyncProfile}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
