"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronRight } from "lucide-react";
import { companies } from "@/lib/data";

interface CompanySelectorProps {
  selectedCompany: string | null;
  onSelectCompany: (company: string) => void;
}

const difficultyColors = {
  Easy: "border-success/30 text-success",
  Medium: "border-warning/30 text-warning",
  Hard: "border-destructive/30 text-destructive",
};

export function CompanySelector({
  selectedCompany,
  onSelectCompany,
}: CompanySelectorProps) {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          Target Companies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {companies.map((company) => (
            <button
              key={company.name}
              onClick={() => onSelectCompany(company.name)}
              className={`group flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                selectedCompany === company.name
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                    selectedCompany === company.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {company.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.interviewRounds.length} rounds
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={difficultyColors[company.difficulty]}>
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
