import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmployeeLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
  centered?: boolean;
}

export function EmployeeLayout({ 
  children, 
  className,
  hasBottomNav = true,
  hasHeader = true,
  centered = false
}: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={cn(
        "w-full",
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
  );
}