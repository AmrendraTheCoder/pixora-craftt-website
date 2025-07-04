import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// For demo purposes, we'll use placeholder values if env vars are not set
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Only create real client if we have actual credentials
const hasRealCredentials =
  supabaseUrl !== "https://placeholder.supabase.co" &&
  supabaseAnonKey !== "placeholder-key";

export const supabase = hasRealCredentials
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => hasRealCredentials;

// Mock data for when Supabase is not configured
export const mockData = {
  services: [
    {
      id: "1",
      title: "Web Development",
      description:
        "Custom websites built with modern technologies that are fast, responsive, and optimized for search engines.",
      features: [
        "Responsive design for all devices",
        "SEO-optimized code structure",
        "Fast loading speeds",
        "Secure and scalable architecture",
      ],
      color: "bg-slack-green",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      icon: null,
      image: null,
      case_study_link: null,
    },
    {
      id: "2",
      title: "UI/UX Design",
      description:
        "Intuitive and engaging user experiences that guide visitors through your digital products with ease.",
      features: [
        "User-centered design approach",
        "Intuitive navigation systems",
        "Visually appealing interfaces",
        "Conversion-focused layouts",
      ],
      color: "bg-slack-yellow",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      icon: null,
      image: null,
      case_study_link: null,
    },
    {
      id: "3",
      title: "Social Media Marketing",
      description:
        "Strategic social media campaigns that increase brand awareness and drive engagement with your target audience.",
      features: [
        "Platform-specific content strategies",
        "Community engagement tactics",
        "Performance analytics and reporting",
        "Paid advertising management",
      ],
      color: "bg-pixora-500",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      icon: null,
      image: null,
      case_study_link: null,
    },
  ],
  projects: [
    {
      id: "1",
      title: "E-Commerce Website Redesign",
      category: "web" as const,
      description:
        "Complete redesign and development of an e-commerce platform with custom shopping cart and payment integration.",
      image:
        "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80",
      tags: ["React", "Node.js", "Stripe", "Responsive"],
      full_description:
        "This project involved a complete overhaul of an outdated e-commerce platform. We implemented a modern React frontend with a Node.js backend, integrated Stripe for secure payments, and ensured the site was fully responsive across all devices.",
      client_name: "Fashion Retailer",
      project_url: "#",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Mobile App UI Design",
      category: "uiux" as const,
      description:
        "User interface and experience design for a fitness tracking mobile application with custom iconography.",
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      tags: ["Figma", "UI Design", "Mobile", "Prototyping"],
      full_description:
        "We created a comprehensive UI/UX design for a fitness tracking application, focusing on intuitive user flows and engaging visual elements.",
      client_name: "FitTech Startup",
      project_url: "#",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      content:
        "Pixora Craftt transformed our digital presence completely. Their attention to detail and innovative approach exceeded our expectations.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      rating: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "CEO",
      company: "StartupXYZ",
      content:
        "The team at Pixora Craftt delivered exceptional results. Our website traffic increased by 300% after the redesign.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      rating: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};
