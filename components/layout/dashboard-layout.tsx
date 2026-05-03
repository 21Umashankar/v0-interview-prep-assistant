"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  RefreshCw,
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  KeyRound,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  userEmail?: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "test", label: "Practice Test", icon: Target },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "profile", label: "Profile Sync", icon: RefreshCw },
  { id: "chat", label: "AI Assistant", icon: MessageSquare },
];

export function DashboardLayout({ 
  children, 
  activeTab, 
  onTabChange,
  userName = "User",
  userEmail = "user@example.com",
}: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleChangePassword = () => {
    router.push("/auth/change-password");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} w-64`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-semibold text-foreground">
                PrepAI
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:block"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section with dropdown */}
        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex w-full items-center gap-3 rounded-lg bg-secondary p-3 transition-colors hover:bg-secondary/80 ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-sm font-medium text-primary">
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="truncate text-sm font-medium text-foreground">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile profile dropdown */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
