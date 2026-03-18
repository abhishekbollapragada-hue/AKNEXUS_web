import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      label: 'SSL Encrypted',
      description: '256-bit encryption'
    },
    {
      icon: 'Lock',
      label: 'Secure Access',
      description: 'Enterprise security'
    },
    {
      icon: 'CheckCircle2',
      label: 'Compliant',
      description: 'Data protection'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
      {securityFeatures?.map((feature, index) => (
        <div
          key={index}
          className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-muted/50 rounded-lg border border-border"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-foreground truncate">
              {feature?.label}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {feature?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;