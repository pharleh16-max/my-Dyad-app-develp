import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export default function AdminEmployeesPage() {
  const { profile } = useAuthState();
  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu, // Correctly destructuring closeSideMenu
    navigateToTab,
    navigateToPath,
  } = useNavigation("admin");

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

  return (
    <AdminLayout
      pageTitle="Employee Management"
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu} // Correctly passing closeSideMenu
      navigateToTab={navigateToTab}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all employee accounts and their details.
          </p>
        </div>

        <Card className="status-card p-6 flex flex-col items-center text-center">
          <Users2 className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-semibold text-xl text-foreground">
            Employee Accounts
          </h3>
          <p className="text-muted-foreground mt-2">
            This page is under construction. Here you will be able to view, edit, activate, suspend, and delete employee accounts, as well as manage their roles and biometric enrollment status.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}