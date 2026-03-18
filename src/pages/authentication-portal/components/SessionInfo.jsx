import React from 'react';
import Icon from '../../../components/AppIcon';

const SessionInfo = () => {
  const currentDate = new Date();
  const formattedDate = currentDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const sessionDetails = [
    {
      icon: 'Calendar',
      label: 'Date',
      value: formattedDate
    },
    {
      icon: 'Clock',
      label: 'Time',
      value: formattedTime
    },
    {
      icon: 'Globe',
      label: 'Location',
      value: 'United States'
    }
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-3">
        <Icon name="Info" size={20} color="var(--color-primary)" />
        <h4 className="text-sm md:text-base font-medium text-foreground">
          Session Information
        </h4>
      </div>
      <div className="space-y-2 md:space-y-3">
        {sessionDetails?.map((detail, index) => (
          <div
            key={index}
            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/30 rounded-lg"
          >
            <Icon name={detail?.icon} size={16} color="var(--color-muted-foreground)" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{detail?.label}</p>
              <p className="text-xs md:text-sm font-medium text-foreground truncate">
                {detail?.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionInfo;