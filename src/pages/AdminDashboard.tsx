import { AdminLayout } from "@/components/layout/AdminLayout";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { SideMenu } from "@/components/layout/SideMenu";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Users, Clock, MapPin, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
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
      <Header
        title="Admin Dashboard"
        showMenu={isMobile}
        onMenuClick={toggleSideMenu}
        userRole="admin"
      />
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
            <button
              onClick={() => navigateToTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigateToTab('employees')}
              className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            >
              <Users className="h-5 w-5" />
              <span>Employees</span>
            </button>
            <button
              onClick={() => navigateToTab('monitoring')}
              className={`nav-item ${activeTab === 'monitoring' ? 'active' : ''}`}
            >
              <MapPin className="h-5 w-5" />
              <span>Live Monitor</span>
            </button>
            <button
              onClick={() => navigateToTab('reports')}
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <Clock className="h-5 w-5" />
              <span>Reports</span>
            </button>
          </nav>
        </div>
      )}>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {userName}
            </h1>
            <p className="text-muted-foreground">
              Manage your team's attendance and system settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="status-card p-6 flex flex-col items-center text-center">
              <Users className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg text-foreground">Total Employees</h3>
              <p className="text-3xl font-bold text-primary">125</p>
            </Card>
            <Card className="status-card p-6 flex flex-col items-center text-center">
              <Clock className="w-10 h-10 text-accent mb-3" />
              <h3 className="font-semibold text-lg text-foreground">On Duty Now</h3>
              <p className="text-3xl font-bold text-accent">98</p>
            </Card>
            <Card className="status-card p-6 flex flex-col items-center text-center">
              <MapPin className="w-10 h-10 text-secondary mb-3" />
              <h3 className="font-semibold text-lg text-foreground">Locations</h3>
              <p className="text-3xl font-bold text-secondary">5</p>
            </Card>
          </div>

          <Card className="status-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigateToPath('/admin/employees')}
                className="btn-attendance bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Manage Employees
              </button>
              <button
                onClick={() => navigateToPath('/admin/reports')}
                className="btn-attendance bg-accent text-accent-foreground hover:bg-accent/90"
              >
                View Reports
              </button>
            </div>
          </Card>
        </div>
      </AdminLayout>
      {isMobile && (
        <BottomNavigation activeItem={activeTab} onItemClick={navigateToTab} userRole="admin" />
      )}
    </>
  );
}