import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

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

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

  return (
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
            Help & Support
          </h1>
          <p className="text-muted-foreground">
            Find resources and contact support for assistance.
          </p>
        </div>

        <Card className="status-card p-6 flex flex-col items-center text-center">
          <HelpCircle className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-semibold text-xl text-foreground">
            Admin Support Center
          </h3>
          <p className="text-muted-foreground mt-2">
            This page is under construction. Here you will find documentation, FAQs, and contact information for technical support and assistance with the AttendanceDREAMS system.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}