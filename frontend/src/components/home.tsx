import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { Button } from "./ui/button";
import ServiceSection from "./ServiceSection";
import PortfolioGrid from "./PortfolioGrid";
import TestimonialCarousel from "./TestimonialCarousel";
import ContactSection from "./ContactSection";
import Footer from "./ui/animated-footer";
import { useCMS } from "../contexts/CMSContext";

const HomePage = () => {
  const { services } = useCMS();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Modern and Clean */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Pixora Craftt
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#services"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
            >
              Services
            </a>
            <a
              href="#portfolio"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
            >
              Portfolio
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
            >
              Testimonials
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
            >
              Contact
            </a>
          </nav>
          <Button
            className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section - Modern and Clean */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Build Amazing
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Digital Products
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              We create stunning websites, intuitive user experiences, and
              effective digital strategies that help your business thrive in the
              modern world.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 py-3 text-lg"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg"
                onClick={() =>
                  document
                    .getElementById("portfolio")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Portfolio
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 max-w-6xl mx-auto px-4">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold mb-2">Fast Development</h3>
                  <p className="text-blue-100 text-sm">
                    Quick turnaround times without compromising quality
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold mb-2">Beautiful Design</h3>
                  <p className="text-purple-100 text-sm">
                    Stunning visuals that capture your brand essence
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="font-semibold mb-2">Growth Focused</h3>
                  <p className="text-green-100 text-sm">
                    Solutions designed to scale with your business
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Our Services
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              We offer comprehensive digital solutions to help your business
              thrive in the online world.
            </motion.p>
          </div>

          <ServiceSection />
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-white">
        <PortfolioGrid />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              What Our Clients Say
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Don't just take our word for it. Here's what our clients have to
              say about working with us.
            </motion.p>
          </div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Animated Footer */}
      <Footer
        leftLinks={[
          { href: "/terms", label: "Terms & policies" },
          { href: "/privacy-policy", label: "Privacy policy" },
        ]}
        rightLinks={[
          { href: "/careers", label: "Careers" },
          { href: "/about", label: "About" },
          { href: "/help-center", label: "Help Center" },
          { href: "https://twitter.com/pixoracraftt", label: "Twitter" },
          { href: "https://www.instagram.com/pixoracraftt", label: "Instagram" },
          { href: "https://github.com/pixoracraftt", label: "GitHub" },
        ]}
        copyrightText="Pixora Craftt 2025. All Rights Reserved"
        barCount={25}
      />

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Pixora Craftt",
            description:
              "Premium digital solutions agency specializing in web development, UI/UX design, and social media marketing.",
            url: "https://www.pixoracraftt.com",
            logo: "https://www.pixoracraftt.com/logo.png",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Digital Avenue",
              addressLocality: "San Francisco",
              addressRegion: "CA",
              postalCode: "94107",
              addressCountry: "US",
            },
            telephone: "+15551234567",
            email: "hello@pixoracraftt.com",
            sameAs: [
              "https://www.facebook.com/pixoracraftt",
              "https://www.instagram.com/pixoracraftt",
              "https://twitter.com/pixoracraftt",
              "https://www.linkedin.com/company/pixoracraftt",
            ],
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "09:00",
              closes: "18:00",
            },
            priceRange: "$$$",
          }),
        }}
      />
    </div>
  );
};

export default HomePage;
