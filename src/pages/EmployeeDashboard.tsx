import { useState, useEffect } from "react";
import { MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { differenceInHours, differenceInMinutes, format, parseISO, startOfDay } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AttendanceRecord {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  location_address: string | null;
  location_accuracy: number | null;
  notes: string | null;
  created_at: string;
}

export default function EmployeeDashboard() {
  const { profile, user, isLoading: authLoading } = useAuthState();
  const navigate = useNavigate();

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const { data: latestAttendance, isLoading: attendanceLoading, error: attendanceError } = useQuery<AttendanceRecord | null>({
    queryKey: ['latestAttendance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in_time', today.toISOString())
        .lt('check_in_time', tomorrow.toISOString())
        .order('check_in_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching latest attendance:', error);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: recentActivities, isLoading: recentActivityLoading, error: recentActivityError } = useQuery<AttendanceRecord[]>({
    queryKey: ['recentActivities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('check_in_time, check_out_time')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2); // Fetch last 2 activities

      if (error) {
        console.error('Error fetching recent activities:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!user,
  });

  const isCheckedIn = !!latestAttendance && !latestAttendance.check_out_time;
  const checkInTime = latestAttendance?.check_in_time ? format(parseISO(latestAttendance.check_in_time), 'p') : undefined;

  const calculateTodayHours = () => {
    if (latestAttendance?.check_in_time) {
      const checkInDate = parseISO(latestAttendance.check_in_time);
      const endDate = latestAttendance.check_out_time ? parseISO(latestAttendance.check_out_time) : new Date();
      const hours = differenceInHours(endDate, checkInDate);
      const minutes = differenceInMinutes(endDate, checkInDate) % 60;
      return parseFloat((hours + minutes / 60).toFixed(2));
    }
    return 0;
  };

  const todayHours = calculateTodayHours();

  // Mock location verification for now, can be replaced with real logic later
  const [locationStatus, setLocationStatus] = useState<'verified' | 'pending' | 'error'>('pending');
  useEffect(() => {
    const verifyLocation = () => {
      setTimeout(() => {
        setLocationStatus('verified');
      }, 2000);
    };
    verifyLocation();
  }, []);

  const handleAttendanceAction = () => {
    if (isCheckedIn) {
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
    if (isNaN(hours) || hours < 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
  };

  if (authLoading || attendanceLoading || recentActivityLoading) {
    return (
      <EmployeeLayout centered hasBottomNav={false} hasHeader={false}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </EmployeeLayout>
    );
  }

  if (attendanceError || recentActivityError) {
    return (
      <EmployeeLayout centered hasBottomNav={false} hasHeader={false}>
        <div className="text-center text-destructive">
          Error loading dashboard data: {attendanceError?.message || recentActivityError?.message}
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <>
      <Header title="DREAMS Attendance Management System" />
      <EmployeeLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Employee'}
            </h1>
            <p className="text-muted-foreground">
              {isCheckedIn ? 'You are currently checked in' : 'Ready to start your day?'}
            </p>
          </div>

          {/* Main Attendance Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAttendanceAction}
              className="btn-attendance w-full max-w-sm"
              disabled={locationStatus === 'error'}
            >
              {isCheckedIn ? (
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
                {locationStatus === 'verified' ? 'Location Verified' : 
                 locationStatus === 'pending' ? 'Verifying Location...' : 
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
                  {formatHours(todayHours)}
                </p>
              </div>
            </Card>

            <Card className="status-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 mb-2">
                  {isCheckedIn ? (
                    <CheckCircle className="w-8 h-8 text-accent" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                <p className="text-lg font-bold text-foreground">
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </p>
              </div>
            </Card>
          </div>

          {/* Current Session Info */}
          {isCheckedIn && checkInTime && (
            <Card className="status-card">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Current Session
                </h3>
                <p className="text-foreground">
                  Started at {checkInTime}
                </p>
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="status-card">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivities?.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">
                      {activity.check_out_time ? 'Check Out' : 'Check In'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(activity.check_out_time || activity.check_in_time), 'p')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">No recent activity.</p>
              )}
            </div>
          </Card>
        </div>
      </EmployeeLayout>
      <BottomNavigation activeItem="dashboard" onItemClick={handleNavigation} />
    </>
  );
}