import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function AdminLiveMonitor() {
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
      pageTitle="Live Attendance Monitor"
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
            Live Attendance Monitor
          </h1>
          <p className="text-muted-foreground">
            Monitor real-time employee check-ins and check-outs.
          </p>
        </div>

        <Card className="status-card p-6 flex flex-col items-center text-center">
          <MapPin className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-semibold text-xl text-foreground">
            Real-time Monitoring
          </h3>
          <p className="text-muted-foreground mt-2">
            This page is under construction. Here you will see a live map and list of employees, their current status, and location.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}