"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronRight } from "lucide-react";
import { companies } from "@/lib/data";
import type { CompanyProfile } from "@/lib/types";

interface CompanySelectorProps {
  selectedCompany: string | null;
  onSelectCompany: (company: string) => void;
}

const difficultyColors = {
  Easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  Medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Hard: "text-destructive border-destructive/30 bg-destructive/10",
};

export function CompanySelector({
  selectedCompany,
  onSelectCompany,
}: CompanySelectorProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Building2 className="h-5 w-5 text-primary" />
          Target Companies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((company) => (
            <button
              key={company.name}
              onClick={() => onSelectCompany(company.name)}
              className={`group flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                selectedCompany === company.name
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-lg font-bold text-primary">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.interviewRounds.length} rounds
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={difficultyColors[company.difficulty]}
                >
                  {company.difficulty}
                </Badge>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    selectedCompany === company.name
                      ? "text-primary"
                      : "text-muted-foreground group-hover:translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
