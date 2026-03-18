import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AuditTrailPanel = ({ activities }) => {
  const actionIcons = {
    created: 'UserPlus',
    updated: 'Edit',
    deleted: 'Trash2',
    activated: 'CheckCircle',
    deactivated: 'XCircle',
    'role-changed': 'Shield',
    'status-changed': 'RefreshCw'
  };

  const actionColors = {
    created: 'bg-success/10 text-success',
    updated: 'bg-primary/10 text-primary',
    deleted: 'bg-error/10 text-error',
    activated: 'bg-success/10 text-success',
    deactivated: 'bg-warning/10 text-warning',
    'role-changed': 'bg-accent/10 text-accent',
    'status-changed': 'bg-secondary/10 text-secondary'
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-warm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">Audit Trail</h3>
        <Icon name="History" size={20} color="var(--color-muted-foreground)" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-3 p-3 md:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${actionColors?.[activity?.action]}`}>
              <Icon name={actionIcons?.[activity?.action]} size={16} className="md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm md:text-base font-medium text-foreground">{activity?.description}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity?.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src={activity?.adminPhoto}
                  alt={activity?.adminPhotoAlt}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
                />
                <p className="text-xs md:text-sm text-muted-foreground">by {activity?.adminName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrailPanel;