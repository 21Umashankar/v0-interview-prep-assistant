"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, ArrowDown } from "lucide-react";
import { AgentResponseCard } from "./agent-response";
import { processUserInput } from "@/lib/agents";
import { userProfile } from "@/lib/data";
import type { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  onPractice?: (topic: string, subject: string) => void;
  onRevise?: (topic: string, subject: string) => void;
  onTest?: (topic?: string) => void;
  onSyncProfile?: () => void;
}

const suggestionPrompts = [
  "Prepare for Amazon interview",
  "Improve my DSA skills",
  "Help with my weak areas",
  "Create a study plan for TCS",
];

export function ChatInterface({
  onPractice,
  onRevise,
  onTest,
  onSyncProfile,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user has scrolled up
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Smooth scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll only when a new message is added and user is near bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
      // Only auto-scroll if user is already near the bottom
      if (isNearBottom) {
        scrollToBottom("smooth");
      } else {
        // Show button to scroll down
        setShowScrollButton(true);
      }
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Scroll to show user message
    setTimeout(() => scrollToBottom("smooth"), 100);

    // Simulate processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const agentResponses = processUserInput(messageText, userProfile);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Here is what our AI agents have analyzed for you:",
      timestamp: new Date(),
      agentResponses,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-foreground">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold">AI Interview Assistant</div>
              <div className="text-sm font-normal text-muted-foreground">
                Multi-agent system to help you prepare for interviews
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Chat Container */}
      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          <div className="flex flex-col h-[600px]">
            {/* Scrollable messages area */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto"
            >
              {messages.length === 0 ? (
                /* Empty state - centered welcome */
                <div className="flex h-full flex-col items-center justify-center px-6 py-16">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-foreground">
                    Start Your Interview Prep
                  </h3>
                  <p className="mt-3 max-w-md text-center text-base text-muted-foreground">
                    Tell me your goals and I will coordinate multiple AI agents
                    to create a personalized study plan for you.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {suggestionPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="lg"
                        className="border-border text-foreground hover:border-primary hover:bg-primary/5"
                        onClick={() => handleSendMessage(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages list */
                <div className="px-6 py-6 space-y-8">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-5">
                      {/* Message bubble */}
                      <div
                        className={`flex items-start gap-4 ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] ${
                            message.role === "user" ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`inline-block rounded-2xl px-5 py-3 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            <p className="text-base">{message.content}</p>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Agent response cards */}
                      {message.agentResponses && (
                        <div className="ml-14 space-y-4">
                          {message.agentResponses.map((response, index) => (
                            <AgentResponseCard
                              key={index}
                              response={response}
                              onPractice={onPractice}
                              onRevise={onRevise}
                              onTest={onTest}
                              onSyncProfile={onSyncProfile}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-secondary px-5 py-3">
                        <div className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                        </div>
                        <span className="text-base text-muted-foreground">
                          AI agents are analyzing your request...
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && messages.length > 0 && (
              <div className="relative">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => scrollToBottom("smooth")}
                  className="absolute -top-14 right-6 h-10 w-10 rounded-full shadow-lg border border-border"
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            {/* Input area */}
            <div className="border-t border-border bg-card p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about interview prep, company targets, weak areas..."
                  className="flex-1 h-12 text-base border-border bg-secondary text-foreground placeholder:text-muted-foreground rounded-xl px-4"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isProcessing}
                  className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
