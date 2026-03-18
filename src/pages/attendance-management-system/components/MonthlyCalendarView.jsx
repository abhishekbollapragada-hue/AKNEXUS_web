import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MonthlyCalendarView = ({ attendanceData, currentMonth, onMonthChange }) => {
  const [hoveredDate, setHoveredDate] = useState(null);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1)?.getDay();
  };

  const year = currentMonth?.getFullYear();
  const month = currentMonth?.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days?.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days?.push(i);
  }

  const getDateStatus = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    return attendanceData?.find(d => d?.date === dateStr);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-muted';
    switch (status?.status) {
      case 'Present':
        return 'bg-success';
      case 'Absent':
        return 'bg-destructive';
      case 'Half Day':
        return 'bg-warning';
      case 'Late':
        return 'bg-accent';
      default:
        return 'bg-muted';
    }
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(year, month - 1, 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(year, month + 1, 1);
    onMonthChange(newMonth);
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          {currentMonth?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth"
            aria-label="Previous month"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth"
            aria-label="Next month"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days?.map((day, index) => {
          const dateStatus = getDateStatus(day);
          return (
            <div
              key={index}
              className="relative aspect-square"
              onMouseEnter={() => day && setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day && (
                <>
                  <div
                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-medium transition-smooth cursor-pointer ${
                      dateStatus
                        ? `${getStatusColor(dateStatus)} text-white`
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {day}
                  </div>
                  {hoveredDate === day && dateStatus && (
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-popover border border-border rounded-lg shadow-warm-lg p-3">
                      <p className="text-xs font-medium text-popover-foreground mb-2">
                        {new Date(dateStatus.date)?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Check In: <span className="data-text">{dateStatus?.checkIn}</span></p>
                        <p>Check Out: <span className="data-text">{dateStatus?.checkOut}</span></p>
                        <p>Total: <span className="data-text font-medium">{dateStatus?.totalHours}</span></p>
                        <p className="pt-1 border-t border-border">
                          Status: <span className="font-medium">{dateStatus?.status}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success"></div>
            <span className="text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive"></div>
            <span className="text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning"></div>
            <span className="text-muted-foreground">Half Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent"></div>
            <span className="text-muted-foreground">Late</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;