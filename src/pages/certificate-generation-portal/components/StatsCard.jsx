import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error'
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses?.[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1 data-text">
        {value}
      </h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
};

export default StatsCard;