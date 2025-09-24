import { Home, Clock, History, User, Users, BarChart3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

interface BottomNavigationProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  userRole?: 'employee' | 'admin';
}

const employeeNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'attendance', label: 'Check In/Out', icon: Clock, path: '/check-in' }, // Corrected path
  { id: 'history', label: 'History', icon: History, path: '/history' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employees' },
  { id: 'monitoring', label: 'Live Monitor', icon: MapPin, path: '/admin/attendance' },
  { id: 'reports', label: 'Reports', icon: History, path: '/admin/reports' },
];

export function BottomNavigation({ 
  activeItem, 
  onItemClick, 
  userRole = 'employee' 
}: BottomNavigationProps) {
  const navItems = userRole === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onItemClick(item.path)}
              className={cn(
                "flex-col gap-1 h-full rounded-none border-none",
                "text-xs font-medium transition-colors duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-t-full" />
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}