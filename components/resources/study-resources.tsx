"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  BookOpen,
  Video,
  Code2,
  FileText,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { studyResources } from "@/lib/data";
import type { TopicResources, StudyResource } from "@/lib/types";

interface StudyResourcesProps {
  recommendedTopic?: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  LeetCode: <Code2 className="h-4 w-4" />,
  GeeksforGeeks: <FileText className="h-4 w-4" />,
  YouTube: <Video className="h-4 w-4" />,
  HackerRank: <Code2 className="h-4 w-4" />,
  InterviewBit: <Code2 className="h-4 w-4" />,
};

const platformColors: Record<string, string> = {
  LeetCode: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  GeeksforGeeks: "border-chart-1/30 bg-chart-1/10 text-chart-1",
  YouTube: "border-destructive/30 bg-destructive/10 text-destructive",
  HackerRank: "border-chart-1/30 bg-chart-1/10 text-chart-1",
  InterviewBit: "border-chart-2/30 bg-chart-2/10 text-chart-2",
};

const typeColors: Record<string, string> = {
  video: "border-destructive/30 text-destructive",
  article: "border-chart-2/30 text-chart-2",
  practice: "border-chart-1/30 text-chart-1",
};

export function StudyResources({ recommendedTopic }: StudyResourcesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const subjects = ["all", ...new Set(studyResources.map((r) => r.subject))];

  const filteredResources = studyResources.filter((topicResource) => {
    const matchesSubject = selectedSubject === "all" || topicResource.subject === selectedSubject;
    const matchesSearch = 
      searchQuery === "" ||
      topicResource.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topicResource.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Sort to put recommended topic first
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (recommendedTopic) {
      if (a.topic === recommendedTopic) return -1;
      if (b.topic === recommendedTopic) return 1;
    }
    return 0;
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Study Resources
        </CardTitle>
        <CardDescription>
          Curated learning materials for all interview topics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Subject Tabs */}
        <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
          <TabsList className="flex h-auto flex-wrap bg-secondary">
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject}
                value={subject}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {subject === "all" ? "All Topics" : subject}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedSubject} className="mt-4">
            {sortedResources.length === 0 ? (
              <div className="rounded-lg border border-border bg-secondary/50 p-8 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-foreground">No resources found</p>
                <p className="text-sm text-muted-foreground">Try a different search or filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedResources.map((topicResource) => (
                  <TopicResourceCard
                    key={`${topicResource.subject}-${topicResource.topic}`}
                    topicResource={topicResource}
                    isRecommended={topicResource.topic === recommendedTopic}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TopicResourceCard({
  topicResource,
  isRecommended,
}: {
  topicResource: TopicResources;
  isRecommended?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isRecommended);

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isRecommended ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${isRecommended ? "bg-primary/20" : "bg-secondary"}`}>
            <BookOpen className={`h-4 w-4 ${isRecommended ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{topicResource.topic}</p>
              {isRecommended && (
                <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{topicResource.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border text-muted-foreground">
            {topicResource.resources.length} resources
          </Badge>
          <span className="text-muted-foreground">{isExpanded ? "−" : "+"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border p-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {topicResource.resources.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: StudyResource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/80 ${platformColors[resource.platform] || "border-border bg-secondary/50"}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
        {platformIcons[resource.platform]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{resource.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${typeColors[resource.type]}`}>
            {resource.type}
          </Badge>
          {resource.difficulty && (
            <Badge
              variant="outline"
              className={`text-xs ${
                resource.difficulty === "Easy"
                  ? "border-chart-1/30 text-chart-1"
                  : resource.difficulty === "Medium"
                  ? "border-chart-3/30 text-chart-3"
                  : "border-destructive/30 text-destructive"
              }`}
            >
              {resource.difficulty}
            </Badge>
          )}
        </div>
      </div>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </a>
  );
}
