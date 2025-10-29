import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, TrendingUp, Clock } from "lucide-react";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DashboardContent = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalInterviews: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch resumes
      const { data: resumesData, error: resumesError } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (resumesError) throw resumesError;

      // Fetch interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (interviewsError) throw interviewsError;

      setResumes(resumesData || []);
      setInterviews(interviewsData || []);

      // Calculate stats
      const totalResumes = resumesData?.length || 0;
      const totalInterviews = interviewsData?.length || 0;
      const avgScore = resumesData && resumesData.length > 0
        ? Math.round(
            resumesData
              .filter((r) => r.ats_score)
              .reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumesData.length
          )
        : 0;

      setStats({ totalResumes, totalInterviews, avgScore });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNavbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavbar />
      
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
                      <p className="text-3xl font-bold mt-1">{stats.totalResumes}</p>
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
                      <p className="text-3xl font-bold mt-1">{stats.totalInterviews}</p>
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
                      <p className="text-3xl font-bold mt-1">{stats.avgScore}%</p>
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
                  {resumes.length > 0 ? (
                    <div className="space-y-4">
                      {resumes.map((resume) => (
                        <div 
                          key={resume.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-card flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{resume.title}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(resume.created_at)}
                              </p>
                            </div>
                          </div>
                          {resume.ats_score && (
                            <Badge className="bg-gradient-primary text-primary-foreground">
                              {resume.ats_score}%
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No resumes yet. Create your first one!</p>
                    </div>
                  )}
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
                  {interviews.length > 0 ? (
                    <div className="space-y-4">
                      {interviews.map((interview) => (
                        <div 
                          key={interview.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-card flex items-center justify-center">
                              <Video className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">{interview.role}</p>
                              <p className="text-sm text-muted-foreground">
                                {interview.industry} • {formatDate(interview.created_at)}
                              </p>
                            </div>
                          </div>
                          {interview.overall_score && (
                            <Badge variant="secondary">
                              {interview.overall_score}%
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No interviews yet. Start practicing!</p>
                    </div>
                  )}
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

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default Dashboard;
