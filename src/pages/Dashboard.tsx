import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, TrendingUp, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const recentResumes = [
    { name: "Software Engineer Resume", date: "2 days ago", score: 85 },
    { name: "Product Manager Resume", date: "1 week ago", score: 78 },
    { name: "Data Analyst Resume", date: "2 weeks ago", score: 92 }
  ];

  const recentInterviews = [
    { role: "Senior Developer", date: "3 days ago", questions: 8, score: 82 },
    { role: "Frontend Engineer", date: "1 week ago", questions: 10, score: 75 },
    { role: "Tech Lead", date: "2 weeks ago", questions: 12, score: 88 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                Your{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Track your progress and continue where you left off
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resumes Created</p>
                      <p className="text-3xl font-bold mt-1">12</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-card flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mock Interviews</p>
                      <p className="text-3xl font-bold mt-1">8</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-card flex items-center justify-center">
                      <Video className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg ATS Score</p>
                      <p className="text-3xl font-bold mt-1">85%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-card flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Resumes
                    </CardTitle>
                    <Link to="/resume-builder">
                      <Button size="sm" variant="outline">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentResumes.map((resume, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-card flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{resume.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {resume.date}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-primary text-primary-foreground">
                          {resume.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Recent Interviews
                    </CardTitle>
                    <Link to="/mock-interview">
                      <Button size="sm" variant="outline">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInterviews.map((interview, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-card flex items-center justify-center">
                            <Video className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{interview.role}</p>
                            <p className="text-sm text-muted-foreground">
                              {interview.questions} questions • {interview.date}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {interview.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-2 border-primary/20 bg-gradient-card">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Ready to Continue?</h3>
                  <p className="text-muted-foreground">
                    Keep building your career success with AI-powered tools
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/resume-builder">
                      <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                        <FileText className="w-5 h-5 mr-2" />
                        Create Resume
                      </Button>
                    </Link>
                    <Link to="/mock-interview">
                      <Button size="lg" variant="outline">
                        <Video className="w-5 h-5 mr-2" />
                        Start Interview
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
