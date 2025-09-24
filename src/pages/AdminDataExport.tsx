import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download, FileText, Users2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;
type AttendanceRecord = Tables<'attendance_records'>;

export default function AdminDataExport() {
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

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
    to: new Date(),
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | 'all'>('all');
  const [reportType, setReportType] = useState<'attendance' | 'employees'>('attendance');

  // Fetch all employees for the filter dropdown
  const { data: employees, isLoading: isLoadingEmployees, error: employeesError } = useQuery<Profile[]>({
    queryKey: ['allEmployees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const handleExportCSV = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Export Failed",
        description: "Please select a valid date range.",
        variant: "destructive",
      });
      return;
    }

    let csvContent = "";
    let filename = "";

    try {
      if (reportType === 'attendance') {
        filename = `attendance_report_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
        csvContent = "Date,Employee Name,Check In,Check Out,Location,Notes\n";

        let query = supabase
          .from('attendance_records')
          .select('*, profiles(full_name)')
          .gte('check_in_time', startOfDay(dateRange.from).toISOString())
          .lte('check_in_time', endOfDay(dateRange.to).toISOString())
          .order('check_in_time', { ascending: true });

        if (selectedEmployeeId !== 'all') {
          query = query.eq('user_id', selectedEmployeeId);
        }

        const { data: records, error } = await query;

        if (error) throw new Error(error.message);

        records.forEach((record: AttendanceRecord & { profiles: { full_name: string } | null }) => {
          const employeeName = record.profiles?.full_name || 'N/A';
          const checkIn = record.check_in_time ? format(new Date(record.check_in_time), 'yyyy-MM-dd HH:mm') : '';
          const checkOut = record.check_out_time ? format(new Date(record.check_out_time), 'yyyy-MM-dd HH:mm') : '';
          const location = record.location_address || 'N/A';
          const notes = record.notes ? `"${record.notes.replace(/"/g, '""')}"` : ''; // Handle commas and quotes in notes
          csvContent += `${checkIn.split(' ')[0]},${employeeName},${checkIn.split(' ')[1]},${checkOut.split(' ')[1]},${location},${notes}\n`;
        });

      } else if (reportType === 'employees') {
        filename = `employee_profiles_report.csv`;
        csvContent = "Employee ID,Full Name,Email,Role,Status,Department,Location,Phone Number,Biometric Enrolled\n";

        let query = supabase
          .from('profiles')
          .select('*')
          .order('full_name', { ascending: true });

        if (selectedEmployeeId !== 'all') {
          query = query.eq('id', selectedEmployeeId);
        }

        const { data: profilesData, error } = await query;

        if (error) throw new Error(error.message);

        profilesData.forEach((profile: Profile) => {
          const employeeId = profile.employee_id || 'N/A';
          const fullName = profile.full_name ? `"${profile.full_name.replace(/"/g, '""')}"` : 'N/A';
          const email = profile.email || 'N/A';
          const role = profile.role || 'N/A';
          const status = profile.status || 'N/A';
          const department = profile.department ? `"${profile.department.replace(/"/g, '""')}"` : 'N/A';
          const location = profile.location ? `"${profile.location.replace(/"/g, '""')}"` : 'N/A';
          const phoneNumber = profile.phone_number || 'N/A';
          const biometricEnrolled = profile.biometric_enrolled ? 'Yes' : 'No';
          csvContent += `${employeeId},${fullName},${email},${role},${status},${department},${location},${phoneNumber},${biometricEnrolled}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Export Successful",
          description: `${reportType === 'attendance' ? 'Attendance records' : 'Employee profiles'} exported to CSV.`,
        });
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: `Could not export data: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "PDF Export (Coming Soon)",
      description: "PDF export functionality is not yet implemented. Please use CSV for now.",
      variant: "default",
    });
  };

  if (isLoadingEmployees) {
    return (
      <AdminLayout
        pageTitle="Data Export"
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

  if (employeesError) {
    return (
      <AdminLayout
        pageTitle="Data Export"
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
          Error loading employee data: {employeesError.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Data Export"
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
            Data Export
          </h1>
          <p className="text-muted-foreground">
            Generate and export attendance and employee data for reporting.
          </p>
        </div>

        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Report Type</h3>
              <Select value={reportType} onValueChange={(value: 'attendance' | 'employees') => setReportType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Records</SelectItem>
                  <SelectItem value="employees">Employee Profiles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Selection (for Attendance Records) */}
            {reportType === 'attendance' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Date Range</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={isMobile ? 1 : 2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Employee Filter */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Filter by Employee</h3>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} ({employee.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Buttons */}
            <div className="space-y-4 pt-4">
              <Button
                onClick={handleExportCSV}
                className="w-full btn-attendance"
                disabled={!dateRange.from || !dateRange.to && reportType === 'attendance'}
              >
                <Download className="w-5 h-5 mr-2" />
                Export to CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="w-full"
              >
                <FileText className="w-5 h-5 mr-2" />
                Export to PDF (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}