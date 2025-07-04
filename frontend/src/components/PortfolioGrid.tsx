import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  category: "web" | "uiux" | "social";
  description: string;
  image: string;
  tags: string[];
  fullDescription?: string;
  clientName?: string;
  projectUrl?: string;
}

interface PortfolioGridProps {
  projects?: Project[];
}

const PortfolioGrid = ({ projects = defaultProjects }: PortfolioGridProps) => {
  const [filter, setFilter] = useState<"all" | "web" | "uiux" | "social">(
    "all",
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "web":
        return "bg-slack-green";
      case "uiux":
        return "bg-slack-yellow";
      case "social":
        return "bg-pixora-500";
      default:
        return "bg-slack-blue";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "web":
        return "Web Development";
      case "uiux":
        return "UI/UX Design";
      case "social":
        return "Social Media";
      default:
        return category;
    }
  };

  return (
    <div className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Our Portfolio
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore our recent projects showcasing our expertise in web
            development, UI/UX design, and social media marketing.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center mb-12 gap-3">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-full px-6 py-2 text-sm font-medium"
          >
            All Projects
          </Button>
          <Button
            variant={filter === "web" ? "default" : "outline"}
            onClick={() => setFilter("web")}
            className="rounded-full px-6 py-2 text-sm font-medium"
          >
            Web Development
          </Button>
          <Button
            variant={filter === "uiux" ? "default" : "outline"}
            onClick={() => setFilter("uiux")}
            className="rounded-full px-6 py-2 text-sm font-medium"
          >
            UI/UX Design
          </Button>
          <Button
            variant={filter === "social" ? "default" : "outline"}
            onClick={() => setFilter("social")}
            className="rounded-full px-6 py-2 text-sm font-medium"
          >
            Social Media
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              layout
            >
              <Card
                className="h-full overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group border-0 shadow-lg"
                onClick={() => handleProjectClick(project)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div
                    className={`absolute top-4 right-4 ${getCategoryColor(project.category)} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg`}
                  >
                    {getCategoryName(project.category)}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found in this category.</p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedProject && (
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <div className="flex items-center mt-2">
                  <Badge
                    className={`${getCategoryColor(selectedProject.category)} text-white`}
                  >
                    {getCategoryName(selectedProject.category)}
                  </Badge>
                  {selectedProject.clientName && (
                    <span className="ml-2 text-sm text-gray-500">
                      Client: {selectedProject.clientName}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="mt-4">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />

                <DialogDescription className="text-base text-gray-700 mb-4">
                  {selectedProject.fullDescription ||
                    selectedProject.description}
                </DialogDescription>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProject.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {selectedProject.projectUrl &&
                selectedProject.projectUrl !== "#" ? (
                  <Button asChild className="mt-2">
                    <a
                      href={selectedProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Project
                    </a>
                  </Button>
                ) : selectedProject.projectUrl ? (
                  <Button
                    className="mt-2"
                    onClick={() => {
                      alert(
                        "This is a demo project. In a real scenario, this would link to the live project.",
                      );
                    }}
                  >
                    View Project (Demo)
                  </Button>
                ) : null}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

// Default projects data for demonstration
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
      "This project involved a complete overhaul of an outdated e-commerce platform. We implemented a modern React frontend with a Node.js backend, integrated Stripe for secure payments, and ensured the site was fully responsive across all devices. The new design increased conversion rates by 35% and improved page load times by 60%.",
    clientName: "Fashion Retailer",
    projectUrl: "#",
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
      "We created a comprehensive UI/UX design for a fitness tracking application, focusing on intuitive user flows and engaging visual elements. The project included custom iconography, interactive prototypes, and user testing sessions that led to significant improvements in the final design.",
    clientName: "FitTech Startup",
    projectUrl: "#",
  },
  {
    id: "3",
    title: "Social Media Campaign",
    category: "social",
    description:
      "Multi-platform social media campaign that increased brand engagement by 150% over three months.",
    image:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    tags: ["Instagram", "Facebook", "Content Strategy", "Analytics"],
    fullDescription:
      "We developed and executed a comprehensive social media campaign across Instagram, Facebook, and Twitter. The strategy included content creation, influencer partnerships, and targeted advertising. The campaign resulted in a 150% increase in engagement and a 45% growth in followers over a three-month period.",
    clientName: "Lifestyle Brand",
    projectUrl: "#",
  },
  {
    id: "4",
    title: "Corporate Website Development",
    category: "web",
    description:
      "Modern corporate website with CMS integration, multilingual support, and advanced analytics dashboard.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    tags: ["WordPress", "Custom Theme", "Multilingual", "SEO"],
    fullDescription:
      "We developed a sophisticated corporate website with a custom WordPress theme, multilingual support for 5 languages, and an advanced analytics dashboard. The site was optimized for SEO and performance, resulting in a 40% increase in organic traffic within the first quarter after launch.",
    clientName: "International Consulting Firm",
    projectUrl: "#",
  },
  {
    id: "5",
    title: "Product Dashboard Design",
    category: "uiux",
    description:
      "Intuitive dashboard interface design for a SaaS product with data visualization and user management features.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    tags: ["Dashboard", "Data Visualization", "SaaS", "User Testing"],
    fullDescription:
      "We designed an intuitive and powerful dashboard interface for a SaaS product, focusing on clear data visualization and streamlined user management. The design process included extensive user research, wireframing, prototyping, and multiple rounds of user testing to ensure optimal usability.",
    clientName: "Tech Startup",
    projectUrl: "#",
  },
  {
    id: "6",
    title: "Influencer Marketing Campaign",
    category: "social",
    description:
      "Strategic influencer partnership campaign that generated over 1M impressions and 20K new followers.",
    image:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&q=80",
    tags: [
      "Influencer Marketing",
      "Content Creation",
      "ROI Tracking",
      "Brand Awareness",
    ],
    fullDescription:
      "We conceptualized and executed an influencer marketing campaign that partnered with 15 micro and macro influencers across various platforms. The campaign included custom content creation, strategic posting schedules, and comprehensive ROI tracking. The results exceeded expectations with over 1 million impressions, 20,000 new followers, and a 300% increase in website traffic from social channels.",
    clientName: "Beauty Brand",
    projectUrl: "#",
  },
];

export default PortfolioGrid;
