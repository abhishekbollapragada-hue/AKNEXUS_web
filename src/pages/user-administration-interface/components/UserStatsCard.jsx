import React from 'react';
import Icon from '../../../components/AppIcon';

const UserStatsCard = ({ icon, label, value, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent'
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-warm transition-smooth hover:shadow-warm-md">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${colorClasses?.[color]}`}>
          <Icon name={icon} size={20} className="md:w-6 md:h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs md:text-sm ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} className="md:w-4 md:h-4" />
            <span className="font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-1">{value}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default UserStatsCard;