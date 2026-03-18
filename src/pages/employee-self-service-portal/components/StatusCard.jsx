import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusCard = ({ title, value, subtitle, icon, trend, trendValue, color = "primary" }) => {
  const getColorClasses = () => {
    const colors = {
      primary: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        icon: 'var(--color-primary)'
      },
      success: {
        bg: 'bg-success/10',
        text: 'text-success',
        icon: 'var(--color-success)'
      },
      warning: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        icon: 'var(--color-warning)'
      },
      error: {
        bg: 'bg-error/10',
        text: 'text-error',
        icon: 'var(--color-error)'
      }
    };
    return colors?.[color] || colors?.primary;
  };

  const colorClasses = getColorClasses();

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 border border-border hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl ${colorClasses?.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} size={24} color={colorClasses?.icon} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm md:text-base text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-1">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatusCard;