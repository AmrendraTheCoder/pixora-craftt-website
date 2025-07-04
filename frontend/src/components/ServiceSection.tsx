import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCMS } from "@/contexts/CMSContext";
import { motion } from "framer-motion";

interface ServiceProps {
  title?: string;
  description?: string;
  features?: string[];
  color?: string;
  icon?: React.ReactNode;
  caseStudyLink?: string;
}

const ServiceSection = ({
  title,
  description,
  features,
  color,
  icon,
  caseStudyLink,
}: ServiceProps) => {
  const { services } = useCMS();
  const activeServices = services.filter((s) => s.isActive);

  // If no props provided, show all services from CMS
  if (!title && activeServices.length > 0) {
    return (
      <div className="max-w-6xl mx-auto">
        {activeServices.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    );
  }

  // Single service display (legacy support)
  const singleService = {
    title: title || "Web Development",
    description:
      description ||
      "Modern, responsive websites built with the latest technologies.",
    features: features || [
      "Custom website development",
      "E-commerce solutions",
      "Web application development",
      "CMS integration",
    ],
    color: color || "bg-pixora-500",
    icon,
    caseStudyLink: caseStudyLink || "#",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ServiceCard service={singleService} index={0} />
    </div>
  );
};

interface ServiceCardProps {
  service: any;
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  // Map color string to text and hover colors
  const getTextColor = () => {
    if (service.color.includes("slack-green")) return "text-green-600";
    if (service.color.includes("slack-yellow")) return "text-yellow-600";
    if (service.color.includes("pixora-500")) return "text-blue-600";
    if (service.color.includes("emerald")) return "text-emerald-600";
    if (service.color.includes("yellow")) return "text-yellow-600";
    if (service.color.includes("red")) return "text-red-600";
    if (service.color.includes("blue")) return "text-blue-600";
    return "text-blue-600"; // Default
  };

  const getHoverColor = () => {
    if (service.color.includes("slack-green")) return "hover:bg-green-50";
    if (service.color.includes("slack-yellow")) return "hover:bg-yellow-50";
    if (service.color.includes("pixora-500")) return "hover:bg-blue-50";
    if (service.color.includes("emerald")) return "hover:bg-emerald-50";
    if (service.color.includes("yellow")) return "hover:bg-yellow-50";
    if (service.color.includes("red")) return "hover:bg-red-50";
    if (service.color.includes("blue")) return "hover:bg-blue-50";
    return "hover:bg-blue-50"; // Default
  };

  const getIconColor = () => {
    if (service.color.includes("slack-green")) return "bg-green-500";
    if (service.color.includes("slack-yellow")) return "bg-yellow-500";
    if (service.color.includes("pixora-500")) return "bg-blue-500";
    return "bg-blue-500"; // Default
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Service Info */}
        <div className={index % 2 === 1 ? "lg:order-2" : ""}>
          <div
            className={`w-16 h-16 rounded-2xl ${getIconColor()} flex items-center justify-center mb-6`}
          >
            {service.icon || (
              <div className="text-white text-2xl font-bold">
                {service.title.charAt(0)}
              </div>
            )}
          </div>

          <h3 className="text-3xl font-bold mb-4 text-gray-900">
            {service.title}
          </h3>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {service.description}
          </p>

          <ul className="space-y-4 mb-8">
            {service.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start">
                <div
                  className={`mr-4 mt-1 w-6 h-6 rounded-full ${getIconColor()} flex-shrink-0 flex items-center justify-center`}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg">{feature}</span>
              </li>
            ))}
          </ul>

          {service.caseStudyLink && service.caseStudyLink !== "#" ? (
            <Button
              asChild
              className={`${getIconColor()} hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all group`}
            >
              <a href={service.caseStudyLink}>
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          ) : (
            <Button
              className={`${getIconColor()} hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all group`}
              onClick={() => {
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>

        {/* Service Visual */}
        <div className={index % 2 === 1 ? "lg:order-1" : ""}>
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`w-24 h-24 ${getIconColor()} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-white text-4xl font-bold">
                    {service.title.charAt(0)}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {service.title}
                </h4>
                <p className="text-gray-600">
                  Professional {service.title.toLowerCase()} solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceSection;
