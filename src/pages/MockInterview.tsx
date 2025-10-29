import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, RotateCcw, Sparkles, Loader2, CheckCircle } from "lucide-react";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const MockInterviewContent = () => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [currentResponse, setCurrentResponse] = useState("");
  const [feedback, setFeedback] = useState<{ [key: string]: any }>({});
  const [analyzing, setAnalyzing] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!role || !industry || !experienceLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create interview record
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .insert([{
          user_id: user.id,
          role,
          industry,
          experience_level: experienceLevel,
          job_description: jobDescription,
          status: 'in_progress'
        }])
        .select()
        .single();

      if (interviewError) throw interviewError;

      setInterviewId(interviewData.id);

      // Generate questions using AI
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { role, industry, experienceLevel, jobDescription }
      });

      if (error) throw error;

      // Save questions to database
      const questionsToInsert = data.questions.map((q: any, idx: number) => ({
        interview_id: interviewData.id,
        question_text: q.text,
        question_order: idx + 1,
        category: q.category
      }));

      const { error: questionsError } = await supabase
        .from('interview_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      setQuestions(data.questions);
      setInterviewStarted(true);
      toast.success(`Generated ${data.questions.length} questions!`);
    } catch (error: any) {
      console.error("Generate questions error:", error);
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentResponse.trim()) {
      toast.error("Please enter your response");
      return;
    }

    setAnalyzing(true);
    try {
      const currentQ = questions[currentQuestion];
      
      // Get AI feedback
      const { data, error } = await supabase.functions.invoke('analyze-interview-response', {
        body: {
          question: currentQ.text,
          response: currentResponse,
          category: currentQ.category
        }
      });

      if (error) throw error;

      // Save response and feedback
      setResponses({ ...responses, [currentQuestion]: currentResponse });
      setFeedback({ ...feedback, [currentQuestion]: data });

      toast.success("Response analyzed!");

      // Move to next question or finish
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentResponse("");
      } else {
        await completeInterview(data.score);
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze response");
    } finally {
      setAnalyzing(false);
    }
  };

  const completeInterview = async (finalScore: number) => {
    if (!interviewId) return;

    try {
      // Calculate average score
      const scores = Object.values(feedback).map((f: any) => f.score);
      scores.push(finalScore);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      // Update interview status
      const { error } = await supabase
        .from('interviews')
        .update({
          status: 'completed',
          overall_score: avgScore
        })
        .eq('id', interviewId);

      if (error) throw error;

      toast.success("Interview completed!");
    } catch (error: any) {
      console.error("Complete interview error:", error);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentResponse("");
    }
  };

  const getProgress = () => {
    if (questions.length === 0) return 0;
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavbar />
      
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
                      <Label>Role/Position *</Label>
                      <Input 
                        placeholder="e.g., Senior Software Engineer" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Industry *</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Experience Level *</Label>
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (5-10 years)</SelectItem>
                          <SelectItem value="lead">Lead/Manager (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Job Description (Optional)</Label>
                      <Textarea 
                        placeholder="Paste the job description to get tailored questions..."
                        className="min-h-[120px]"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-primary"
                      onClick={handleGenerateQuestions}
                      disabled={loading || !role || !industry || !experienceLevel}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Questions
                        </>
                      )}
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
                            8-10 questions customized for your role and industry
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-card flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Type Your Answers</h4>
                          <p className="text-sm text-muted-foreground">
                            Practice formulating clear, structured responses
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
                          <h4 className="font-medium">Track Your Progress</h4>
                          <p className="text-sm text-muted-foreground">
                            See your score and areas for improvement
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                      <p className="text-sm">
                        <strong>Pro Tip:</strong> Use the STAR method (Situation, Task, Action, Result) for behavioral questions
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
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
                          <Badge className="bg-gradient-primary text-primary-foreground">
                            {questions[currentQuestion]?.category}
                          </Badge>
                        </div>
                        <Progress value={getProgress()} className="h-2" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 bg-gradient-card rounded-lg border border-primary/20">
                        <p className="text-lg font-medium">{questions[currentQuestion]?.text}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Your Response</Label>
                        <Textarea
                          placeholder="Type your answer here... Use the STAR method for behavioral questions."
                          className="min-h-[200px]"
                          value={currentResponse}
                          onChange={(e) => setCurrentResponse(e.target.value)}
                        />
                      </div>
                      
                      {feedback[currentQuestion] && (
                        <div className="p-4 bg-gradient-card rounded-lg border border-primary/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">AI Feedback</h4>
                            <Badge variant="secondary">Score: {feedback[currentQuestion].score}/100</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feedback[currentQuestion].feedback}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <Button 
                          size="lg" 
                          className="bg-gradient-primary flex-1"
                          onClick={handleSubmitResponse}
                          disabled={analyzing || !currentResponse.trim()}
                        >
                          {analyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : currentQuestion === questions.length - 1 ? (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Finish Interview
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Submit & Next
                            </>
                          )}
                        </Button>
                        {currentQuestion < questions.length - 1 && (
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={handleSkip}
                          >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Skip
                          </Button>
                        )}
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
                                : responses[idx]
                                ? "border-green-500/50 bg-green-500/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setCurrentQuestion(idx)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Q{idx + 1}</p>
                              {responses[idx] && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <p className="font-medium">{role}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Industry:</span>
                        <p className="font-medium capitalize">{industry}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Level:</span>
                        <p className="font-medium capitalize">{experienceLevel}</p>
                      </div>
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

const MockInterview = () => {
  return (
    <ProtectedRoute>
      <MockInterviewContent />
    </ProtectedRoute>
  );
};

export default MockInterview;
