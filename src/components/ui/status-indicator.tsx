import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: 'success' | 'pending' | 'warning' | 'error';
  label: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  pending: {
    icon: Clock,
    className: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  error: {
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function StatusIndicator({ 
  status, 
  label, 
  className, 
  showIcon = true 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium",
      config.className,
      className
    )}>
      {showIcon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </div>
  );
}