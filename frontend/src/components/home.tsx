import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { Button } from "./ui/button";
import ServiceSection from "./ServiceSection";
import PortfolioGrid from "./PortfolioGrid";
import TestimonialCarousel from "./TestimonialCarousel";
import ContactSection from "./ContactSection";
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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-xl text-white">
                  Pixora Craftt
                </span>
              </div>
              <p className="mb-6 text-gray-400 max-w-md">
                We create stunning digital experiences that help businesses grow
                and succeed in the modern world.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => alert("Follow us on Twitter @pixoracraftt")}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </button>
                <button
                  onClick={() => alert("Follow us on Facebook @pixoracraftt")}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    alert("Connect with us on LinkedIn @pixoracraftt")
                  }
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Services
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("services")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    Web Development
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("services")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    UI/UX Design
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("services")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    Digital Marketing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("services")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    Brand Strategy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() =>
                      alert(
                        "Learn more about Pixora Craftt - Premium Digital Solutions Agency",
                      )
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("portfolio")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    Our Work
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      alert("Join our team! Email careers@pixoracraftt.com")
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-white transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Pixora Craftt. All rights
              reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button
                onClick={() =>
                  alert(
                    "Privacy Policy: We respect your privacy and protect your data.",
                  )
                }
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() =>
                  alert("Terms of Service: Professional service terms apply.")
                }
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

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
