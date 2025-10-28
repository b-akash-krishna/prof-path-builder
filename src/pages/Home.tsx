import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Zap, Target, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: "ATS-Optimized Resumes",
      description: "Create resumes that pass Applicant Tracking Systems with AI-powered optimization",
      color: "text-primary"
    },
    {
      icon: Video,
      title: "Mock Interviews",
      description: "Practice with AI-generated questions tailored to your target role and industry",
      color: "text-accent"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get real-time suggestions to improve your resume content and interview responses",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "Role-Specific",
      description: "Customized content based on your target job description and requirements",
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your improvement over time with detailed analytics and insights",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays secure with self-hosted deployment options available",
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${heroBg})` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-gradient-primary text-primary-foreground border-0 px-4 py-1">
              AI-Powered Career Tools
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Land Your Dream Job with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Resume & Interview Prep
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create ATS-friendly resumes and ace your interviews with intelligent, 
              personalized AI assistance. No expensive APIs required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8">
                  Build Your Resume
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Practice Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }}></div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to help you stand out in the competitive job market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-glow">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Card className="border-2 border-primary/20 bg-gradient-card">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to Transform Your Career?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of job seekers who have improved their applications with AI-powered tools
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                    Get Started Free
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
