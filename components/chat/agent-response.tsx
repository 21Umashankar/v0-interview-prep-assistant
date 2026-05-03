"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Target, LineChart, Lightbulb, Users } from "lucide-react";
import type { AgentResponse } from "@/lib/types";

interface AgentResponseCardProps {
  response: AgentResponse;
}

const agentConfig = {
  manager: {
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    label: "Manager Agent",
  },
  planner: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    label: "Planner Agent",
  },
  analyzer: {
    icon: LineChart,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    label: "Analyzer Agent",
  },
  recommendation: {
    icon: Lightbulb,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    label: "Recommendation Agent",
  },
};

export function AgentResponseCard({ response }: AgentResponseCardProps) {
  const config = agentConfig[response.agent];
  const Icon = config.icon;

  return (
    <Card className={`border ${config.borderColor} bg-card`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-1.5 ${config.bgColor}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <CardTitle className="text-sm font-medium text-foreground">
              {response.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${config.borderColor} ${config.color}`}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
          {response.content}
        </pre>
      </CardContent>
    </Card>
  );
}
