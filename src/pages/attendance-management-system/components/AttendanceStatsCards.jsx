import React from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceStatsCards = ({ stats }) => {
  const cards = [
    {
      id: 1,
      title: 'Total Working Days',
      value: stats?.totalDays,
      icon: 'Calendar',
      color: 'primary',
      bgColor: 'bg-primary/10',
      iconColor: 'var(--color-primary)'
    },
    {
      id: 2,
      title: 'Days Present',
      value: stats?.presentDays,
      icon: 'CheckCircle',
      color: 'success',
      bgColor: 'bg-success/10',
      iconColor: 'var(--color-success)'
    },
    {
      id: 3,
      title: 'Days Absent',
      value: stats?.absentDays,
      icon: 'XCircle',
      color: 'destructive',
      bgColor: 'bg-destructive/10',
      iconColor: 'var(--color-destructive)'
    },
    {
      id: 4,
      title: 'Attendance Rate',
      value: `${stats?.attendanceRate}%`,
      icon: 'TrendingUp',
      color: stats?.attendanceRate >= 75 ? 'success' : 'warning',
      bgColor: stats?.attendanceRate >= 75 ? 'bg-success/10' : 'bg-warning/10',
      iconColor: stats?.attendanceRate >= 75 ? 'var(--color-success)' : 'var(--color-warning)',
      subtitle: stats?.attendanceRate >= 75 ? 'Meets requirement' : 'Below 75% threshold'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card rounded-xl shadow-warm p-4 md:p-6 border border-border transition-smooth hover:shadow-warm-md hover:translate-y-[-2px]"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${card?.bgColor} flex items-center justify-center`}>
              <Icon name={card?.icon} size={24} color={card?.iconColor} />
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-2">{card?.title}</h3>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground data-text">
            {card?.value}
          </p>
          {card?.subtitle && (
            <p className={`text-xs mt-2 ${card?.color === 'success' ? 'text-success' : 'text-warning'}`}>
              {card?.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttendanceStatsCards;