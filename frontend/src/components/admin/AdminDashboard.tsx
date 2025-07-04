import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { authService, adminService, Contact } from "@/lib/backend";
import {
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Filter,
  Search,
  Download,
  Shield,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  LogOut,
  Building,
  Star,
  Activity,
  Zap,
  Target,
  Award,
  Bell,
  Plus,
} from "lucide-react";

const AdminDashboard = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false); // Data loading state
  const [loginLoading, setLoginLoading] = useState(false); // Login loading state
  const [initializing, setInitializing] = useState(true); // Initial app load state
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState({
    totalContacts: 0,
    newContacts: 0,
    contactedContacts: 0,
    completedContacts: 0,
    monthlyGrowth: 0,
    responseRate: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterContacts();
  }, [contacts, statusFilter, searchQuery]);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setInitializing(false); // Done checking auth
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      // Try real authentication first, fallback to demo
      let result = await authService.login(loginForm.email, loginForm.password);
      
      if (!result.success) {
        // Use demo login for testing
        result = await authService.demoLogin();
      }
      
      if (result.success) {
        setIsAuthenticated(true);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard!",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setContacts([]);
    setAnalytics({
      totalContacts: 0,
      newContacts: 0,
      contactedContacts: 0,
      completedContacts: 0,
      monthlyGrowth: 0,
      responseRate: 0,
    });
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await adminService.getAnalytics();
      const contactedCount = contacts.filter(c => c.status === "contacted").length;
      const completedCount = contacts.filter(c => c.status === "completed").length;
      
      setAnalytics({
        totalContacts: data.totalContacts || contacts.length,
        newContacts: data.newContacts || contacts.filter(c => c.status === "new").length,
        contactedContacts: contactedCount,
        completedContacts: completedCount,
        monthlyGrowth: 12.5, // Mock data
        responseRate: contactedCount > 0 ? (completedCount / contactedCount) * 100 : 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredContacts(filtered);
  };

  const handleStatusUpdate = async (contactId: string, newStatus: Contact['status']) => {
    try {
      await adminService.updateContactStatus(contactId, newStatus);
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, status: newStatus, updatedAt: new Date().toISOString() }
          : contact
      ));
      toast({
        title: "Status Updated",
        description: `Contact status updated to ${newStatus}`,
      });
      fetchAnalytics();
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-600";
      case "contacted":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-600";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-600";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />;
      case "contacted":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading spinner while initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl relative z-10">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Admin Portal
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Pixora Craftt Management System
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@pixora-craftt.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-medium"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-medium">Demo Credentials</span>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-sm space-y-1">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">Quick Access:</p>
                <p className="text-blue-700 dark:text-blue-300"><strong>Email:</strong> admin@pixora-craftt.com</p>
                <p className="text-blue-700 dark:text-blue-300"><strong>Password:</strong> AdminPassword123!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-indigo-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Header */}
      <div className="border-b bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Pixora Craftt Management Portal
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-sm px-3 py-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                  Live System
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-sm px-3 py-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {analytics.totalContacts} Contacts
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchContacts}
                disabled={loading}
                className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[480px] mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <MessageSquare className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-semibold text-blue-100">Total Contacts</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-200">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2">
                    {analytics.totalContacts}
                  </div>
                  <p className="text-sm text-blue-100 flex items-center font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{analytics.monthlyGrowth}% this month
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-semibold text-amber-100">New Inquiries</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-200">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2">
                    {analytics.newContacts}
                  </div>
                  <p className="text-sm text-amber-100 font-medium">Awaiting response</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-semibold text-purple-100">In Progress</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-200">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2">
                    {analytics.contactedContacts}
                  </div>
                  <p className="text-sm text-purple-100 font-medium">Currently engaged</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-semibold text-emerald-100">Completed</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-200">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2">
                    {analytics.completedContacts}
                  </div>
                  <p className="text-sm text-emerald-100 font-medium">
                    {analytics.responseRate.toFixed(1)}% success rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {contacts.slice(0, 5).map((contact, index) => (
                      <div key={contact.id} className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 transform hover:scale-[1.02]">
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 rounded-full shadow-lg ${
                            contact.status === 'new' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            contact.status === 'contacted' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                            'bg-gradient-to-r from-emerald-400 to-green-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {contact.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {contact.email}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(contact.status)} font-medium shadow-sm`}>
                          {contact.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Response Rate</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{analytics.responseRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${analytics.responseRate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Monthly Growth</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{analytics.monthlyGrowth}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out delay-200" 
                          style={{ width: `${analytics.monthlyGrowth * 4}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.4h</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Avg Response</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{Math.floor(analytics.totalContacts * 0.3)}</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">This Week</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-8">
            {/* Enhanced Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts by name, email, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 rounded-xl transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">🔵 New</SelectItem>
                    <SelectItem value="contacted">🟡 Contacted</SelectItem>
                    <SelectItem value="completed">🟢 Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-12 px-4 border-2 border-gray-200 dark:border-gray-600 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-xl shadow-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Enhanced Contacts List */}
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <span>Contact Management</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-semibold px-3 py-1 shadow-sm">
                    {filteredContacts.length} contacts
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <RefreshCw className="h-8 w-8 text-white animate-spin" />
                      </div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading contacts...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch the latest data</p>
                    </div>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {searchQuery || statusFilter !== "all" ? "No matching contacts found" : "No contacts yet"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filter criteria." : "New inquiries will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="group relative border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.01] shadow-lg hover:shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                  contact.status === 'new' ? 'bg-blue-500' :
                                  contact.status === 'contacted' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {contact.name}
                                </h3>
                                <Badge variant="outline" className={`${getStatusColor(contact.status)} font-semibold shadow-sm`}>
                                  {getStatusIcon(contact.status)}
                                  <span className="ml-2 capitalize">{contact.status}</span>
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contact.email}</p>
                                </div>
                              </div>
                              
                              {contact.phone && (
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{contact.phone}</p>
                                  </div>
                                </div>
                              )}
                              
                              {contact.company && (
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                    <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contact.company}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(contact.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Message</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                {contact.message}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedContact(contact)}
                                  className="px-4 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800">
                                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                      <User className="h-6 w-6 text-white" />
                                    </div>
                                    Contact Details
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedContact && (
                                  <div className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Full Name</Label>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedContact.name}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Status</Label>
                                        <div className="flex gap-2">
                                          <Badge variant="outline" className={getStatusColor(selectedContact.status)}>
                                            {selectedContact.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</Label>
                                        <p className="text-base text-blue-600 dark:text-blue-400 font-medium">{selectedContact.email}</p>
                                      </div>
                                      {selectedContact.phone && (
                                        <div className="space-y-2">
                                          <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone</Label>
                                          <p className="text-base text-gray-900 dark:text-white font-medium">{selectedContact.phone}</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {selectedContact.company && (
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Company</Label>
                                        <p className="text-base text-gray-900 dark:text-white font-medium">{selectedContact.company}</p>
                                      </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Message</Label>
                                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                                          {selectedContact.message}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Update Status</Label>
                                      <div className="flex flex-wrap gap-2">
                                        {(['new', 'contacted', 'completed'] as Contact['status'][]).map((status) => (
                                          <Button
                                            key={status}
                                            variant={selectedContact.status === status ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleStatusUpdate(selectedContact.id, status)}
                                            className={`capitalize ${
                                              selectedContact.status === status 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                                : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20'
                                            } transition-all duration-200`}
                                          >
                                            {getStatusIcon(status)}
                                            <span className="ml-2">{status}</span>
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="px-4 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-900/20 transition-all duration-200 shadow-sm"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Contact Flow Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">New Contacts</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.newContacts}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Awaiting response</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-800/30 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">In Progress</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.contactedContacts}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Under discussion</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Completed</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.completedContacts}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Successfully closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">Success Rate</h4>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.responseRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-2000 ease-out shadow-lg" 
                          style={{ width: `${analytics.responseRate}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Conversion from contact to completion</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">2.4h</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Avg Response</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">4.8</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Client Rating</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Monthly Growth</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Compared to last month</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">+{analytics.monthlyGrowth}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
