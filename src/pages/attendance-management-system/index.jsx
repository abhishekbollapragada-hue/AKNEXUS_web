import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import AttendanceHeader from './components/AttendanceHeader';
import AttendanceStatsCards from './components/AttendanceStatsCards';
import AttendanceTable from './components/AttendanceTable';
import MonthlyCalendarView from './components/MonthlyCalendarView';
import FilterPanel from './components/FilterPanel';
import ComplianceAlerts from './components/ComplianceAlerts';
import QuickActions from './components/QuickActions';

const AttendanceManagementSystem = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('checked-out');
  const [sessionTime, setSessionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const attendanceRecords = [
    {
      id: 1,
      date: '2026-01-01',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      totalHours: '8h 30m',
      breakDuration: '30m',
      status: 'Present',
      locationVerified: true
    },
    {
      id: 2,
      date: '2025-12-31',
      checkIn: '09:15 AM',
      checkOut: '06:00 PM',
      totalHours: '8h 15m',
      breakDuration: '30m',
      status: 'Late',
      locationVerified: true
    },
    {
      id: 3,
      date: '2025-12-30',
      checkIn: '09:00 AM',
      checkOut: '02:00 PM',
      totalHours: '4h 30m',
      breakDuration: '30m',
      status: 'Half Day',
      locationVerified: true
    },
    {
      id: 4,
      date: '2025-12-29',
      checkIn: '--',
      checkOut: '--',
      totalHours: '0h',
      breakDuration: '--',
      status: 'Absent',
      locationVerified: false
    },
    {
      id: 5,
      date: '2025-12-28',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      totalHours: '8h 30m',
      breakDuration: '30m',
      status: 'Present',
      locationVerified: true
    },
    {
      id: 6,
      date: '2025-12-27',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      totalHours: '8h 30m',
      breakDuration: '30m',
      status: 'Present',
      locationVerified: true
    },
    {
      id: 7,
      date: '2025-12-26',
      checkIn: '09:10 AM',
      checkOut: '06:00 PM',
      totalHours: '8h 20m',
      breakDuration: '30m',
      status: 'Late',
      locationVerified: true
    },
    {
      id: 8,
      date: '2025-12-25',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      totalHours: '8h 30m',
      breakDuration: '30m',
      status: 'Present',
      locationVerified: true
    }
  ];

  const stats = {
    totalDays: 22,
    presentDays: 18,
    absentDays: 4,
    attendanceRate: 82
  };

  const complianceAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Attendance Threshold Alert',
      message: 'Your current attendance rate is 82%. You need to maintain at least 75% to be eligible for certificates and completion benefits.',
      action: 'View Attendance Policy'
    },
    {
      id: 2,
      type: 'info',
      title: 'Payroll Sync Status',
      message: 'Your attendance data has been successfully synced with the payroll system for December 2025.',
      action: null
    }
  ];

  useEffect(() => {
    let interval;
    if (currentStatus === 'checked-in') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStatus]);

  const handleCheckIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStatus('checked-in');
      setSessionTime(0);
      setIsLoading(false);
    }, 1500);
  };

  const handleCheckOut = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStatus('checked-out');
      setIsLoading(false);
    }, 1500);
  };

  const handleCorrection = (recordIds) => {
    console.log('Correction requested for records:', recordIds);
  };

  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
  };

  const handleExport = (format) => {
    console.log('Exporting attendance data as:', format);
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action triggered:', actionId);
  };

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main
        className={`transition-smooth ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
              Attendance Management System
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Track your time, manage attendance, and ensure compliance with organizational policies
            </p>
          </div>

          <ComplianceAlerts alerts={complianceAlerts} />

          <AttendanceHeader
            currentStatus={currentStatus}
            sessionTime={sessionTime}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isLoading={isLoading}
          />

          <AttendanceStatsCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <FilterPanel
                onFilterChange={handleFilterChange}
                onExport={handleExport}
              />

              <AttendanceTable
                records={attendanceRecords}
                onCorrection={handleCorrection}
              />
            </div>

            <div className="space-y-6 md:space-y-8">
              <MonthlyCalendarView
                attendanceData={attendanceRecords}
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
              />

              <QuickActions onAction={handleQuickAction} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceManagementSystem;