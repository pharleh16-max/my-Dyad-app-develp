import { MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LocationStatusProps {
  isVerifying?: boolean;
  isVerified?: boolean;
  address?: string;
  accuracy?: number;
  className?: string;
}

export function LocationStatus({ 
  isVerifying = false,
  isVerified = false,
  address = "",
  accuracy,
  className
}: LocationStatusProps) {
  const getStatusIcon = () => {
    if (isVerifying) {
      return <LoadingSpinner size="sm" />;
    }
    
    if (isVerified) {
      return <CheckCircle className="w-5 h-5 text-accent" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-destructive" />;
  };

  const getStatusText = () => {
    if (isVerifying) {
      return "Verifying location...";
    }
    
    if (isVerified) {
      return "Location verified";
    }
    
    return "Location verification failed";
  };

  const getStatusColor = () => {
    if (isVerifying) {
      return "bg-secondary/10 text-secondary border-secondary/20";
    }
    
    if (isVerified) {
      return "bg-accent/10 text-accent border-accent/20";
    }
    
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Status Indicator */}
      <div className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
        getStatusColor()
      )}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      {/* Location Details */}
      {(isVerified || address) && (
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Current Location</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-1">
            {address || "Location data not available"}
          </p>
          
          {accuracy && (
            <p className="text-xs text-muted-foreground">
              Accuracy: ±{Math.round(accuracy)}m
            </p>
          )}
          
          {isVerified && (
            <div className="mt-2 text-xs text-accent">
              ✓ Within allowed work area
            </div>
          )}
        </div>
      )}

      {/* GPS Signal Strength Indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">GPS Signal:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={cn(
                "w-1 rounded-sm transition-colors duration-200",
                bar === 1 ? "h-2" : bar === 2 ? "h-3" : bar === 3 ? "h-4" : "h-5",
                isVerified 
                  ? bar <= 3 
                    ? "bg-accent" 
                    : "bg-muted"
                  : bar <= 2 
                    ? "bg-secondary" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {isVerified ? "Strong" : isVerifying ? "Searching..." : "Weak"}
        </span>
      </div>
    </div>
  );
}