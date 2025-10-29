import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Sparkles, Download, Loader2 } from "lucide-react";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResumeBuilderContent = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setResumeTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      toast.success("File selected successfully");
    }
  };

  const uploadResumeFile = async () => {
    if (!file) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const parseResumeText = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    try {
      // For now, use a simple text extraction
      // In production, you'd use a proper PDF/DOCX parser
      const text = await file.text();
      setResumeText(text);
      toast.success("Resume text extracted");
      setActiveTab("edit");
    } catch (error) {
      toast.error("Failed to parse resume. Please enter text manually.");
      setActiveTab("edit");
    } finally {
      setLoading(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error("Please enter resume text first");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText, jobDescription }
      });

      if (error) throw error;

      setAnalysis(data);
      
      // Save to database
      const fileUrl = file ? await uploadResumeFile() : null;
      
      const { data: resumeData, error: saveError } = await supabase
        .from('resumes')
        .insert([{
          user_id: user.id,
          title: resumeTitle || "Untitled Resume",
          content: { text: resumeText },
          file_url: fileUrl,
          ats_score: data.atsScore,
          job_description: jobDescription
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      setCurrentResumeId(resumeData.id);
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const optimizeResume = async () => {
    if (!resumeText.trim()) {
      toast.error("Please analyze your resume first");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-resume', {
        body: { 
          resumeText, 
          jobDescription,
          targetImprovement: "overall"
        }
      });

      if (error) throw error;

      setOptimization(data);
      toast.success("Optimization suggestions generated!");
      setActiveTab("optimize");
    } catch (error: any) {
      console.error("Optimization error:", error);
      toast.error(error.message || "Failed to optimize resume");
    } finally {
      setLoading(false);
    }
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
                AI-Powered{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Resume Builder
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Create ATS-optimized resumes that get you noticed by recruiters
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Tools */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="optimize">Optimize</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          Upload Your Resume
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="resume-title">Resume Title</Label>
                            <Input
                              id="resume-title"
                              placeholder="e.g., Software Engineer Resume"
                              value={resumeTitle}
                              onChange={(e) => setResumeTitle(e.target.value)}
                            />
                          </div>

                          <div className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center space-y-4 hover:border-primary transition-colors">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-card flex items-center justify-center">
                              <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <p className="text-lg font-medium">
                                {file ? file.name : "Drop your resume here"}
                              </p>
                              <p className="text-sm text-muted-foreground">or click to browse</p>
                            </div>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="file-upload"
                            />
                            <label htmlFor="file-upload">
                              <Button className="bg-gradient-primary" asChild>
                                <span>Choose File</span>
                              </Button>
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF, DOCX (Max 5MB)
                            </p>
                          </div>

                          {file && (
                            <Button 
                              onClick={parseResumeText} 
                              disabled={loading}
                              className="w-full"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Parsing...
                                </>
                              ) : (
                                "Continue to Edit"
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Paste Job Description (Optional)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          placeholder="Paste the job description here to get personalized optimization suggestions..."
                          className="min-h-[200px]"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="edit" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Edit Resume Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Resume Text</Label>
                          <Textarea 
                            placeholder="Paste or type your resume content here..."
                            className="min-h-[400px] font-mono text-sm"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={analyzeResume}
                            disabled={loading || !resumeText.trim()}
                            className="bg-gradient-primary flex-1"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze with AI
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={optimizeResume}
                            disabled={loading || !resumeText.trim()}
                            variant="outline"
                          >
                            {loading ? "Processing..." : "Get Suggestions"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="optimize" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          AI Optimization Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {optimization ? (
                          <>
                            {optimization.improvements && optimization.improvements.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-semibold">Key Improvements:</h4>
                                {optimization.improvements.map((improvement: string, idx: number) => (
                                  <div key={idx} className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                                    <p className="text-sm">{improvement}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {optimization.addedKeywords && optimization.addedKeywords.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold">Recommended Keywords:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {optimization.addedKeywords.map((keyword: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Click "Get Suggestions" to generate AI-powered optimization tips</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Panel - ATS Score & Preview */}
              <div className="space-y-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle>ATS Score</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis ? (
                      <>
                        <div className="text-center space-y-2">
                          <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {analysis.atsScore}%
                          </div>
                          <Badge variant={analysis.atsScore >= 80 ? "default" : "secondary"} className="bg-gradient-primary text-primary-foreground">
                            {analysis.atsScore >= 80 ? "Excellent" : analysis.atsScore >= 60 ? "Good" : "Needs Work"}
                          </Badge>
                        </div>
                        
                        <Progress value={analysis.atsScore} className="h-2" />
                        
                        <div className="space-y-2 text-sm">
                          {analysis.keywordMatch !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Keywords Match</span>
                              <span className="font-medium">{analysis.keywordMatch}%</span>
                            </div>
                          )}
                        </div>

                        {analysis.strengths && analysis.strengths.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Strengths:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {analysis.strengths.slice(0, 3).map((strength: string, idx: number) => (
                                <li key={idx}>✓ {strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Areas to Improve:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {analysis.weaknesses.slice(0, 3).map((weakness: string, idx: number) => (
                                <li key={idx}>→ {weakness}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Upload and analyze your resume to see ATS score</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const ResumeBuilder = () => {
  return (
    <ProtectedRoute>
      <ResumeBuilderContent />
    </ProtectedRoute>
  );
};

export default ResumeBuilder;
