import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];
type ServiceRow = Tables["services"]["Row"];
type ProjectRow = Tables["projects"]["Row"];
type TestimonialRow = Tables["testimonials"]["Row"];
type ContactRow = Tables["contacts"]["Row"];

export const useSupabaseServices = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addService = async (service: Tables["services"]["Insert"]) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      setServices((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateService = async (
    id: string,
    updates: Tables["services"]["Update"],
  ) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setServices((prev) =>
        prev.map((service) => (service.id === id ? data : service)),
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
};

export const useSupabaseProjects = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Tables["projects"]["Insert"]) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      setProjects((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateProject = async (
    id: string,
    updates: Tables["projects"]["Update"],
  ) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setProjects((prev) =>
        prev.map((project) => (project.id === id ? data : project)),
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};

export const useSupabaseTestimonials = () => {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addTestimonial = async (
    testimonial: Tables["testimonials"]["Insert"],
  ) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .insert([testimonial])
        .select()
        .single();

      if (error) throw error;
      setTestimonials((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateTestimonial = async (
    id: string,
    updates: Tables["testimonials"]["Update"],
  ) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setTestimonials((prev) =>
        prev.map((testimonial) => (testimonial.id === id ? data : testimonial)),
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.id !== id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return {
    testimonials,
    loading,
    error,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    refetch: fetchTestimonials,
  };
};

export const useSupabaseContacts = () => {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contact: Tables["contacts"]["Insert"]) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .insert([contact])
        .select()
        .single();

      if (error) throw error;
      setContacts((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateContactStatus = async (
    id: string,
    status: "new" | "contacted" | "completed",
  ) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setContacts((prev) =>
        prev.map((contact) => (contact.id === id ? data : contact)),
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContactStatus,
    refetch: fetchContacts,
  };
};
