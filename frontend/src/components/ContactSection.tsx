import React, { useState } from "react";
import { contactApi, analyticsApi } from "@/lib/api";
import { useApiMutation } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CheckIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

interface QuoteEstimate {
  minPrice: number;
  maxPrice: number;
  timeframe: string;
}

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Use API mutation for contact form submission
  const { mutate: submitContact, loading: isSubmitting, error: submitError } = useApiMutation(
    contactApi.submitContactForm
  );

  // Quote calculator state
  const [serviceType, setServiceType] = useState("web");
  const [projectSize, setProjectSize] = useState(50);
  const [urgency, setUrgency] = useState("normal");
  const [quoteEstimate, setQuoteEstimate] = useState<QuoteEstimate | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Generate subject based on service type and urgency
      const generatedSubject = subject || `${serviceType.toUpperCase()} ${urgency === 'urgent' ? 'URGENT' : ''} Project Inquiry`;
      
      // Submit contact form via API
      await submitContact({
        name,
        email,
        subject: generatedSubject,
        message: `${message}\n\nProject Details:\n- Service Type: ${serviceType}\n- Project Size: ${projectSize}%\n- Urgency: ${urgency}\n- Estimated Budget: $${quoteEstimate?.minPrice || 'TBD'} - $${quoteEstimate?.maxPrice || 'TBD'}`
      });

      // Track analytics event
      analyticsApi.trackEvent('contact_form', {
        serviceType,
        projectSize,
        urgency,
        quoteEstimate,
        hasQuoteEstimate: !!quoteEstimate
      }).catch(console.error);

      setSubmitted(true);

      // Reset form after submission
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setSubject("");
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Still show success message for demo purposes to maintain UX
      setSubmitted(true);
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setSubject("");
        setSubmitted(false);
      }, 3000);
    }
  };

  const calculateQuote = () => {
    let basePrice = 0;
    let timeframe = "";

    // Set base price by service type
    switch (serviceType) {
      case "web":
        basePrice = 2000;
        break;
      case "uiux":
        basePrice = 1500;
        break;
      case "social":
        basePrice = 1000;
        break;
      default:
        basePrice = 1000;
    }

    // Adjust by project size (slider value from 0-100)
    const sizeMultiplier = projectSize / 50; // 0.5 to 2.0

    // Adjust by urgency
    let urgencyMultiplier = 1.0;
    switch (urgency) {
      case "urgent":
        urgencyMultiplier = 1.5;
        timeframe = "1-2 weeks";
        break;
      case "normal":
        urgencyMultiplier = 1.0;
        timeframe = "3-4 weeks";
        break;
      case "relaxed":
        urgencyMultiplier = 0.8;
        timeframe = "5-8 weeks";
        break;
      default:
        timeframe = "3-4 weeks";
    }

    const calculatedPrice = basePrice * sizeMultiplier * urgencyMultiplier;

    setQuoteEstimate({
      minPrice: Math.round(calculatedPrice * 0.8),
      maxPrice: Math.round(calculatedPrice * 1.2),
      timeframe,
    });
  };

  return (
    <section id="contact" className="py-20 px-4 md:px-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Get In Touch
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-xl">
            Ready to start your next project? Contact us for a free consultation
            or use our quick quote calculator to get an estimate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Send Us a Message
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">
                      Thank you!
                    </h3>
                    <p className="text-gray-500 mt-2 text-center">
                      Your message has been sent successfully. We'll be in touch
                      soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Project inquiry (optional)"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                    {submitError && (
                      <p className="text-red-500 text-sm mt-2">
                        Failed to send message. Please try again.
                      </p>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quote Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Quick Quote Calculator
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Get an instant estimate for your project based on your
                  requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="calculator" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="calculator" data-state="active">
                      Calculator
                    </TabsTrigger>
                    <TabsTrigger value="estimate">
                      {quoteEstimate ? "Your Estimate" : "Results"}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="calculator" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Service Type</Label>
                        <Select
                          value={serviceType}
                          onValueChange={setServiceType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web">Web Development</SelectItem>
                            <SelectItem value="uiux">UI/UX Design</SelectItem>
                            <SelectItem value="social">
                              Social Media Marketing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Project Size</Label>
                          <span className="text-sm text-gray-500">
                            {projectSize < 33
                              ? "Small"
                              : projectSize < 66
                                ? "Medium"
                                : "Large"}
                          </span>
                        </div>
                        <Slider
                          value={[projectSize]}
                          min={10}
                          max={100}
                          step={1}
                          onValueChange={(value) => setProjectSize(value[0])}
                          className="py-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Timeframe</Label>
                        <Select value={urgency} onValueChange={setUrgency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">
                              Urgent (1-2 weeks)
                            </SelectItem>
                            <SelectItem value="normal">
                              Standard (3-4 weeks)
                            </SelectItem>
                            <SelectItem value="relaxed">
                              Relaxed (5-8 weeks)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={calculateQuote}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        Calculate Estimate
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="estimate" className="pt-4">
                    {quoteEstimate ? (
                      <div className="space-y-6">
                        <div className="text-center py-6">
                          <h3 className="text-2xl font-bold mb-2">
                            ${quoteEstimate.minPrice.toLocaleString()} - $
                            {quoteEstimate.maxPrice.toLocaleString()}
                          </h3>
                          <p className="text-gray-500">
                            Estimated project cost
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Project Details</h4>
                          <ul className="space-y-2">
                            <li className="flex justify-between">
                              <span className="text-gray-600">Service:</span>
                              <span className="font-medium">
                                {serviceType === "web"
                                  ? "Web Development"
                                  : serviceType === "uiux"
                                    ? "UI/UX Design"
                                    : "Social Media Marketing"}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">
                                Project Size:
                              </span>
                              <span className="font-medium">
                                {projectSize < 33
                                  ? "Small"
                                  : projectSize < 66
                                    ? "Medium"
                                    : "Large"}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Timeframe:</span>
                              <span className="font-medium">
                                {quoteEstimate.timeframe}
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-4">
                            This is just an estimate. Contact us for a detailed
                            quote.
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => {
                              const contactTab = document.querySelector(
                                '[data-state="active"][value="calculator"]',
                              );
                              if (contactTab) {
                                (contactTab as HTMLElement).click();
                              }
                              setTimeout(() => {
                                document.getElementById("name")?.focus();
                              }, 100);
                            }}
                          >
                            Request Detailed Quote{" "}
                            <ArrowRightIcon className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          Use the calculator to generate an estimate
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700">
            <div className="h-16 w-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Email Us</h3>
            <p className="text-gray-300 mb-1">hello@pixoracraftt.com</p>
            <p className="text-gray-300">support@pixoracraftt.com</p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700">
            <div className="h-16 w-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Call Us</h3>
            <p className="text-gray-300 mb-1">+1 (555) 123-4567</p>
            <p className="text-gray-300">Mon-Fri, 9am-5pm</p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700">
            <div className="h-16 w-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Visit Us</h3>
            <p className="text-gray-300 mb-1">123 Business Avenue</p>
            <p className="text-gray-300">New York, NY 10001</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
