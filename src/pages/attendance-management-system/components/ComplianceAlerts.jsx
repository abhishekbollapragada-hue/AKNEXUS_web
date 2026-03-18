import React from 'react';
import Icon from '../../../components/AppIcon';

const ComplianceAlerts = ({ alerts }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      case 'success':
        return 'CheckCircle';
      default:
        return 'AlertCircle';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  if (alerts?.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts?.map((alert) => (
        <div
          key={alert?.id}
          className={`rounded-xl border p-4 md:p-5 transition-smooth ${getAlertColor(alert?.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Icon name={getAlertIcon(alert?.type)} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium mb-1">{alert?.title}</h4>
              <p className="text-sm opacity-90">{alert?.message}</p>
              {alert?.action && (
                <button className="mt-3 text-sm font-medium underline hover:no-underline transition-smooth">
                  {alert?.action}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplianceAlerts;