export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          features: string[];
          color: string;
          icon: string | null;
          image: string | null;
          case_study_link: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          features: string[];
          color: string;
          icon?: string | null;
          image?: string | null;
          case_study_link?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          features?: string[];
          color?: string;
          icon?: string | null;
          image?: string | null;
          case_study_link?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          category: "web" | "uiux" | "social";
          description: string;
          full_description: string | null;
          image: string;
          tags: string[];
          client_name: string | null;
          project_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: "web" | "uiux" | "social";
          description: string;
          full_description?: string | null;
          image: string;
          tags: string[];
          client_name?: string | null;
          project_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: "web" | "uiux" | "social";
          description?: string;
          full_description?: string | null;
          image?: string;
          tags?: string[];
          client_name?: string | null;
          project_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string;
          company: string;
          content: string;
          avatar: string | null;
          rating: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          company: string;
          content: string;
          avatar?: string | null;
          rating: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          company?: string;
          content?: string;
          avatar?: string | null;
          rating?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          service_type: string | null;
          project_size: number | null;
          urgency: string | null;
          quote_estimate: Json | null;
          status: "new" | "contacted" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          service_type?: string | null;
          project_size?: number | null;
          urgency?: string | null;
          quote_estimate?: Json | null;
          status?: "new" | "contacted" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          service_type?: string | null;
          project_size?: number | null;
          urgency?: string | null;
          quote_estimate?: Json | null;
          status?: "new" | "contacted" | "completed";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
