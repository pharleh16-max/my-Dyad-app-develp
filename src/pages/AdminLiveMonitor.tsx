import React, { useMemo, useCallback, useState } from "react";
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
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<'profiles'>;
type AttendanceRecord = Tables<'attendance_records'>;

interface EmployeeLiveStatus extends Profile {
  attendance: {
    status: 'checked_in' | 'checked_out' | 'no_record';
    checkInTime?: string;
    checkOutTime?: string;
    locationAddress?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    lastUpdate?: string;
  };
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: 'var(--radius)',
};

const defaultCenter = {
  lat: 34.052235, // Default to Los Angeles for now
  lng: -118.243683,
};

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
  const { toast } = useToast();

  const userName = adminProfile?.full_name || "Admin";
  const userRole = adminProfile?.role || "admin";

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || '',
    libraries: ["places"], // Optional: if you need places API
  });

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
        locationLatitude?: number;
        locationLongitude?: number;
        lastUpdate?: string;
      }>();

      for (const record of attendanceData) {
        // Only consider the latest record for each user for today
        if (!employeeStatusMap.has(record.user_id)) {
          const isCheckedIn = !record.check_out_time;
          employeeStatusMap.set(record.user_id, {
            status: isCheckedIn ? 'checked_in' : 'checked_out',
            checkInTime: record.check_in_time,
            checkOutTime: record.check_out_time || undefined,
            locationAddress: record.location_address || undefined,
            locationLatitude: record.location_latitude || undefined,
            locationLongitude: record.location_longitude || undefined,
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

  const mapCenter = useMemo(() => {
    const checkedInEmployees = employeesWithAttendance?.filter(
      (emp) => emp.attendance.status === 'checked_in' && emp.attendance.locationLatitude && emp.attendance.locationLongitude
    );

    if (checkedInEmployees && checkedInEmployees.length > 0) {
      const avgLat = checkedInEmployees.reduce((sum, emp) => sum + (emp.attendance.locationLatitude || 0), 0) / checkedInEmployees.length;
      const avgLng = checkedInEmployees.reduce((sum, emp) => sum + (emp.attendance.locationLongitude || 0), 0) / checkedInEmployees.length;
      return { lat: avgLat, lng: avgLng };
    }
    return defaultCenter;
  }, [employeesWithAttendance]);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (isLoading || !isLoaded) {
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

  if (loadError) {
    toast({
      title: "Google Maps Error",
      description: "Failed to load Google Maps. Please check your API key and network connection.",
      variant: "destructive",
    });
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
          Error loading map: {loadError.message}. Please ensure your `VITE_GOOGLE_MAPS_API_KEY` is correctly set in your `.env` file.
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

        {/* Live Map */}
        <Card className="status-card p-0 overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-6 h-6 text-primary" />
              Employee Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {googleMapsApiKey ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {employeesWithAttendance?.map((employee) =>
                  employee.attendance.status === 'checked_in' &&
                  employee.attendance.locationLatitude &&
                  employee.attendance.locationLongitude ? (
                    <MarkerF
                      key={employee.id}
                      position={{
                        lat: employee.attendance.locationLatitude,
                        lng: employee.attendance.locationLongitude,
                      }}
                      title={employee.full_name || "Employee"}
                      // You can customize marker icon here if needed
                    />
                  ) : null
                )}
              </GoogleMap>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-muted/50 border-dashed border-2 border-border m-6 rounded-lg">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-xl text-muted-foreground">
                  Google Maps API Key Missing
                </h3>
                <p className="text-muted-foreground text-sm mt-2 text-center px-4">
                  Please add your Google Maps API key to the `VITE_GOOGLE_MAPS_API_KEY` environment variable in your `.env` file to enable the map.
                </p>
              </div>
            )}
          </CardContent>
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