"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { WeakAreas } from "@/components/dashboard/weak-areas";
import { TopicBreakdown } from "@/components/dashboard/topic-breakdown";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { ChatInterface } from "@/components/chat/chat-interface";
import { userProfile } from "@/lib/data";
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Zap,
} from "lucide-react";

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(
    userProfile.targetCompany
  );

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
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
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
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary lg:w-auto lg:inline-grid">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
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

          <TabsContent value="chat" className="h-[calc(100vh-12rem)]">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
