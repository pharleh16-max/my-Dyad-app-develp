import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { useToast } from "@/hooks/use-toast";

export default function AdminHelpSupport() {
  const { profile } = useAuthState();
  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  } = useNavigation("admin");
  const { toast } = useToast();

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

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
      question: "How do I manage employee accounts?",
      answer: "Navigate to 'Employee Management' from the sidebar. Here you can view, edit, activate, suspend, or delete employee profiles. You can also approve pending registrations from the 'Employee Approval' page.",
    },
    {
      question: "How do I add or edit work locations?",
      answer: "Go to 'Manage Locations' in the sidebar. This section allows you to define authorized geofenced work areas, set their radius, and manage location details. (Note: This page is currently under construction).",
    },
    {
      question: "Where can I find attendance reports?",
      answer: "Access 'Reports' from the sidebar. You can filter attendance data by date range and employee, view summary statistics, and see daily hours worked. For raw data, use the 'Data Export' page.",
    },
    {
      question: "How do I configure system-wide settings?",
      answer: "The 'System Settings' page (accessible from the sidebar) allows you to adjust global parameters like system name, daily working hours, check-in/out tolerances, and employee self-registration options.",
    },
    {
      question: "What should I do if an employee cannot check in?",
      answer: "First, verify their location services are enabled and they are within an authorized geofence. Check their profile status in 'Employee Management' to ensure they are 'active'. If biometric issues persist, they may need to re-enroll their fingerprint.",
    },
  ];

  return (
    <>
      <AdminLayout
        pageTitle="Help & Support"
        isMobile={isMobile}
        activeTab={activeTab}
        sideMenuOpen={sideMenuOpen}
        toggleSideMenu={toggleSideMenu}
        closeSideMenu={closeSideMenu}
        navigateToTab={navigateToTab}
        navigateToPath={navigateToPath}
        userName={userName}
        userRole={userRole}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Support Center
            </h1>
            <p className="text-muted-foreground">
              Find resources and contact support for assistance with the DREAMS system.
            </p>
          </div>

          {/* Quick Links / Overview */}
          <Card className="status-card p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="w-6 h-6 text-primary" />
                How Can We Help You?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-muted-foreground">
                Welcome to the DREAMS Attendance Management System Admin Support Center. Below you'll find resources to help you manage the application effectively.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Documentation", description: "Full administrator documentation is coming soon!" })}>
                  <Book className="w-4 h-4 mr-2" />
                  View Admin Docs
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = 'tel:+1234567890'}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Technical Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Frequently Asked Questions */}
          <Card className="status-card p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Book className="w-6 h-6 text-primary" />
                Administrator FAQs
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
                Contact Technical Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground mb-4">
                If you require further assistance, please fill out the form below.
              </p>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Your Name</Label>
                  <Input id="contact-name" placeholder="Admin Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Your Email</Label>
                  <Input id="contact-email" type="email" placeholder="admin@company.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input id="contact-subject" placeholder="Issue with employee data" required />
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
      </AdminLayout>
    </>
  );
}