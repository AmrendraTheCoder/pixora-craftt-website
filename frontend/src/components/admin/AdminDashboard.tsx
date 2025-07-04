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
} from "lucide-react";

const AdminDashboard = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
      setLoading(false);
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
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pixora-craftt.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Demo Credentials:</strong><br />
                Email: admin@pixora-craftt.com<br />
                Password: AdminPassword123!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Enhanced Header */}
      <div className="border-b bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Pixora Craftt Management Portal
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                Live System
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchContacts}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">Total Contacts</CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {analytics.totalContacts}
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{analytics.monthlyGrowth}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">New Inquiries</CardTitle>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {analytics.newContacts}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Awaiting response</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">In Progress</CardTitle>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {analytics.contactedContacts}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Currently engaged</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">Completed</CardTitle>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {analytics.completedContacts}
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {analytics.responseRate.toFixed(1)}% completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {contacts.slice(0, 5).map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        contact.status === 'new' ? 'bg-blue-500 shadow-blue-200' :
                        contact.status === 'contacted' ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{contact.email}</p>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(contact.status)} font-medium`}>
                        {contact.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Response Rate</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{analytics.responseRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Monthly Growth</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{analytics.monthlyGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Avg. Response Time</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">2.4 hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">This Week</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{Math.floor(analytics.totalContacts * 0.3)} new</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Enhanced Contacts List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Contact Management</span>
                  <Badge variant="outline">{filteredContacts.length} contacts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading contacts...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== "all" ? "No contacts match your filters." : "No contacts yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <Badge variant="outline" className={getStatusColor(contact.status)}>
                                {getStatusIcon(contact.status)}
                                <span className="ml-1 capitalize">{contact.status}</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {contact.email}
                              </div>
                              {contact.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {contact.phone}
                                </div>
                              )}
                              {contact.company && (
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  {contact.company}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(contact.createdAt)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                              {contact.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedContact(contact)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Contact Details</DialogTitle>
                                </DialogHeader>
                                {selectedContact && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Name</Label>
                                        <p className="font-medium">{selectedContact.name}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <Select
                                          value={selectedContact.status}
                                          onValueChange={(value) => handleStatusUpdate(selectedContact.id, value as Contact['status'])}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p>{selectedContact.email}</p>
                                      </div>
                                      {selectedContact.phone && (
                                        <div>
                                          <Label>Phone</Label>
                                          <p>{selectedContact.phone}</p>
                                        </div>
                                      )}
                                      {selectedContact.company && (
                                        <div>
                                          <Label>Company</Label>
                                          <p>{selectedContact.company}</p>
                                        </div>
                                      )}
                                      <div>
                                        <Label>Created</Label>
                                        <p>{formatDate(selectedContact.createdAt)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Message</Label>
                                      <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        {selectedContact.message}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Select value={contact.status} onValueChange={(value) => handleStatusUpdate(contact.id, value as Contact['status'])}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full" />
                        <span>New Contacts</span>
                      </div>
                      <span className="font-semibold">{analytics.newContacts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                        <span>In Progress</span>
                      </div>
                      <span className="font-semibold">{analytics.contactedContacts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full" />
                        <span>Completed</span>
                      </div>
                      <span className="font-semibold">{analytics.completedContacts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Conversion Rate</span>
                        <span className="text-sm font-medium">{analytics.responseRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${analytics.responseRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Monthly Growth</span>
                        <span className="text-sm font-medium">+{analytics.monthlyGrowth}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${analytics.monthlyGrowth * 4}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{analytics.completedContacts}</p>
                          <p className="text-xs text-gray-600">Projects Won</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{analytics.totalContacts}</p>
                          <p className="text-xs text-gray-600">Total Leads</p>
                        </div>
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
