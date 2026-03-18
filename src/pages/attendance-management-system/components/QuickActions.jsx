import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: 'apply-leave',
      label: 'Apply Leave',
      icon: 'Calendar',
      color: 'primary',
      description: 'Request time off'
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: 'FileText',
      color: 'secondary',
      description: 'Download attendance reports'
    },
    {
      id: 'correction-request',
      label: 'Correction Request',
      icon: 'Edit',
      color: 'accent',
      description: 'Request attendance correction'
    },
    {
      id: 'sync-payroll',
      label: 'Sync Payroll',
      icon: 'RefreshCw',
      color: 'success',
      description: 'Sync with payroll system'
    }
  ];

  return (
    <div className="bg-card rounded-xl shadow-warm-md border border-border p-4 md:p-6">
      <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onAction(action?.id)}
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-smooth text-left"
          >
            <div className={`w-10 h-10 rounded-lg bg-${action?.color}/10 flex items-center justify-center flex-shrink-0`}>
              <Icon name={action?.icon} size={20} color={`var(--color-${action?.color})`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{action?.label}</p>
              <p className="text-xs text-muted-foreground">{action?.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;