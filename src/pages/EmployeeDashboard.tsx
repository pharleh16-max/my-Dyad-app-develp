import { useState, useEffect } from "react";
import { MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigate } from "react-router-dom";

interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  todayHours: number;
  locationStatus: 'verified' | 'pending' | 'error';
}

export default function EmployeeDashboard() {
  const { profile } = useAuthState();
  const navigate = useNavigate();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    isCheckedIn: false,
    todayHours: 0,
    locationStatus: 'pending'
  });

  useEffect(() => {
    // Mock location verification
    const verifyLocation = () => {
      setTimeout(() => {
        setAttendanceStatus(prev => ({
          ...prev,
          locationStatus: 'verified'
        }));
      }, 2000);
    };

    verifyLocation();
  }, []);

  const handleAttendanceAction = () => {
    if (attendanceStatus.isCheckedIn) {
      navigate('/check-out');
    } else {
      navigate('/check-in');
    }
  };

  const handleNavigation = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'attendance':
        navigate('/check-in');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <>
      <Header title="AttendanceDREAMS" />
      <EmployeeLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Employee'}
            </h1>
            <p className="text-muted-foreground">
              {attendanceStatus.isCheckedIn ? 'You are currently checked in' : 'Ready to start your day?'}
            </p>
          </div>

          {/* Main Attendance Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAttendanceAction}
              className="btn-attendance w-full max-w-sm"
              disabled={attendanceStatus.locationStatus === 'error'}
            >
              {attendanceStatus.isCheckedIn ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Check Out
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 mr-2" />
                  Check In
                </>
              )}
            </Button>
          </div>

          {/* Location Status */}
          <div className="flex justify-center">
            <div className="location-indicator verified">
              <MapPin className="w-4 h-4" />
              <span>
                {attendanceStatus.locationStatus === 'verified' ? 'Location Verified' : 
                 attendanceStatus.locationStatus === 'pending' ? 'Verifying Location...' : 
                 'Location Error'}
              </span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="status-card">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-muted-foreground">Today's Hours</h3>
                <p className="text-2xl font-bold text-foreground">
                  {formatHours(attendanceStatus.todayHours)}
                </p>
              </div>
            </Card>

            <Card className="status-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 mb-2">
                  {attendanceStatus.isCheckedIn ? (
                    <CheckCircle className="w-8 h-8 text-accent" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                <p className="text-lg font-bold text-foreground">
                  {attendanceStatus.isCheckedIn ? 'Checked In' : 'Checked Out'}
                </p>
              </div>
            </Card>
          </div>

          {/* Current Session Info */}
          {attendanceStatus.isCheckedIn && attendanceStatus.checkInTime && (
            <Card className="status-card">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Current Session
                </h3>
                <p className="text-foreground">
                  Started at {new Date(attendanceStatus.checkInTime).toLocaleTimeString()}
                </p>
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="status-card">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">Check In</span>
                <span className="text-sm text-muted-foreground">9:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">Check Out</span>
                <span className="text-sm text-muted-foreground">5:30 PM</span>
              </div>
            </div>
          </Card>
        </div>
      </EmployeeLayout>
      <BottomNavigation activeItem="dashboard" onItemClick={handleNavigation} />
    </>
  );
}