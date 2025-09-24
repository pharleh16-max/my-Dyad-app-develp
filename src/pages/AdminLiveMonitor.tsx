import React, { useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tables } from "@/integrations/supabase/types";
import { format, startOfDay, addDays, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

type Profile = Tables<'profiles'>;
type AttendanceRecord = Tables<'attendance_records'>;

interface EmployeeLiveStatus extends Profile {
  attendance: {
    status: 'checked_in' | 'checked_out' | 'no_record';
    checkInTime?: string;
    checkOutTime?: string;
    locationAddress?: string;
    lastUpdate?: string;
  };
}

export default function AdminLiveMonitor() {
  const { profile: adminProfile } = useAuthState();
  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  } = useNavigation("admin");

  const userName = adminProfile?.full_name || "Admin";
  const userRole = adminProfile?.role || "admin";

  const { data: employeesWithAttendance, isLoading, error } = useQuery<EmployeeLiveStatus[]>({
    queryKey: ['liveAttendance'],
    queryFn: async () => {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);

      // Fetch all active employee profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id, profile_photo_url, role, status, email')
        .eq('status', 'active') // Only show active employees
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch all attendance records for today
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('user_id, check_in_time, check_out_time, location_address, location_latitude, location_longitude, updated_at')
        .gte('check_in_time', today.toISOString())
        .lt('check_in_time', tomorrow.toISOString())
        .order('check_in_time', { ascending: false }); // Order to easily find latest

      if (attendanceError) throw attendanceError;

      // Process data to get latest status for each user
      const employeeStatusMap = new Map<string, {
        status: 'checked_in' | 'checked_out';
        checkInTime?: string;
        checkOutTime?: string;
        locationAddress?: string;
        lastUpdate?: string;
      }>();

      for (const record of attendanceData) {
        if (!employeeStatusMap.has(record.user_id)) {
          const isCheckedIn = !record.check_out_time;
          employeeStatusMap.set(record.user_id, {
            status: isCheckedIn ? 'checked_in' : 'checked_out',
            checkInTime: record.check_in_time,
            checkOutTime: record.check_out_time || undefined,
            locationAddress: record.location_address || undefined,
            lastUpdate: record.updated_at || record.check_in_time,
          });
        }
      }

      // Combine profiles with their attendance status
      return profilesData.map(profile => {
        const status = employeeStatusMap.get(profile.id) || { status: 'no_record' };
        return {
          ...profile,
          attendance: status,
        };
      });
    },
    refetchInterval: 30000, // Refetch every 30 seconds for a "live" feel
  });

  const getStatusBadge = (status: EmployeeLiveStatus['attendance']['status']) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-accent/10 text-accent border-accent/20"><CheckCircle className="w-3 h-3 mr-1" /> Checked In</Badge>;
      case 'checked_out':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20"><XCircle className="w-3 h-3 mr-1" /> Checked Out</Badge>;
      case 'no_record':
      default:
        return <Badge variant="outline" className="text-muted-foreground"><AlertCircle className="w-3 h-3 mr-1" /> No Record Today</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        pageTitle="Live Attendance Monitor"
        isMobile={isMobile}
        activeTab={activeTab}
        sideMenuOpen={sideMenuOpen}
        toggleSideMenu={toggleSideMenu}
        closeSideMenu={closeSideMenu}
        navigateToTab={navigateToTab}
        navigateToPath={navigateToPath}
        userName={userName}
        userRole={userRole}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        pageTitle="Live Attendance Monitor"
        isMobile={isMobile}
        activeTab={activeTab}
        sideMenuOpen={sideMenuOpen}
        toggleSideMenu={toggleSideMenu}
        closeSideMenu={closeSideMenu}
        navigateToTab={navigateToTab}
        navigateToPath={navigateToPath}
        userName={userName}
        userRole={userRole}
      >
        <div className="text-center text-destructive p-6">
          Error loading live attendance data: {error.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Live Attendance Monitor"
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu}
      navigateToTab={navigateToTab}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Live Attendance Monitor
          </h1>
          <p className="text-muted-foreground">
            Monitor real-time employee check-ins and check-outs.
          </p>
        </div>

        {/* Live Map Placeholder */}
        <Card className="status-card p-6 flex flex-col items-center justify-center h-64 bg-muted/50 border-dashed border-2 border-border">
          <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-xl text-muted-foreground">
            Live Map (Coming Soon)
          </h3>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            An interactive map showing employee locations will appear here.
          </p>
        </Card>

        {/* Employee Status List */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-6 h-6 text-primary" />
              Employee Status Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {employeesWithAttendance && employeesWithAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeesWithAttendance.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.full_name}</TableCell>
                        <TableCell>{getStatusBadge(employee.attendance.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {employee.attendance.lastUpdate ? format(parseISO(employee.attendance.lastUpdate), 'p') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {employee.attendance.locationAddress || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No active employees or attendance records for today.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}