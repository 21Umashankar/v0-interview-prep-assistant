"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles } from "lucide-react";
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
  "Prepare for Amazon",
  "Improve my DSA skills",
  "Help with weak areas",
  "Prepare for TCS",
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
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

    // Simulate processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    const agentResponses = processUserInput(messageText, userProfile);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Here's what our AI agents have analyzed for you:",
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
    <Card className="flex h-full flex-col border-border bg-card overflow-hidden">
      <CardHeader className="shrink-0 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          AI Interview Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0 min-h-0">
        {/* Scrollable messages area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-background"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Start Your Interview Prep
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Tell me your goals and I&apos;ll coordinate multiple AI agents
                to create a personalized study plan.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestionPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:border-primary hover:text-foreground"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  {/* Message bubble */}
                  <div
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Agent response cards - stacked vertically for better readability */}
                  {message.agentResponses && (
                    <div className="ml-11 space-y-3">
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
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Agents processing...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Fixed input area */}
        <div className="shrink-0 border-t border-border bg-card p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about interview prep, company targets, weak areas..."
              className="flex-1 border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isProcessing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
