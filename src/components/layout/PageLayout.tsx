import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
  fullHeight?: boolean;
}

export function PageLayout({ 
  children, 
  className,
  hasBottomNav = true,
  hasHeader = true,
  fullHeight = true
}: PageLayoutProps) {
  return (
    <div className={cn(
      "w-full",
      fullHeight && "min-h-screen",
      hasHeader && "pt-16", // Account for fixed header
      hasBottomNav && "pb-16", // Account for fixed bottom nav
      className
    )}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        {children}
      </div>
    </div>
  );
}