import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Users, Clock, MapPin, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { startOfDay } from "date-fns";

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
  const userRole = profile?.role || "admin";

  // Fetch total employee count
  const { data: totalEmployees, isLoading: isLoadingEmployees, error: employeesError } = useQuery<number>({
    queryKey: ['totalEmployees'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }
      return count || 0;
    },
  });

  // Fetch count of employees currently on duty
  const { data: onDutyCount, isLoading: isLoadingOnDuty, error: onDutyError } = useQuery<number>({
    queryKey: ['onDutyCount'],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const tomorrow = startOfDay(new Date(new Date().setDate(new Date().getDate() + 1))).toISOString();

      const { count, error } = await supabase
        .from('attendance_records')
        .select('user_id', { count: 'exact', head: true })
        .is('check_out_time', null)
        .gte('check_in_time', today)
        .lt('check_in_time', tomorrow);

      if (error) {
        throw new Error(error.message);
      }
      return count || 0;
    },
  });

  // Fetch total locations count
  const { data: locationsCount, isLoading: isLoadingLocations, error: locationsError } = useQuery<number>({
    queryKey: ['locationsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }
      return count || 0;
    },
  });

  if (isLoadingEmployees || isLoadingOnDuty || isLoadingLocations) {
    return (
      <AdminLayout
        pageTitle="Admin Dashboard"
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
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (employeesError || onDutyError || locationsError) {
    return (
      <AdminLayout
        pageTitle="Admin Dashboard"
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
        <div className="text-center text-destructive p-6">
          Error loading dashboard data: {employeesError?.message || onDutyError?.message || locationsError?.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Admin Dashboard"
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu}
      navigateToTab={navigateToTab}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
      // isDarkMode and onThemeToggle would come from a global context if implemented
    >
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
            <p className="text-3xl font-bold text-primary">{totalEmployees}</p>
          </Card>
          <Card className="status-card p-6 flex flex-col items-center text-center">
            <Clock className="w-10 h-10 text-accent mb-3" />
            <h3 className="font-semibold text-lg text-foreground">On Duty Now</h3>
            <p className="text-3xl font-bold text-accent">{onDutyCount}</p>
          </Card>
          <Card className="status-card p-6 flex flex-col items-center text-center">
            <MapPin className="w-10 h-10 text-secondary mb-3" />
            <h3 className="font-semibold text-lg text-foreground">Locations</h3>
            <p className="text-3xl font-bold text-secondary">{locationsCount}</p>
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
  );
}