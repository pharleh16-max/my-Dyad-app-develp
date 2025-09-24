import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users, // Used for 'Employees'
  MapPin,
  Clock, // Used for 'Reports'
  Settings,
  Shield,
  Database,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation, UserRole } from "@/hooks/useNavigation";
import { useAuthState } from "@/hooks/useAuthState";

interface AdminSidebarProps {
  onClose?: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

interface AdminMenuItem {
  id: string;
  label: string;
  icon: typeof BarChart3;
  path: string;
  badge?: string;
}

const adminSidebarItems: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employees' },
  { id: 'monitoring', label: 'Live Monitor', icon: MapPin, path: '/admin/attendance' },
  { id: 'reports', label: 'Reports', icon: Clock, path: '/admin/reports' },
  { id: 'employee-approval', label: 'Employee Approval', icon: UserCheck, path: '/admin/employee-approval' },
  { id: 'locations', label: 'Manage Locations', icon: MapPin, path: '/admin/locations' },
  { id: 'system', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  { id: 'data', label: 'Data Export', icon: Database, path: '/admin/export' },
  { id: 'security', label: 'Security Settings', icon: Shield, path: '/admin/security-settings' }, // Updated path and label
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/admin/help' },
];

export function AdminSidebar({ onClose, isDarkMode, onThemeToggle }: AdminSidebarProps) {
  const { activeTab, navigateToPath } = useNavigation("admin");
  const { profile, signOut } = useAuthState();

  const handleItemClick = (path: string, id: string) => {
    navigateToPath(path);
    onClose?.();
  };

  const handleLogout = async () => {
    await signOut();
    navigateToPath('/auth');
    onClose?.();
  };

  const userName = profile?.full_name || "Admin";

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">{userName}</h2>
            <Badge variant="default" className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6">
        <Separator className="bg-sidebar-border" />
      </div>

      <nav className="flex flex-col gap-2 p-6 pt-4 flex-1">
        {adminSidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleItemClick(item.path, item.id)}
              className={cn(
                "justify-start gap-3 h-12 px-4",
                "transition-colors duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="px-6">
        <Separator className="bg-sidebar-border" />
      </div>

      <div className="flex flex-col gap-2 p-6 pt-4">
        {onThemeToggle && (
          <Button
            variant="ghost"
            onClick={onThemeToggle}
            className="justify-start gap-3 h-12 px-4 hover:bg-sidebar-accent text-sidebar-foreground/80"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span>Toggle Theme</span>
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="justify-start gap-3 h-12 px-4 hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground/80"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}