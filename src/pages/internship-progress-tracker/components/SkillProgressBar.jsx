import React from 'react';
import Icon from '../../../components/AppIcon';

const SkillProgressBar = ({ skill, level, progress, achievements = [] }) => {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const currentLevelIndex = levels?.indexOf(level);

  const getLevelColor = (index) => {
    if (index < currentLevelIndex) return 'bg-success';
    if (index === currentLevelIndex) return 'bg-primary';
    return 'bg-muted';
  };

  const getLevelTextColor = (index) => {
    if (index <= currentLevelIndex) return 'text-foreground';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-warm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">{skill}</h3>
          <p className="text-sm text-muted-foreground">Current Level: {level}</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-lg flex-shrink-0">
          <Icon name="TrendingUp" size={16} color="var(--color-primary)" />
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          {levels?.map((levelName, index) => (
            <span key={levelName} className={`text-xs md:text-sm font-medium ${getLevelTextColor(index)}`}>
              {levelName}
            </span>
          ))}
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {levels?.map((levelName, index) => (
            <div
              key={levelName}
              className={`w-3 h-3 rounded-full ${getLevelColor(index)} transition-all duration-300`}
            />
          ))}
        </div>
      </div>
      {achievements?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Icon name="Award" size={16} />
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {achievements?.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Icon name="CheckCircle2" size={14} color="var(--color-success)" />
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillProgressBar;