import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
}

export function AdminLayout({ 
  children, 
  className,
  sidebar,
  hasBottomNav = true,
  hasHeader = true
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 border-r bg-card">
            {sidebar}
          </aside>
        )}
        
        {/* Main Content */}
        <div className="flex-1">
          <main className={cn(
            "w-full",
            hasHeader && "pt-16", // Account for fixed header
            hasBottomNav && "pb-16 lg:pb-0", // Bottom nav only on mobile
            className
          )}>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}