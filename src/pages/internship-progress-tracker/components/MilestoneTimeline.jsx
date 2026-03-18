import React from 'react';
import Icon from '../../../components/AppIcon';

const MilestoneTimeline = ({ milestones }) => {
  const statusColors = {
    completed: 'bg-success border-success',
    current: 'bg-primary border-primary',
    upcoming: 'bg-muted border-border'
  };

  const statusIcons = {
    completed: 'CheckCircle2',
    current: 'Circle',
    upcoming: 'Circle'
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-warm">
      <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-6">Internship Milestones</h3>
      <div className="space-y-6">
        {milestones?.map((milestone, index) => (
          <div key={milestone?.id} className="relative">
            {index !== milestones?.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
            )}
            <div className="flex gap-4">
              <div className={`w-8 h-8 rounded-full border-2 ${statusColors?.[milestone?.status]} flex items-center justify-center flex-shrink-0 relative z-10`}>
                <Icon 
                  name={statusIcons?.[milestone?.status]} 
                  size={16} 
                  color={milestone?.status === 'upcoming' ? 'var(--color-muted-foreground)' : '#FFFFFF'}
                />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-sm md:text-base font-medium text-foreground">{milestone?.title}</h4>
                  <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{milestone?.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{milestone?.description}</p>
                {milestone?.status === 'completed' && milestone?.completedDate && (
                  <div className="flex items-center gap-2 text-xs text-success">
                    <Icon name="Check" size={14} />
                    <span>Completed on {milestone?.completedDate}</span>
                  </div>
                )}
                {milestone?.status === 'current' && milestone?.progress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{milestone?.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${milestone?.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;