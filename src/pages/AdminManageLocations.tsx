import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { SideMenu } from "@/components/layout/SideMenu";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function AdminManageLocations() {
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

  return (
    <>
      <AdminHeader title="Manage Locations" />
      <SideMenu
        isOpen={sideMenuOpen}
        onClose={closeSideMenu}
        userRole="admin"
        userName={userName}
        onItemClick={navigateToPath}
      />
      <AdminLayout sidebar={!isMobile && (
        <div className="h-full flex flex-col py-6 px-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Admin Navigation</h2>
          <nav className="flex flex-col gap-2">
            {/* Navigation items for desktop sidebar */}
            <button
              onClick={() => navigateToTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigateToTab('employees')}
              className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            >
              <span>Employees</span>
            </button>
            <button
              onClick={() => navigateToTab('monitoring')}
              className={`nav-item ${activeTab === 'monitoring' ? 'active' : ''}`}
            >
              <span>Live Monitor</span>
            </button>
            <button
              onClick={() => navigateToTab('reports')}
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <span>Reports</span>
            </button>
            <button
              onClick={() => navigateToTab('employee-approval')}
              className={`nav-item ${activeTab === 'employee-approval' ? 'active' : ''}`}
            >
              <span>Employee Approval</span>
            </button>
            <button
              onClick={() => navigateToTab('locations')}
              className={`nav-item ${activeTab === 'locations' ? 'active' : ''}`}
            >
              <span>Manage Locations</span>
            </button>
            <button
              onClick={() => navigateToTab('system')}
              className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
            >
              <span>System Settings</span>
            </button>
            <button
              onClick={() => navigateToTab('users')}
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            >
              <span>User Management</span>
            </button>
            <button
              onClick={() => navigateToTab('data')}
              className={`nav-item ${activeTab === 'data' ? 'active' : ''}`}
            >
              <span>Data Export</span>
            </button>
            <button
              onClick={() => navigateToTab('security')}
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            >
              <span>Security</span>
            </button>
            <button
              onClick={() => navigateToTab('help')}
              className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
            >
              <span>Help & Support</span>
            </button>
          </nav>
        </div>
      )}>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manage Locations
            </h1>
            <p className="text-muted-foreground">
              Define and manage authorized work locations for attendance tracking.
            </p>
          </div>

          <Card className="status-card p-6 flex flex-col items-center text-center">
            <MapPin className="w-12 h-12 text-primary mb-4" />
            <h3 className="font-semibold text-xl text-foreground">
              Locations Management
            </h3>
            <p className="text-muted-foreground mt-2">
              This page is under construction. Here you will be able to add, edit, and remove work locations, set geofencing parameters, and assign employees to specific sites.
            </p>
          </Card>
        </div>
      </AdminLayout>
      {isMobile && (
        <BottomNavigation activeItem={activeTab} onItemClick={navigateToTab} userRole="admin" />
      )}
    </>
  );
}