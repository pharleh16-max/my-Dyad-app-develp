import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Download, Filter } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  location: string;
  status: 'present' | 'absent' | 'partial';
  notes?: string;
}

export default function AttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterPeriod, setFilterPeriod] = useState<string>('week');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const navigate = useNavigate();

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

  // Mock attendance data
  useEffect(() => {
    const mockData: AttendanceRecord[] = [
      {
        id: '1',
        date: '2024-01-15',
        checkIn: '09:00',
        checkOut: '17:30',
        totalHours: 8.5,
        location: 'Main Office',
        status: 'present',
        notes: 'Completed project milestone'
      },
      {
        id: '2',
        date: '2024-01-14',
        checkIn: '08:45',
        checkOut: '18:00',
        totalHours: 9.25,
        location: 'Main Office',
        status: 'present'
      },
      {
        id: '3',
        date: '2024-01-13',
        checkIn: '09:15',
        checkOut: '16:45',
        totalHours: 7.5,
        location: 'Main Office',
        status: 'present'
      },
      {
        id: '4',
        date: '2024-01-12',
        checkIn: '09:00',
        totalHours: 0,
        location: 'Main Office',
        status: 'partial',
        notes: 'Forgot to check out'
      },
      {
        id: '5',
        date: '2024-01-11',
        checkIn: '',
        totalHours: 0,
        location: '',
        status: 'absent'
      }
    ];
    setAttendanceRecords(mockData);
  }, []);

  const formatHours = (hours: number) => {
    if (hours === 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'partial':
        return 'Incomplete';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  };

  const totalHoursThisPeriod = attendanceRecords
    .reduce((sum, record) => sum + (record.totalHours || 0), 0);

  const handleExportData = () => {
    // Mock export functionality
    const csvContent = attendanceRecords
      .map(record => 
        `${record.date},${record.checkIn},${record.checkOut || ''},${record.totalHours || 0},${record.location},${record.status}`
      )
      .join('\n');
    
    const blob = new Blob([`Date,Check In,Check Out,Total Hours,Location,Status\n${csvContent}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${filterPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header title="Attendance History" />
      <EmployeeLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Attendance History
              </h1>
              <p className="text-muted-foreground">
                Track your daily attendance and hours
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="status-card">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-muted-foreground">This Period</h3>
                <p className="text-xl font-bold text-foreground">
                  {formatHours(totalHoursThisPeriod)}
                </p>
              </div>
            </Card>

            <Card className="status-card">
              <div className="flex flex-col items-center text-center">
                <Calendar className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-sm text-muted-foreground">Days Present</h3>
                <p className="text-xl font-bold text-foreground">
                  {attendanceRecords.filter(r => r.status === 'present').length}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Attendance Records */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Recent Records</h3>
            
            {attendanceRecords.map((record) => (
              <Card key={record.id} className="status-card">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {record.location || 'No location'}
                      </div>
                    </div>
                    
                    <Badge className={cn("border", getStatusColor(record.status))}>
                      {getStatusText(record.status)}
                    </Badge>
                  </div>

                  {/* Time Details */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Check In</p>
                      <p className="font-medium text-foreground">
                        {record.checkIn || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Check Out</p>
                      <p className="font-medium text-foreground">
                        {record.checkOut || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium text-foreground">
                        {formatHours(record.totalHours || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="border-t border-border pt-2">
                      <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                      <p className="text-sm text-foreground">{record.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Monthly Summary */}
          <Card className="status-card">
            <h3 className="font-semibold text-foreground mb-4">Monthly Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Hours</p>
                <p className="text-lg font-bold text-foreground">
                  {formatHours(totalHoursThisPeriod)}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Avg. Daily Hours</p>
                <p className="text-lg font-bold text-foreground">
                  {formatHours(totalHoursThisPeriod / Math.max(attendanceRecords.filter(r => r.status === 'present').length, 1))}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Days Present</p>
                <p className="text-lg font-bold text-accent">
                  {attendanceRecords.filter(r => r.status === 'present').length}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Days Absent</p>
                <p className="text-lg font-bold text-destructive">
                  {attendanceRecords.filter(r => r.status === 'absent').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </EmployeeLayout>
      <BottomNavigation activeItem="history" onItemClick={handleNavigation} />
    </>
  );
}