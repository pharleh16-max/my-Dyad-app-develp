import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SideMenu } from "./SideMenu";
import { BottomNavigation } from "./BottomNavigation";
import { UserRole } from "@/hooks/useNavigation"; // Import UserRole type

interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
  pageTitle: string;
  isMobile: boolean; // Pass isMobile as a prop
  activeTab: string;
  sideMenuOpen: boolean;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  navigateToTab: (tab: string) => void;
  navigateToPath: (path: string) => void;
  userName: string;
  userRole: UserRole;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
}

export function AdminLayout({
  children,
  className,
  pageTitle,
  isMobile,
  activeTab,
  sideMenuOpen,
  toggleSideMenu,
  closeSideMenu,
  navigateToTab,
  navigateToPath,
  userName,
  userRole,
  isDarkMode,
  onThemeToggle,
  hasBottomNav = true,
  hasHeader = true
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {hasHeader && (
        <AdminHeader
          title={pageTitle}
          onMenuClick={toggleSideMenu}
          userRole={userRole}
          userName={userName}
        />
      )}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <AdminSidebar
              onClose={closeSideMenu}
              isDarkMode={isDarkMode}
              onThemeToggle={onThemeToggle}
            />
          </aside>
        )}

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

        {/* Main Content */}
        <main className={cn(
          "flex-1 w-full overflow-auto",
          hasBottomNav && isMobile && "pb-16 lg:pb-0",
          className
        )}>
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      {isMobile && hasBottomNav && (
        <BottomNavigation activeItem={activeTab} onItemClick={navigateToTab} userRole={userRole} />
      )}
    </div>
  );
}