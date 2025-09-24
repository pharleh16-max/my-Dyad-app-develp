import { useState, useEffect } from "react";
import { Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface FingerprintScannerProps {
  isScanning?: boolean;
  onScanComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FingerprintScanner({ 
  isScanning = false, 
  onScanComplete,
  size = 'lg',
  className 
}: FingerprintScannerProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28', 
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  useEffect(() => {
    if (isScanning) {
      setScanProgress(0);
      setIsComplete(false);
      
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsComplete(true);
            setTimeout(() => {
              onScanComplete?.();
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setScanProgress(0);
      setIsComplete(false);
    }
  }, [isScanning, onScanComplete]);

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "fingerprint-scanner",
          sizeClasses[size],
          isScanning && "scanning",
          isComplete && "border-accent"
        )}
      >
        <Fingerprint 
          className={cn(
            iconSizes[size],
            "text-primary transition-colors duration-300",
            isComplete && "text-accent"
          )}
        />
        
        {/* Scan Progress Ring */}
        {isScanning && (
          <svg 
            className="absolute inset-0 -rotate-90" 
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={`${scanProgress * 2.827} 283`}
              strokeLinecap="round"
              className="transition-all duration-100 ease-linear"
              style={{
                filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.6))'
              }}
            />
          </svg>
        )}
        
        {/* Scanning Animation */}
        {isScanning && !isComplete && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-ping" />
          </div>
        )}
        
        {/* Success Animation */}
        {isComplete && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-2 rounded-full bg-accent/20 animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Status Text */}
      <div className="mt-4 text-center">
        {!isScanning && !isComplete && (
          <p className="text-sm text-muted-foreground">
            Place finger on scanner
          </p>
        )}
        {isScanning && !isComplete && (
          <p className="text-sm text-primary font-medium">
            Scanning... {Math.round(scanProgress)}%
          </p>
        )}
        {isComplete && (
          <p className="text-sm text-accent font-medium">
            Scan complete ✓
          </p>
        )}
      </div>
    </div>
  );
}