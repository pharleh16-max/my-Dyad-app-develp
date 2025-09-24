import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { SideMenu } from "./SideMenu"; // Import SideMenu
import { UserRole } from "@/hooks/useNavigation"; // Import UserRole type

interface EmployeeLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
  centered?: boolean;
  // Props for SideMenu and Header integration
  isMobile: boolean;
  activeTab: string;
  sideMenuOpen: boolean;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  navigateToPath: (path: string) => void;
  userName: string;
  userRole: UserRole;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export function EmployeeLayout({ 
  children, 
  className,
  hasBottomNav = true,
  hasHeader = true,
  centered = false,
  // SideMenu and Header integration props
  isMobile,
  activeTab,
  sideMenuOpen,
  toggleSideMenu,
  closeSideMenu,
  navigateToPath,
  userName,
  userRole,
  isDarkMode,
  onThemeToggle,
}: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {hasHeader && (
        <Header
          title="DREAMS Attendance" // Default title, can be overridden by specific pages if needed
          showMenu={true}
          onMenuClick={toggleSideMenu} // Connect menu button to toggleSideMenu
          userRole={userRole}
          userName={userName}
          // onSettingsClick and onNotificationsClick can be added here if needed for employee header
        />
      )}

      <div className="flex flex-1">
        {/* Mobile Side Menu (Sheet) */}
        {isMobile && (
          <SideMenu
            isOpen={sideMenuOpen}
            onClose={closeSideMenu}
            userRole={userRole}
            userName={userName}
            onItemClick={navigateToPath}
            isDarkMode={isDarkMode}
            onThemeToggle={onThemeToggle}
          />
        )}

        <main className={cn(
          "flex-1 w-full overflow-auto",
          hasHeader && "pt-16", // Account for fixed header
          hasBottomNav && "pb-16", // Account for fixed bottom nav
          centered && "flex items-center justify-center",
          className
        )}>
          <div className={cn(
            "container mx-auto px-4",
            !centered && "py-6",
            "max-w-md" // Mobile-first max width
          )}>
            {children}
          </div>
        </main>
      </div>
      
      {hasBottomNav && (
        <BottomNavigation activeItem={activeTab} onItemClick={navigateToPath} userRole={userRole} />
      )}
    </div>
  );
}