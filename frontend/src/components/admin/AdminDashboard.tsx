import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseContacts } from "@/hooks/useSupabase";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Settings,
} from "lucide-react";

const AdminDashboard = () => {
  const { contacts, loading, updateContactStatus } = isSupabaseConfigured()
    ? useSupabaseContacts()
    : { contacts: [], loading: false, updateContactStatus: async () => {} };

  const [activeTab, setActiveTab] = useState("contacts");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "contacted":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusUpdate = async (
    contactId: string,
    newStatus: "new" | "contacted" | "completed",
  ) => {
    try {
      await updateContactStatus(contactId, newStatus);
    } catch (error) {
      console.error("Error updating contact status:", error);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Settings className="h-5 w-5" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Supabase Not Configured
                </h3>
                <p className="text-muted-foreground mb-4">
                  To access the admin dashboard and manage contacts, please
                  configure your Supabase connection.
                </p>
                <Badge variant="outline">Demo Mode</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  Admin Dashboard
                </h1>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                Pixora Craftt Admin
              </Badge>
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
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Contacts
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contacts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Inquiries
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contacts.filter((c) => c.status === "new").length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contacts.filter((c) => c.status === "completed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contacts List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading contacts...</p>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No contacts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{contact.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {contact.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(contact.status)}>
                              {contact.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(contact.id, "contacted")
                                }
                                disabled={
                                  contact.status === "contacted" ||
                                  contact.status === "completed"
                                }
                              >
                                {contact.status === "contacted"
                                  ? "Contacted"
                                  : "Mark Contacted"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(contact.id, "completed")
                                }
                                disabled={contact.status === "completed"}
                              >
                                {contact.status === "completed"
                                  ? "Completed"
                                  : "Complete"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm mb-3">{contact.message}</p>

                        {contact.service_type && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">
                              Service: {contact.service_type}
                            </Badge>
                            {contact.project_size && (
                              <Badge variant="secondary">
                                Size: {contact.project_size}
                              </Badge>
                            )}
                            {contact.urgency && (
                              <Badge variant="secondary">
                                Urgency: {contact.urgency}
                              </Badge>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-2">
                          Received:{" "}
                          {new Date(contact.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Analytics features coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
