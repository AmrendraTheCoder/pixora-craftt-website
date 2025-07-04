import React, { createContext, useContext, useState, useEffect } from "react";
import { cmsApi, analyticsApi } from "@/lib/api";
import { useApiCall, useApiMutation } from "@/hooks/useApi";

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  color: string;
  image?: string;
  caseStudyLink?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  category: "web" | "uiux" | "social";
  description: string;
  fullDescription?: string;
  image: string;
  tags: string[];
  clientName?: string;
  projectUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CMSContextType {
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  loading: {
    services: boolean;
    projects: boolean;
    testimonials: boolean;
  };
  error: {
    services: string | null;
    projects: string | null;
    testimonials: string | null;
  };
  addService: (
    service: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTestimonial: (
    testimonial: Omit<Testimonial, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refetch: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};

// Default data for fallback
const defaultServices: Service[] = [
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Website Redesign",
    category: "web",
    description:
      "Complete redesign and development of an e-commerce platform with custom shopping cart and payment integration.",
    image:
      "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80",
    tags: ["React", "Node.js", "Stripe", "Responsive"],
    fullDescription:
      "This project involved a complete overhaul of an outdated e-commerce platform. We implemented a modern React frontend with a Node.js backend, integrated Stripe for secure payments, and ensured the site was fully responsive across all devices.",
    clientName: "Fashion Retailer",
    projectUrl: "#",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Mobile App UI Design",
    category: "uiux",
    description:
      "User interface and experience design for a fitness tracking mobile application with custom iconography.",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
    tags: ["Figma", "UI Design", "Mobile", "Prototyping"],
    fullDescription:
      "We created a comprehensive UI/UX design for a fitness tracking application, focusing on intuitive user flows and engaging visual elements.",
    clientName: "FitTech Startup",
    projectUrl: "#",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp Inc.",
    content:
      "Pixora Craftt transformed our digital presence completely. Their attention to detail and innovative approach exceeded our expectations.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    rating: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface CMSProviderProps {
  children: React.ReactNode;
}

export const CMSProvider = ({ children }: CMSProviderProps) => {
  // Use API to fetch data from microservices
  const { 
    data: apiServices, 
    loading: servicesLoading, 
    error: servicesError,
    refetch: refetchServices 
  } = useApiCall(() => cmsApi.getServices(), []);
  
  const { 
    data: apiProjects, 
    loading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useApiCall(() => cmsApi.getProjects(), []);
  
  const { 
    data: apiTestimonials, 
    loading: testimonialsLoading, 
    error: testimonialsError,
    refetch: refetchTestimonials 
  } = useApiCall(() => cmsApi.getTestimonials(), []);

  // API mutations
  const { mutate: createServiceMutation } = useApiMutation(cmsApi.createService);
  const { mutate: updateServiceMutation } = useApiMutation((params: { id: string; data: any }) => 
    cmsApi.updateService(params.id, params.data)
  );
  const { mutate: deleteServiceMutation } = useApiMutation(cmsApi.deleteService);

  const { mutate: createProjectMutation } = useApiMutation(cmsApi.createProject);
  const { mutate: updateProjectMutation } = useApiMutation((params: { id: string; data: any }) => 
    cmsApi.updateProject(params.id, params.data)
  );
  const { mutate: deleteProjectMutation } = useApiMutation(cmsApi.deleteProject);

  const { mutate: createTestimonialMutation } = useApiMutation(cmsApi.createTestimonial);
  const { mutate: updateTestimonialMutation } = useApiMutation((params: { id: string; data: any }) => 
    cmsApi.updateTestimonial(params.id, params.data)
  );
  const { mutate: deleteTestimonialMutation } = useApiMutation(cmsApi.deleteTestimonial);

  // Local state as fallback when API is not available
  const [localServices, setLocalServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem("cms-services");
    return stored ? JSON.parse(stored) : defaultServices;
  });
  
  const [localProjects, setLocalProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem("cms-projects");
    return stored ? JSON.parse(stored) : defaultProjects;
  });
  
  const [localTestimonials, setLocalTestimonials] = useState<Testimonial[]>(() => {
    const stored = localStorage.getItem("cms-testimonials");
    return stored ? JSON.parse(stored) : defaultTestimonials;
  });

  // Save to localStorage whenever local data changes
  useEffect(() => {
    localStorage.setItem("cms-services", JSON.stringify(localServices));
  }, [localServices]);

  useEffect(() => {
    localStorage.setItem("cms-projects", JSON.stringify(localProjects));
  }, [localProjects]);

  useEffect(() => {
    localStorage.setItem("cms-testimonials", JSON.stringify(localTestimonials));
  }, [localTestimonials]);

  // Determine which data source to use
  const services = (apiServices as any)?.services || localServices;
  const projects = (apiProjects as any)?.projects || localProjects;
  const testimonials = (apiTestimonials as any)?.testimonials || localTestimonials;

  // Service methods
  const addService = async (
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await createServiceMutation(serviceData);
      await refetchServices();
      
      // Track analytics event
      analyticsApi.trackEvent('service_inquiry', { 
        action: 'service_created',
        serviceTitle: serviceData.title 
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to add service:', error);
      // Fallback to local state
      const newService: Service = {
        ...serviceData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLocalServices((prev) => [...prev, newService]);
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      await updateServiceMutation({ id, data: serviceData });
      await refetchServices();
    } catch (error) {
      console.error('Failed to update service:', error);
      // Fallback to local state
      setLocalServices((prev) =>
        prev.map((service) =>
          service.id === id ? { ...service, ...serviceData, updatedAt: new Date() } : service,
        ),
      );
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteServiceMutation(id);
      await refetchServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
      // Fallback to local state
      setLocalServices((prev) => prev.filter((service) => service.id !== id));
    }
  };

  // Project methods
  const addProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await createProjectMutation(projectData);
      await refetchProjects();
      
      // Track analytics event
      analyticsApi.trackEvent('project_view', { 
        action: 'project_created',
        projectTitle: projectData.title,
        category: projectData.category 
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to add project:', error);
      // Fallback to local state
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLocalProjects((prev) => [...prev, newProject]);
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      await updateProjectMutation({ id, data: projectData });
      await refetchProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
      // Fallback to local state
      setLocalProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...projectData, updatedAt: new Date() } : project,
        ),
      );
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteProjectMutation(id);
      await refetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      // Fallback to local state
      setLocalProjects((prev) => prev.filter((project) => project.id !== id));
    }
  };

  // Testimonial methods
  const addTestimonial = async (
    testimonialData: Omit<Testimonial, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await createTestimonialMutation(testimonialData);
      await refetchTestimonials();
    } catch (error) {
      console.error('Failed to add testimonial:', error);
      // Fallback to local state
      const newTestimonial: Testimonial = {
        ...testimonialData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLocalTestimonials((prev) => [...prev, newTestimonial]);
    }
  };

  const updateTestimonial = async (
    id: string,
    testimonialData: Partial<Testimonial>,
  ) => {
    try {
      await updateTestimonialMutation({ id, data: testimonialData });
      await refetchTestimonials();
    } catch (error) {
      console.error('Failed to update testimonial:', error);
      // Fallback to local state
      setLocalTestimonials((prev) =>
        prev.map((testimonial) =>
          testimonial.id === id
            ? { ...testimonial, ...testimonialData, updatedAt: new Date() }
            : testimonial,
        ),
      );
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await deleteTestimonialMutation(id);
      await refetchTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      // Fallback to local state
      setLocalTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.id !== id),
      );
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const result = await cmsApi.uploadMedia(file);
      return (result as any).url;
    } catch (error) {
      console.error("Upload error:", error);
      // Return a placeholder URL for demo purposes when API is not available
      return URL.createObjectURL(file);
    }
  };

  const refetch = () => {
    refetchServices();
    refetchProjects();
    refetchTestimonials();
  };

  const value: CMSContextType = {
    services,
    projects,
    testimonials,
    loading: {
      services: servicesLoading,
      projects: projectsLoading,
      testimonials: testimonialsLoading,
    },
    error: {
      services: servicesError,
      projects: projectsError,
      testimonials: testimonialsError,
    },
    addService,
    updateService,
    deleteService,
    addProject,
    updateProject,
    deleteProject,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    uploadImage,
    refetch,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};
