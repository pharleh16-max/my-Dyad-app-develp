import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Users, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInMinutes,
  subDays,
  addDays,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tables } from "@/integrations/supabase/types";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

type Profile = Tables<'profiles'>;
type AttendanceRecord = Tables<'attendance_records'> & { profiles: { full_name: string } | null };

export default function AdminReportsPage() {
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

  const today = new Date();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });
  const [filterPeriod, setFilterPeriod] = useState<string>('this_month');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | 'all'>('all');

  // Fetch all employees for the filter dropdown
  const { data: employees, isLoading: isLoadingEmployees, error: employeesError } = useQuery<Profile[]>({
    queryKey: ['allEmployees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id')
        .order('full_name', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Fetch attendance records based on filters
  const { data: attendanceRecords, isLoading: isLoadingAttendance, error: attendanceError } = useQuery<AttendanceRecord[]>({
    queryKey: ['adminAttendanceRecords', dateRange, selectedEmployeeId],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return [];

      let query = supabase
        .from('attendance_records')
        .select('*, profiles(full_name)')
        .gte('check_in_time', dateRange.from.toISOString())
        .lte('check_in_time', addDays(dateRange.to, 1).toISOString()) // Include the entire 'to' day
        .order('check_in_time', { ascending: true });

      if (selectedEmployeeId !== 'all') {
        query = query.eq('user_id', selectedEmployeeId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }
      return data as AttendanceRecord[];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Memoized calculations for summary and chart data
  const {
    totalHoursWorked,
    averageDailyHours,
    daysPresent,
    daysAbsent,
    chartData,
    processedRecords,
  } = useMemo(() => {
    if (!attendanceRecords || !dateRange.from || !dateRange.to) {
      return {
        totalHoursWorked: 0,
        averageDailyHours: 0,
        daysPresent: 0,
        daysAbsent: 0,
        chartData: [],
        processedRecords: [],
      };
    }

    let totalMinutes = 0;
    const dailyHoursMap = new Map<string, number>(); // Date string -> total minutes for that day
    const presentDays = new Set<string>();

    const recordsWithCalculatedHours = attendanceRecords.map(record => {
      let durationMinutes = 0;
      if (record.check_in_time && record.check_out_time) {
        const checkIn = parseISO(record.check_in_time);
        const checkOut = parseISO(record.check_out_time);
        durationMinutes = differenceInMinutes(checkOut, checkIn);
        totalMinutes += durationMinutes;
        
        const dateKey = format(checkIn, 'yyyy-MM-dd');
        dailyHoursMap.set(dateKey, (dailyHoursMap.get(dateKey) || 0) + durationMinutes);
        presentDays.add(dateKey);
      }
      return { ...record, durationMinutes };
    });

    const intervalDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const totalDaysInPeriod = intervalDays.length;
    const actualDaysPresent = presentDays.size;
    const actualDaysAbsent = totalDaysInPeriod - actualDaysPresent;

    const chartDataFormatted = intervalDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const hours = (dailyHoursMap.get(dateKey) || 0) / 60;
      return {
        date: format(day, 'MMM dd'),
        'Hours Worked': parseFloat(hours.toFixed(2)),
      };
    });

    const totalHours = totalMinutes / 60;
    const avgDailyHours = actualDaysPresent > 0 ? totalHours / actualDaysPresent : 0;

    return {
      totalHoursWorked: totalHours,
      averageDailyHours: avgDailyHours,
      daysPresent: actualDaysPresent,
      daysAbsent: actualDaysAbsent,
      chartData: chartDataFormatted,
      processedRecords: recordsWithCalculatedHours,
    };
  }, [attendanceRecords, dateRange]);

  const formatHours = (hours: number) => {
    if (isNaN(hours) || hours < 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
  };

  const handlePeriodChange = (value: string) => {
    setFilterPeriod(value);
    const now = new Date();
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    switch (value) {
      case 'today':
        fromDate = now;
        toDate = now;
        break;
      case 'this_week':
        fromDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        toDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'last_7_days':
        fromDate = subDays(now, 6);
        toDate = now;
        break;
      case 'this_month':
        fromDate = startOfMonth(now);
        toDate = endOfMonth(now);
        break;
      case 'last_30_days':
        fromDate = subDays(now, 29);
        toDate = now;
        break;
      case 'custom':
        // Keep current custom range or reset to a default
        break;
      default:
        fromDate = startOfMonth(now);
        toDate = endOfMonth(now);
    }
    if (fromDate && toDate) {
      setDateRange({ from: fromDate, to: toDate });
    }
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setDateRange(range || { from: undefined, to: undefined });
    setFilterPeriod('custom'); // Set to custom when date is manually selected
  };

  if (isLoadingEmployees || isLoadingAttendance) {
    return (
      <AdminLayout
        pageTitle="Attendance Reports"
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

  if (employeesError || attendanceError) {
    return (
      <AdminLayout
        pageTitle="Attendance Reports"
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
          Error loading data: {employeesError?.message || attendanceError?.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Attendance Reports"
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
            Attendance Reports
          </h1>
          <p className="text-muted-foreground">
            Analyze employee attendance patterns and productivity.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-primary" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Period</h3>
              <Select value={filterPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                    onSelect={handleDateSelect}
                    numberOfMonths={isMobile ? 1 : 2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Employee</h3>
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
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-6 h-6 text-primary" />
              Summary for {format(dateRange.from || today, 'MMM dd, y')} - {format(dateRange.to || today, 'MMM dd, y')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Total Hours</p>
              <p className="text-2xl font-bold text-foreground">
                {formatHours(totalHoursWorked)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Avg. Daily Hours</p>
              <p className="text-2xl font-bold text-foreground">
                {formatHours(averageDailyHours)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Days Present</p>
              <p className="text-2xl font-bold text-accent">
                {daysPresent}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Days Absent</p>
              <p className="text-2xl font-bold text-destructive">
                {daysAbsent}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Attendance Chart */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-primary" />
              Daily Hours Worked
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => `${formatHours(value)}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="Hours Worked"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No attendance data for the selected period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Attendance Records Table */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-primary" />
              Detailed Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {processedRecords && processedRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.check_in_time ? format(parseISO(record.check_in_time), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                        <TableCell>{record.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{record.check_in_time ? format(parseISO(record.check_in_time), 'p') : 'N/A'}</TableCell>
                        <TableCell>{record.check_out_time ? format(parseISO(record.check_out_time), 'p') : 'N/A'}</TableCell>
                        <TableCell>{formatHours(record.durationMinutes / 60)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No detailed records found for the selected criteria.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}