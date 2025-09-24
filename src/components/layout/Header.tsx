import { Button } from "@/components/ui/button";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState } from "@/hooks/useAuthState"; // Import useAuthState
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  userRole?: 'employee' | 'admin';
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

export function Header({ 
  title, 
  showMenu = true, 
  onMenuClick, 
  showNotifications = true, 
  notificationCount = 0,
  userRole = 'employee',
  onSettingsClick,
  onNotificationsClick
}: HeaderProps) {
  const { signOut, profile } = useAuthState();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileSettingsClick = () => {
    if (userRole === 'admin') {
      navigate('/admin/profile'); // Navigate to Admin's personal profile page
    } else {
      navigate('/profile'); // Employees go to their profile page
    }
  };

  const displayUserName = profile?.full_name || (userRole === 'admin' ? 'Administrator' : 'Employee');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-4">
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {userRole === 'admin' && (
              <Badge variant="secondary" className="text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative" onClick={onNotificationsClick}>
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayUserName}</p>
                  {profile?.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}