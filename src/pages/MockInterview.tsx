import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Video, Play, RotateCcw, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

const MockInterview = () => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    "Tell me about yourself and your professional background.",
    "What are your greatest strengths and how do they apply to this role?",
    "Describe a challenging project you worked on and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this position?"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AI Mock Interview
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Practice with AI-generated questions and get instant feedback
              </p>
            </div>

            {!interviewStarted ? (
              /* Setup Panel */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Role/Position</Label>
                      <Input placeholder="e.g., Senior Software Engineer" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="lead">Lead/Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Job Description (Optional)</Label>
                      <Textarea 
                        placeholder="Paste the job description to get tailored questions..."
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-primary"
                      onClick={() => setInterviewStarted(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>What to Expect</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-card flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">AI-Generated Questions</h4>
                          <p className="text-sm text-muted-foreground">
                            5-10 questions customized for your role and industry
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-card flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Record Your Answers</h4>
                          <p className="text-sm text-muted-foreground">
                            Practice speaking your responses naturally
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-card flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Get Instant Feedback</h4>
                          <p className="text-sm text-muted-foreground">
                            AI analyzes your responses and provides improvement tips
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-card flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Review & Improve</h4>
                          <p className="text-sm text-muted-foreground">
                            Track your progress and refine your interview skills
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                      <p className="text-sm">
                        <strong>Pro Tip:</strong> Enable your microphone and camera for the most realistic practice experience
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Interview Session */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
                        <Badge className="bg-gradient-primary text-primary-foreground">In Progress</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="aspect-video bg-muted rounded-lg border-2 border-border flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <Video className="w-16 h-16 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-card rounded-lg border border-primary/20">
                        <p className="text-lg font-medium">{questions[currentQuestion]}</p>
                      </div>
                      
                      <div className="flex gap-3 justify-center">
                        <Button size="lg" className="bg-gradient-primary">
                          <Mic className="w-5 h-5 mr-2" />
                          Start Recording
                        </Button>
                        <Button size="lg" variant="outline">
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Skip
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {questions.map((q, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              idx === currentQuestion 
                                ? "border-primary bg-gradient-card" 
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setCurrentQuestion(idx)}
                          >
                            <p className="text-sm font-medium">Q{idx + 1}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" variant="outline">
                        Pause Interview
                      </Button>
                      <Button className="w-full" variant="destructive">
                        End Interview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MockInterview;
