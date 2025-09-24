import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar"; // Import AdminSidebar
import { AdminHeader } from "./AdminHeader"; // Import AdminHeader

interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode; // This will be used for the desktop sidebar
  hasBottomNav?: boolean; // This is for mobile bottom nav
  hasHeader?: boolean; // This is for the header
}

export function AdminLayout({ 
  children, 
  className,
  sidebar,
  hasBottomNav = true,
  hasHeader = true
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {hasHeader && <AdminHeader title="Admin Dashboard" />} {/* Use AdminHeader */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {sidebar}
          </aside>
        )}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 w-full overflow-auto",
          hasBottomNav && "pb-16 lg:pb-0", // Bottom nav only on mobile
          className
        )}>
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}