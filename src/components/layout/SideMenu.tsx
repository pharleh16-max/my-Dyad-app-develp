import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  HelpCircle, 
  Bell, 
  LogOut, 
  Shield,
  Database,
  Users2, // Keep Users2 for Employee Management icon
  MapPin,
  FileText,
  Moon,
  Sun,
  UserCheck, // Added for Employee Approval
  BarChart3 // Added for Dashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/hooks/useAuthState"; // Import useAuthState

interface MenuItem {
  id: string;
  label: string;
  icon: typeof Settings;
  path: string;
  badge?: string;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'employee' | 'admin';
  userName?: string;
  onItemClick: (path: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const employeeMenuItems: MenuItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
];

const adminMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
  { id: 'employees', label: 'Employee Management', icon: Users2, path: '/admin/employees' },
  { id: 'monitoring', label: 'Live Monitor', icon: MapPin, path: '/admin/attendance' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
  { id: 'employee-approval', label: 'Employee Approval', icon: UserCheck, path: '/admin/employee-approval' },
  { id: 'locations', label: 'Manage Locations', icon: MapPin, path: '/admin/locations' },
  { id: 'system', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  { id: 'data', label: 'Data Export', icon: Database, path: '/admin/export' },
  { id: 'security', label: 'Security Settings', icon: Shield, path: '/admin/security-settings' }, // Updated path and label
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/admin/help' },
];

export function SideMenu({ 
  isOpen, 
  onClose, 
  userRole = 'employee',
  userName = 'User',
  onItemClick,
  isDarkMode = false,
  onThemeToggle
}: SideMenuProps) {
  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;
  const { signOut } = useAuthState(); // Use useAuthState hook

  const handleItemClick = (path: string) => {
    onItemClick(path);
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onItemClick('/auth'); // Navigate to auth page after logout
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <SheetTitle className="text-left">{userName}</SheetTitle>
              <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {userRole === 'admin' ? 'Administrator' : 'Employee'}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6">
          <Separator />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 p-6 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleItemClick(item.path)}
                className={cn(
                  "justify-start gap-3 h-12 px-4",
                  "hover:bg-muted text-foreground/80 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="px-6">
          <Separator />
        </div>

        {/* Theme Toggle and Logout */}
        <div className="flex flex-col gap-2 p-6 pt-4">
          <Button
            variant="ghost"
            onClick={onThemeToggle}
            className="justify-start gap-3 h-12 px-4 hover:bg-muted"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span>Toggle Theme</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleLogout} // Call the new handleLogout function
            className="justify-start gap-3 h-12 px-4 hover:bg-destructive/10 hover:text-destructive text-foreground/80"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}