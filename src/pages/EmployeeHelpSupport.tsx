import React from "react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Book, Mail, Phone, Send } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeHelpSupport() {
  const { navigateToPath, navigateToTab } = useNavigation("employee");
  const { toast } = useToast();

  const handleNavigation = (itemId: string) => {
    navigateToTab(itemId);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending contact form data
    toast({
      title: "Support Request Sent",
      description: "Your message has been sent. We will get back to you shortly!",
    });
    // Clear form fields if needed
    (e.target as HTMLFormElement).reset();
  };

  const faqs = [
    {
      question: "How do I check in/out?",
      answer: "Navigate to the 'Check In/Out' tab from the bottom navigation. Ensure your location services are enabled and verified, then use the biometric scanner to complete your check-in or check-out.",
    },
    {
      question: "What if my location isn't verifying?",
      answer: "Please ensure your device's GPS is turned on and that you have granted location permissions to the app. Try moving to an area with better GPS signal. If the issue persists, contact support.",
    },
    {
      question: "Can I edit my attendance records?",
      answer: "Employee attendance records cannot be directly edited by employees. If there's an error, please contact your administrator with details for correction.",
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to the 'Profile' tab. You can edit certain personal details there. For changes to your role or employee ID, please contact your administrator.",
    },
    {
      question: "Is biometric authentication mandatory?",
      answer: "Biometric authentication is a key security feature of the DREAMS system. Please ensure your fingerprint is enrolled for seamless check-in/out.",
    },
  ];

  return (
    <>
      <Header title="Help & Support" />
      <EmployeeLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Help & Support
            </h1>
            <p className="text-muted-foreground">
              Find answers, documentation, and contact us for assistance.
            </p>
          </div>

          {/* Quick Links / Overview */}
          <Card className="status-card p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="w-6 h-6 text-primary" />
                How Can We Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-muted-foreground">
                Welcome to the DREAMS Attendance Management System support center. Below you'll find resources to help you navigate the application.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Documentation", description: "Full documentation is coming soon!" })}>
                  <Book className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = 'tel:+1234567890'}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Frequently Asked Questions */}
          <Card className="status-card p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Book className="w-6 h-6 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support Form */}
          <Card className="status-card p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="w-6 h-6 text-primary" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </p>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Your Name</Label>
                  <Input id="contact-name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Your Email</Label>
                  <Input id="contact-email" type="email" placeholder="john.doe@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input id="contact-subject" placeholder="Issue with check-in" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea id="contact-message" placeholder="Describe your issue in detail..." rows={5} required />
                </div>
                <Button type="submit" className="w-full btn-attendance">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </EmployeeLayout>
      <BottomNavigation activeItem="none" onItemClick={handleNavigation} />
    </>
  );
}