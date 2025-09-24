import { useState, useEffect } from "react";
import { MapPin, Clock, Fingerprint, CheckCircle } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header"; // Keep Header import for title prop
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FingerprintScanner } from "@/components/attendance/FingerprintScanner";
import { LocationStatus } from "@/components/attendance/LocationStatus";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { useNavigation } from "@/hooks/useNavigation"; // Import useNavigation
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile

type CheckInStep = 'location' | 'biometric' | 'confirmation' | 'complete';

export default function CheckIn() {
  const { profile, user } = useAuthState(); // Get profile for userName and userRole
  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  } = useNavigation("employee");

  const userName = profile?.full_name || "Employee";
  const userRole = profile?.role || "employee";

  const navigate = useNavigate(); // Keep for direct navigation if needed, but prefer navigateToPath
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckInStep>('location');
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    address?: string;
    accuracy?: number;
    verified: boolean;
  }>({ verified: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(true);

  useEffect(() => {
    verifyLocation();
  }, []);

  const verifyLocation = async () => {
    setIsVerifyingLocation(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationData({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: "Main Office Building", // Mock address for display, can be reverse geocoded later
              accuracy: position.coords.accuracy,
              verified: true
            });
            setIsVerifyingLocation(false);
            setCurrentStep('biometric');
          },
          (error) => {
            console.error('Location error:', error);
            setLocationData(prev => ({ ...prev, verified: false }));
            setIsVerifyingLocation(false);
            toast({
              title: "Location Error",
              description: "Unable to verify your location. Please check your GPS settings and permissions.",
              variant: "destructive",
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        console.error('Geolocation not supported');
        setLocationData(prev => ({ ...prev, verified: false }));
        setIsVerifyingLocation(false);
        toast({
          title: "Location Error",
          description: "Geolocation is not supported by your browser.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error with geolocation:', error);
      setLocationData(prev => ({ ...prev, verified: false }));
      setIsVerifyingLocation(false);
      toast({
        title: "Location Error",
        description: "An unexpected error occurred during location verification.",
        variant: "destructive",
      });
    }
  };

  const handleBiometricComplete = async () => {
    setIsProcessing(true);
    
    // Simulate biometric verification
    setTimeout(() => {
      setCurrentStep('confirmation');
      setIsProcessing(false);
    }, 2000);
  };

  const handleConfirmCheckIn = async () => {
    setIsProcessing(true);

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          user_id: user.id,
          check_in_time: new Date().toISOString(),
          location_latitude: locationData.latitude,
          location_longitude: locationData.longitude,
          location_address: locationData.address,
          location_accuracy: locationData.accuracy,
          notes: "Biometric check-in" // Default note for now
        });

      if (error) {
        throw error;
      }

      setCurrentStep('complete');
      setIsProcessing(false);
      
      toast({
        title: "Check-in Successful!",
        description: "You have been successfully checked in.",
      });

      setTimeout(() => {
        navigateToPath('/dashboard'); // Use navigateToPath
      }, 2000);
    } catch (error: any) {
      setIsProcessing(false);
      toast({
        title: "Check-in Failed",
        description: `Unable to complete check-in: ${error.message || 'An unknown error occurred.'}`,
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return (
          <div className="text-center space-y-6">
            <LocationStatus 
              isVerifying={isVerifyingLocation}
              isVerified={locationData.verified}
              address={locationData.address || ""}
              accuracy={locationData.accuracy}
            />
            <p className="text-muted-foreground">
              {isVerifyingLocation ? "Please wait while we verify your location..." : "Location verification failed. Please ensure GPS is enabled."}
            </p>
            {!isVerifyingLocation && !locationData.verified && (
              <Button onClick={verifyLocation} className="btn-attendance">
                Retry Location
              </Button>
            )}
          </div>
        );

      case 'biometric':
        return (
          <div className="text-center space-y-6">
            <LocationStatus 
              isVerifying={false}
              isVerified={locationData.verified}
              address={locationData.address || ""}
              accuracy={locationData.accuracy}
            />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Biometric Verification
              </h2>
              <p className="text-muted-foreground">
                Place your finger on the scanner to verify your identity
              </p>
              
              <div className="flex justify-center">
                <FingerprintScanner 
                  isScanning={!isProcessing}
                  onScanComplete={handleBiometricComplete}
                />
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-muted-foreground">Verifying...</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-accent mx-auto" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Ready to Check In
              </h2>
              <p className="text-muted-foreground">
                Confirm your check-in details below
              </p>
            </div>

            <Card className="status-card text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium text-foreground">
                    {locationData.address} {locationData.accuracy ? `(±${Math.round(locationData.accuracy)}m)` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Verification:</span>
                  <span className="text-sm font-medium text-accent">
                    Biometric ✓
                  </span>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleConfirmCheckIn}
              disabled={isProcessing}
              className="btn-attendance w-full max-w-sm"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Confirm Check In
                </>
              )}
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-20 h-20 text-accent mx-auto" />
            
            <div className="space-y-2">
              <h2 className="2xl font-bold text-foreground">
                Welcome to Work!
              </h2>
              <p className="text-muted-foreground">
                You have been successfully checked in
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <EmployeeLayout
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
      hasBottomNav={true}
      hasHeader={true}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check In
          </h1>
          <p className="text-muted-foreground">
            Follow the steps to complete your check-in
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {(['location', 'biometric', 'confirmation'] as CheckInStep[]).map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  currentStep === step || 
                  (['location', 'biometric', 'confirmation'] as CheckInStep[]).indexOf(currentStep) > index
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Back Button */}
        {currentStep === 'biometric' && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigateToPath('/dashboard')} // Use navigateToPath
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}