"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 lg:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} w-64`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                PrepAI
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:block"
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
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className={`flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {navItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
