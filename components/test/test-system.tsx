"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Trophy,
  Target,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { questionBank } from "@/lib/data";
import type { Question, TestResult } from "@/lib/types";

interface TestSystemProps {
  onTestComplete?: (result: TestResult) => void;
  preSelectedTopic?: string;
}

type TestState = "setup" | "running" | "completed";

export function TestSystem({ onTestComplete, preSelectedTopic }: TestSystemProps) {
  const [testState, setTestState] = useState<TestState>("setup");
  
  // Find subject for pre-selected topic
  const getSubjectForTopic = (topic: string): string => {
    const question = questionBank.find(q => q.topic === topic);
    return question?.subject || "all";
  };
  
  const [selectedSubject, setSelectedSubject] = useState<string>(() => 
    preSelectedTopic ? getSubjectForTopic(preSelectedTopic) : "all"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const subjects = ["all", "DSA", "DBMS", "Operating Systems", "Computer Networks", "Aptitude"];
  const difficulties = ["all", "Easy", "Medium", "Hard"];

  // Timer effect
  useEffect(() => {
    if (testState !== "running" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFilteredQuestions = useCallback(() => {
    return questionBank.filter((q) => {
      const subjectMatch = selectedSubject === "all" || q.subject === selectedSubject;
      const difficultyMatch = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      return subjectMatch && difficultyMatch;
    });
  }, [selectedSubject, selectedDifficulty]);

  const startTest = () => {
    const filtered = getFilteredQuestions();
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    if (selected.length === 0) {
      alert("No questions available for selected criteria");
      return;
    }

    setCurrentQuestions(selected);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(selected.length * 60); // 1 minute per question
    setTestState("running");
    setTestResult(null);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmitTest = useCallback(() => {
    const answers = currentQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] ?? -1,
      isCorrect: selectedAnswers[q.id] === q.correctAnswer,
    }));

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const timeTaken = (currentQuestions.length * 60) - timeLeft;

    const result: TestResult = {
      id: Date.now().toString(),
      date: new Date(),
      subject: selectedSubject === "all" ? "Mixed" : selectedSubject,
      topics: [...new Set(currentQuestions.map((q) => q.topic))],
      totalQuestions: currentQuestions.length,
      correctAnswers: correctCount,
      score,
      accuracy: score,
      timeTaken,
      answers,
    };

    setTestResult(result);
    setTestState("completed");
    onTestComplete?.(result);
  }, [currentQuestions, selectedAnswers, timeLeft, selectedSubject, onTestComplete]);

  const resetTest = () => {
    setTestState("setup");
    setCurrentQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestResult(null);
    setShowExplanation(false);
  };

  const availableQuestions = getFilteredQuestions().length;

  if (testState === "setup") {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5 text-primary" />
            Start a Practice Test
          </CardTitle>
          <CardDescription>Configure your test settings and challenge yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "all" ? "All Subjects" : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="border-border bg-secondary text-foreground">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff === "all" ? "All Levels" : diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Number of Questions</Label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((count) => (
                <Button
                  key={count}
                  variant={questionCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestionCount(count)}
                  disabled={count > availableQuestions}
                  className={questionCount === count ? "bg-primary text-primary-foreground" : "border-border"}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Available Questions</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {availableQuestions} questions
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Time: {Math.min(questionCount, availableQuestions)} minutes
              </span>
            </div>
          </div>

          <Button
            onClick={startTest}
            disabled={availableQuestions === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (testState === "running") {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Question {currentQuestionIndex + 1}/{currentQuestions.length}
              </Badge>
              <Badge
                variant="outline"
                className={
                  currentQuestion.difficulty === "Easy"
                    ? "border-chart-1/30 text-chart-1"
                    : currentQuestion.difficulty === "Medium"
                    ? "border-chart-3/30 text-chart-3"
                    : "border-destructive/30 text-destructive"
                }
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
              <Clock className={`h-4 w-4 ${timeLeft <= 60 ? "text-destructive" : "text-primary"}`} />
              <span className={`font-mono text-sm font-medium ${timeLeft <= 60 ? "text-destructive" : "text-foreground"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Badge variant="secondary" className="mb-2">
              {currentQuestion.subject} - {currentQuestion.topic}
            </Badge>
            <p className="text-lg font-medium text-foreground">{currentQuestion.question}</p>
          </div>

          <RadioGroup
            value={selectedAnswers[currentQuestion.id]?.toString() ?? ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                  selectedAnswers[currentQuestion.id] === index
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/50 hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-primary" />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="border-border"
            >
              Previous
            </Button>
            {currentQuestionIndex === currentQuestions.length - 1 ? (
              <Button onClick={handleSubmitTest} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {currentQuestions.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 w-8 p-0 ${
                  selectedAnswers[currentQuestions[index].id] !== undefined
                    ? "border-primary bg-primary/20 text-primary"
                    : index === currentQuestionIndex
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed state
  if (testResult) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Trophy className={`h-5 w-5 ${testResult.score >= 70 ? "text-primary" : "text-chart-3"}`} />
            Test Completed
          </CardTitle>
          <CardDescription>Review your performance and learn from mistakes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Overview */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{testResult.score}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-chart-1">{testResult.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{testResult.totalQuestions - testResult.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{formatTime(testResult.timeTaken)}</p>
              <p className="text-xs text-muted-foreground">Time Taken</p>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`rounded-lg p-4 ${
            testResult.score >= 80 
              ? "border border-primary/30 bg-primary/10" 
              : testResult.score >= 60 
              ? "border border-chart-3/30 bg-chart-3/10" 
              : "border border-destructive/30 bg-destructive/10"
          }`}>
            <div className="flex items-start gap-3">
              {testResult.score >= 80 ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
              ) : testResult.score >= 60 ? (
                <AlertCircle className="mt-0.5 h-5 w-5 text-chart-3" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {testResult.score >= 80 
                    ? "Excellent work!" 
                    : testResult.score >= 60 
                    ? "Good effort, keep practicing!" 
                    : "Need more practice on these topics"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Topics covered: {testResult.topics.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Explanations */}
          <Button
            variant="outline"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full border-border"
          >
            {showExplanation ? "Hide" : "Show"} Detailed Answers
          </Button>

          {/* Answer Review */}
          {showExplanation && (
            <div className="space-y-4">
              {currentQuestions.map((q, index) => {
                const answer = testResult.answers[index];
                return (
                  <div
                    key={q.id}
                    className={`rounded-lg border p-4 ${
                      answer.isCorrect ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                        ) : (
                          <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                        )}
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">Q{index + 1}: {q.question}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              Your answer:{" "}
                              <span className={answer.isCorrect ? "text-primary" : "text-destructive"}>
                                {answer.selectedAnswer >= 0 ? q.options[answer.selectedAnswer] : "Not answered"}
                              </span>
                            </p>
                            {!answer.isCorrect && (
                              <p className="text-primary">
                                Correct answer: {q.options[q.correctAnswer]}
                              </p>
                            )}
                            {q.explanation && (
                              <p className="mt-2 text-muted-foreground italic">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{q.topic}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button onClick={resetTest} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <RotateCcw className="mr-2 h-4 w-4" />
            Take Another Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
