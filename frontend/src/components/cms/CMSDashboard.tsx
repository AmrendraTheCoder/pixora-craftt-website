import React, { useState } from "react";
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
import { useTheme } from "@/contexts/ThemeContext";
import { useCMS } from "@/contexts/CMSContext";
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
} from "lucide-react";

const CMSDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const { services, projects, testimonials } = useCMS();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalServices: services.length,
    activeServices: services.filter((s) => s.isActive).length,
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.isActive).length,
    totalTestimonials: testimonials.length,
    activeTestimonials: testimonials.filter((t) => t.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  CMS Dashboard
                </h1>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                Google Cloud Style
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
                <Moon className="h-4 w-4" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Site
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
            <TabsTrigger
              value="testimonials"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Testimonials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Services
                  </CardTitle>
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.activeServices}/{stats.totalServices}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Active services
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Projects
                  </CardTitle>
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.activeProjects}/{stats.totalProjects}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Active projects
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Testimonials
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.activeTestimonials}/{stats.totalTestimonials}
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Active testimonials
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your content with these quick actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab("services")}
                    className="h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Plus className="h-5 w-5" />
                    Add New Service
                  </Button>
                  <Button
                    onClick={() => setActiveTab("projects")}
                    className="h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Plus className="h-5 w-5" />
                    Add New Project
                  </Button>
                  <Button
                    onClick={() => setActiveTab("testimonials")}
                    className="h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Plus className="h-5 w-5" />
                    Add Testimonial
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates to your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...services, ...projects, ...testimonials]
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                    )
                    .slice(0, 5)
                    .map((item) => {
                      const type =
                        "features" in item
                          ? "Service"
                          : "category" in item
                            ? "Project"
                            : "Testimonial";
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                item.isActive ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            <div>
                              <p className="font-medium">
                                {item.title ||
                                  ("name" in item ? item.name : "")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {type} • Updated{" "}
                                {new Date(item.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={item.isActive ? "default" : "secondary"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      );
                    })}
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
