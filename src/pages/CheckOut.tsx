import { useState, useEffect } from "react";
import { MapPin, Clock, Fingerprint, CheckCircle } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FingerprintScanner } from "@/components/attendance/FingerprintScanner";
import { LocationStatus } from "@/components/attendance/LocationStatus";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type CheckOutStep = 'location' | 'work-summary' | 'biometric' | 'confirmation' | 'complete';

export default function CheckOut() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckOutStep>('location');
  const [workNotes, setWorkNotes] = useState('');
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    address?: string;
    verified: boolean;
  }>({ verified: false });
  const [workSession, setWorkSession] = useState({
    startTime: '9:00 AM',
    endTime: new Date().toLocaleTimeString(),
    totalHours: 8.5,
  });
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
            setCurrentStep('work-summary');
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

  const handleWorkSummaryNext = () => {
    setCurrentStep('biometric');
  };

  const handleBiometricComplete = async () => {
    setIsProcessing(true);
    
    // Simulate biometric verification
    setTimeout(() => {
      setCurrentStep('confirmation');
      setIsProcessing(false);
    }, 2000);
  };

  const handleConfirmCheckOut = async () => {
    setIsProcessing(true);

    try {
      // Here you would save the check-out data to Supabase
      // const checkOutData = {
      //   user_id: user.id,
      //   check_out_time: new Date().toISOString(),
      //   work_notes: workNotes,
      //   total_hours: workSession.totalHours,
      //   location_latitude: locationData.latitude,
      //   location_longitude: locationData.longitude,
      //   location_address: locationData.address,
      //   verification_method: 'biometric'
      // };

      setTimeout(() => {
        setCurrentStep('complete');
        setIsProcessing(false);
        
        toast({
          title: "Check-out Successful!",
          description: `Great work today! You worked ${workSession.totalHours} hours.`,
        });

        // Redirect to dashboard after successful check-out
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Check-out Failed",
        description: "Unable to complete check-out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
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

      case 'work-summary':
        return (
          <div className="space-y-6">
            <LocationStatus 
              isVerifying={false}
              isVerified={locationData.verified}
              address={locationData.address || ""}
            />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground text-center">
                Work Summary
              </h2>
              
              {/* Today's Work Hours */}
              <Card className="status-card">
                <h3 className="font-semibold text-foreground mb-3">Today's Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Started:</span>
                    <span className="text-sm font-medium text-foreground">
                      {workSession.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ending:</span>
                    <span className="text-sm font-medium text-foreground">
                      {workSession.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-sm font-medium text-foreground">Total Hours:</span>
                    <span className="text-lg font-bold text-accent">
                      {formatHours(workSession.totalHours)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Work Notes */}
              <div className="space-y-2">
                <Label htmlFor="work-notes" className="text-sm font-medium text-foreground">
                  Work Notes (Optional)
                </Label>
                <Textarea
                  id="work-notes"
                  placeholder="Add any notes about today's work, projects completed, or important updates..."
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  These notes will be included in your daily report
                </p>
              </div>

              <Button
                onClick={handleWorkSummaryNext}
                className="btn-attendance w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'biometric':
        return (
          <div className="text-center space-y-6">
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
                Ready to Check Out
              </h2>
              <p className="text-muted-foreground">
                Confirm your check-out details below
              </p>
            </div>

            <Card className="status-card text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">End Time:</span>
                  <span className="text-sm font-medium text-foreground">
                    {workSession.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Hours:</span>
                  <span className="text-sm font-medium text-accent">
                    {formatHours(workSession.totalHours)}
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
              onClick={handleConfirmCheckOut}
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
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Check Out
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
                Great Work Today!
              </h2>
              <p className="text-muted-foreground">
                You have been successfully checked out
              </p>
              <p className="text-lg font-semibold text-accent">
                Total: {formatHours(workSession.totalHours)}
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
      <Header title="Check Out" />
      <EmployeeLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check Out
            </h1>
            <p className="text-muted-foreground">
              Complete your work day check-out process
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {(['location', 'work-summary', 'biometric', 'confirmation'] as CheckOutStep[]).map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    currentStep === step || 
                    (['location', 'work-summary', 'biometric', 'confirmation'] as CheckOutStep[]).indexOf(currentStep) > index
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
          {(currentStep === 'work-summary' || currentStep === 'biometric') && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 'biometric') {
                    setCurrentStep('work-summary');
                  } else {
                    navigate('/dashboard');
                  }
                }}
                disabled={isProcessing}
              >
                {currentStep === 'work-summary' ? 'Cancel' : 'Back'}
              </Button>
            </div>
          )}
        </div>
      </EmployeeLayout>
    </>
  );
}