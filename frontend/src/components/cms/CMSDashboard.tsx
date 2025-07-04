import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { cmsService, Service, Project, Testimonial } from "@/lib/backend";
import { ServiceManager } from "./ServiceManager";
import { ProjectManager } from "./ProjectManager";
import { TestimonialManager } from "./TestimonialManager";
import {
  Settings,
  BarChart3,
  Users,
  FileText,
  Image,
  Moon,
  Sun,
  Plus,
  Eye,
  EyeOff,
  TrendingUp,
  Globe,
  Calendar,
  Activity,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Heart,
  MessageSquare,
  Layers,
  Zap,
  Target,
  Award,
} from "lucide-react";

const CMSDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalServices: 0,
    totalProjects: 0,
    totalTestimonials: 0,
    activeServices: 0,
    activeProjects: 0,
    activeTestimonials: 0,
    monthlyGrowth: 0,
    engagementRate: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [services, projects, testimonials]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [servicesData, projectsData, testimonialsData] = await Promise.all([
        cmsService.getServices(),
        cmsService.getProjects(),
        cmsService.getTestimonials(),
      ]);
      
      setServices(servicesData);
      setProjects(projectsData);
      setTestimonials(testimonialsData);
      
      toast({
        title: "Data Loaded",
        description: "All content has been successfully loaded.",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Load Error",
        description: "Some data may not be available.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const activeServices = services.filter(s => s.isActive).length;
    const activeProjects = projects.filter(p => p.isActive).length;
    const activeTestimonials = testimonials.filter(t => t.isActive).length;
    
    // Mock analytics data
    setAnalytics({
      totalViews: 15847,
      totalServices: services.length,
      totalProjects: projects.length,
      totalTestimonials: testimonials.length,
      activeServices,
      activeProjects,
      activeTestimonials,
      monthlyGrowth: 18.5,
      engagementRate: 76.3,
    });
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const getContentHealth = () => {
    const totalContent = services.length + projects.length + testimonials.length;
    const activeContent = analytics.activeServices + analytics.activeProjects + analytics.activeTestimonials;
    
    if (totalContent === 0) return { status: "empty", percentage: 0, message: "No content yet" };
    
    const percentage = (activeContent / totalContent) * 100;
    
    if (percentage >= 80) return { status: "excellent", percentage, message: "Excellent content health" };
    if (percentage >= 60) return { status: "good", percentage, message: "Good content health" };
    if (percentage >= 40) return { status: "fair", percentage, message: "Fair content health" };
    return { status: "poor", percentage, message: "Needs attention" };
  };

  const contentHealth = getContentHealth();

  const recentActivity = [
    ...services.map(s => ({ ...s, type: 'service', updatedAt: s.updatedAt })),
    ...projects.map(p => ({ ...p, type: 'project', updatedAt: p.updatedAt })),
    ...testimonials.map(t => ({ ...t, type: 'testimonial', updatedAt: t.updatedAt })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'project':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'testimonial':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="border-b bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    CMS Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Content Management System
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Globe className="h-3 w-3 mr-1" />
                  Live Content
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    contentHealth.status === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                    contentHealth.status === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    contentHealth.status === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {contentHealth.message}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Sun className="h-4 w-4 text-yellow-500" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  size="sm"
                />
                <Moon className="h-4 w-4 text-blue-500" />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Site
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Testimonials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Views */}
              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{analytics.monthlyGrowth}% this month
                  </p>
                </CardContent>
              </Card>

              {/* Services */}
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Services</CardTitle>
                  <Settings className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.activeServices}/{analytics.totalServices}
                  </div>
                  <p className="text-xs text-gray-600">Active services</p>
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Projects</CardTitle>
                  <FileText className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.activeProjects}/{analytics.totalProjects}
                  </div>
                  <p className="text-xs text-gray-600">Active projects</p>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Testimonials</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.activeTestimonials}/{analytics.totalTestimonials}
                  </div>
                  <p className="text-xs text-gray-600">Active testimonials</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Health & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content Health */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Content Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Health</span>
                      <span className="font-medium">{contentHealth.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          contentHealth.status === 'excellent' ? 'bg-green-500' :
                          contentHealth.status === 'good' ? 'bg-blue-500' :
                          contentHealth.status === 'fair' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${contentHealth.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Engagement Rate</span>
                      <span className="font-semibold">{analytics.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Content Quality</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        High
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">SEO Score</span>
                      <span className="font-semibold">92/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Manage your content with these quick actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setActiveTab("services")}
                      className="h-20 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      variant="outline"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Service</span>
                      <span className="text-xs text-blue-600">{analytics.totalServices} total</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("projects")}
                      className="h-20 flex flex-col gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                      variant="outline"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Project</span>
                      <span className="text-xs text-green-600">{analytics.totalProjects} total</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("testimonials")}
                      className="h-20 flex flex-col gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200"
                      variant="outline"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Testimonial</span>
                      <span className="text-xs text-yellow-600">{analytics.totalTestimonials} total</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest updates to your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    ) : (
                      recentActivity.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.title || ('name' in item ? item.name : 'Unknown')}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="capitalize">{item.type}</span>
                              <span>•</span>
                              <span>{formatDate(item.updatedAt)}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge
                              variant={item.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Content performance overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Content Completion</span>
                        <span className="text-sm font-medium">{contentHealth.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${contentHealth.percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">User Engagement</span>
                        <span className="text-sm font-medium">{analytics.engagementRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${analytics.engagementRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{analytics.totalViews.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Total Views</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics.activeServices + analytics.activeProjects + analytics.activeTestimonials}
                        </p>
                        <p className="text-xs text-gray-600">Active Content</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-semibold text-green-600">+{analytics.monthlyGrowth}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Load Time</span>
                        <span className="font-semibold">1.2s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Mobile Score</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Award className="h-3 w-3 mr-1" />
                          Excellent
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  Content Summary
                </CardTitle>
                <CardDescription>
                  Overview of all your content types and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Settings className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">Services</h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 my-2">
                      {analytics.totalServices}
                    </p>
                    <p className="text-sm text-blue-600">
                      {analytics.activeServices} active • {analytics.totalServices - analytics.activeServices} draft
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-700 dark:text-green-300">Projects</h3>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100 my-2">
                      {analytics.totalProjects}
                    </p>
                    <p className="text-sm text-green-600">
                      {analytics.activeProjects} active • {analytics.totalProjects - analytics.activeProjects} draft
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Testimonials</h3>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 my-2">
                      {analytics.totalTestimonials}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {analytics.activeTestimonials} active • {analytics.totalTestimonials - analytics.activeTestimonials} draft
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <ServiceManager />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManager />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CMSDashboard;
