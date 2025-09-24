import { useState, useEffect } from "react";
import { MapPin, Clock, Fingerprint, CheckCircle } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FingerprintScanner } from "@/components/attendance/FingerprintScanner";
import { LocationStatus } from "@/components/attendance/LocationStatus";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type CheckInStep = 'location' | 'biometric' | 'confirmation' | 'complete';

export default function CheckIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckInStep>('location');
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    address?: string;
    verified: boolean;
  }>({ verified: false });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Start location verification automatically
    verifyLocation();
  }, []);

  const verifyLocation = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationData({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: "Main Office Building", // Mock address
              verified: true
            });
            setCurrentStep('biometric');
          },
          (error) => {
            console.error('Location error:', error);
            toast({
              title: "Location Error",
              description: "Unable to verify your location. Please check your GPS settings.",
              variant: "destructive",
            });
          }
        );
      }
    } catch (error) {
      console.error('Geolocation not supported');
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

    try {
      // Here you would save the check-in data to Supabase
      // const checkInData = {
      //   user_id: user.id,
      //   check_in_time: new Date().toISOString(),
      //   location_latitude: locationData.latitude,
      //   location_longitude: locationData.longitude,
      //   location_address: locationData.address,
      //   verification_method: 'biometric'
      // };

      setTimeout(() => {
        setCurrentStep('complete');
        setIsProcessing(false);
        
        toast({
          title: "Check-in Successful!",
          description: "You have been successfully checked in.",
        });

        // Redirect to dashboard after successful check-in
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Check-in Failed",
        description: "Unable to complete check-in. Please try again.",
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
              isVerifying={true}
              isVerified={false}
              address=""
            />
            <p className="text-muted-foreground">
              Please wait while we verify your location...
            </p>
          </div>
        );

      case 'biometric':
        return (
          <div className="text-center space-y-6">
            <LocationStatus 
              isVerifying={false}
              isVerified={locationData.verified}
              address={locationData.address || ""}
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
                    {locationData.address}
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
              <h2 className="text-2xl font-bold text-foreground">
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
    <>
      <Header title="Check In" />
      <EmployeeLayout>
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
                onClick={() => navigate('/dashboard')}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </EmployeeLayout>
    </>
  );
}