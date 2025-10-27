import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Sparkles, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResumeBuilder = () => {
  const [atsScore, setAtsScore] = useState(78);
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
                        <div className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center space-y-4 hover:border-primary transition-colors cursor-pointer">
                          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-card flex items-center justify-center">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">Drop your resume here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </div>
                          <Button className="bg-gradient-primary">
                            Choose File
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Supports PDF, DOCX (Max 5MB)
                          </p>
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
                        />
                        <Button className="mt-4 bg-gradient-primary">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze Match
                        </Button>
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
                          <Label>Full Name</Label>
                          <Input placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Professional Summary</Label>
                          <Textarea 
                            placeholder="Write a compelling professional summary..."
                            className="min-h-[120px]"
                          />
                        </div>
                        <Button variant="outline" className="w-full">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with AI
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="optimize" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          AI Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                            <h4 className="font-medium mb-2">✨ Suggestion 1</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Add more action verbs to your work experience section
                            </p>
                            <Button size="sm" variant="outline">Apply</Button>
                          </div>
                          
                          <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                            <h4 className="font-medium mb-2">✨ Suggestion 2</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Include quantifiable achievements with metrics
                            </p>
                            <Button size="sm" variant="outline">Apply</Button>
                          </div>
                          
                          <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                            <h4 className="font-medium mb-2">✨ Suggestion 3</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Optimize keywords to match the job description
                            </p>
                            <Button size="sm" variant="outline">Apply</Button>
                          </div>
                        </div>
                        
                        <Button className="w-full bg-gradient-primary">
                          Apply All Suggestions
                        </Button>
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
                    <div className="text-center space-y-2">
                      <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {atsScore}%
                      </div>
                      <Badge variant={atsScore >= 80 ? "default" : "secondary"} className="bg-gradient-primary text-primary-foreground">
                        {atsScore >= 80 ? "Excellent" : "Good"}
                      </Badge>
                    </div>
                    
                    <Progress value={atsScore} className="h-2" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Keywords Match</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format Quality</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience Clarity</span>
                        <span className="font-medium">68%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[8.5/11] bg-muted rounded-lg border-2 border-border flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Resume preview</p>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
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

export default ResumeBuilder;
