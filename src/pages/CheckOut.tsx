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
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours, differenceInMinutes, parseISO } from "date-fns";

type CheckOutStep = 'location' | 'work-summary' | 'biometric' | 'confirmation' | 'complete';

export default function CheckOut() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthState();
  const [currentStep, setCurrentStep] = useState<CheckOutStep>('location');
  const [workNotes, setWorkNotes] = useState('');
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    address?: string;
    accuracy?: number;
    verified: boolean;
  }>({ verified: false });
  const [workSession, setWorkSession] = useState<{
    id?: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours: number;
  }>({ totalHours: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(true);

  useEffect(() => {
    const fetchLatestCheckIn = async () => {
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const { data, error } = await supabase
        .from('attendance_records')
        .select('id, check_in_time')
        .eq('user_id', user.id)
        .is('check_out_time', null) // Find open sessions
        .gte('check_in_time', today.toISOString())
        .lt('check_in_time', tomorrow.toISOString())
        .order('check_in_time', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching latest check-in:', error);
        toast({
          title: "Error",
          description: "Could not retrieve your last check-in. Please try again.",
          variant: "destructive",
        });
        navigate('/dashboard'); // Redirect if no active session found
        return;
      }

      if (data) {
        const checkInDate = parseISO(data.check_in_time);
        const now = new Date();
        const hours = differenceInHours(now, checkInDate);
        const minutes = differenceInMinutes(now, checkInDate) % 60;
        const totalHours = hours + minutes / 60;

        setWorkSession({
          id: data.id,
          checkInTime: checkInDate.toLocaleTimeString(),
          checkOutTime: now.toLocaleTimeString(),
          totalHours: parseFloat(totalHours.toFixed(2)),
        });
      } else {
        toast({
          title: "No Active Check-in",
          description: "You are not currently checked in. Redirecting to dashboard.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    };

    fetchLatestCheckIn();
    verifyLocation();
  }, [user, navigate, toast]);

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
            setCurrentStep('work-summary');
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

    if (!user || !workSession.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated or no active session. Please log in again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: new Date().toISOString(),
          notes: workNotes,
          location_latitude: locationData.latitude,
          location_longitude: locationData.longitude,
          location_address: locationData.address,
          location_accuracy: locationData.accuracy,
        })
        .eq('id', workSession.id);

      if (error) {
        throw error;
      }

      setCurrentStep('complete');
      setIsProcessing(false);
      
      toast({
        title: "Check-out Successful!",
        description: `Great work today! You worked ${formatHours(workSession.totalHours)} hours.`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      setIsProcessing(false);
      toast({
        title: "Check-out Failed",
        description: `Unable to complete check-out: ${error.message || 'An unknown error occurred.'}`,
        variant: "destructive",
      });
    }
  };

  const formatHours = (hours: number) => {
    if (isNaN(hours) || hours < 0) return '0h 0m';
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

      case 'work-summary':
        return (
          <div className="space-y-6">
            <LocationStatus 
              isVerifying={false}
              isVerified={locationData.verified}
              address={locationData.address || ""}
              accuracy={locationData.accuracy}
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
                      {workSession.checkInTime || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ending:</span>
                    <span className="text-sm font-medium text-foreground">
                      {workSession.checkOutTime || '-'}
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
                    {workSession.checkOutTime || '-'}
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