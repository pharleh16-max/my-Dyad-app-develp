import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function AdminDataExport() {
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
      pageTitle="Data Export"
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
            Data Export
          </h1>
          <p className="text-muted-foreground">
            Generate and export attendance and employee data for reporting.
          </p>
        </div>

        <Card className="status-card p-6 flex flex-col items-center text-center">
          <Database className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-semibold text-xl text-foreground">
            Export Data
          </h3>
          <p className="text-muted-foreground mt-2">
            This page is under construction. Here you will be able to select data ranges, filter criteria, and export various attendance and employee reports in different formats.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}