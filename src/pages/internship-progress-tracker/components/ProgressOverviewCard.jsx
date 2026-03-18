import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressOverviewCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent'
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-foreground'
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-warm transition-smooth hover:shadow-warm-md">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${colorClasses?.[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColors?.[trend]}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} size={16} />
            <span className="text-xs md:text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-1">{value}</h3>
        <p className="text-sm md:text-base text-muted-foreground mb-1">{title}</p>
        {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
};

export default ProgressOverviewCard;