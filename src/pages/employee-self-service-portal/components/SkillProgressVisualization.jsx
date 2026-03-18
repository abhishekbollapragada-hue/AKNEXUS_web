import React from 'react';
import Icon from '../../../components/AppIcon';

const SkillProgressVisualization = () => {
  const skills = [
    {
      id: 1,
      name: "React Development",
      category: "Frontend",
      level: "Advanced",
      progress: 85,
      icon: "Code",
      color: "primary",
      achievements: ["Component Architecture", "State Management", "Hooks Mastery"]
    },
    {
      id: 2,
      name: "JavaScript/ES6+",
      category: "Programming",
      level: "Advanced",
      progress: 90,
      icon: "FileCode",
      color: "success",
      achievements: ["Async/Await", "Promises", "Modern Syntax"]
    },
    {
      id: 3,
      name: "API Integration",
      category: "Backend",
      level: "Intermediate",
      progress: 70,
      icon: "Database",
      color: "warning",
      achievements: ["REST APIs", "Authentication", "Error Handling"]
    },
    {
      id: 4,
      name: "UI/UX Design",
      category: "Design",
      level: "Intermediate",
      progress: 65,
      icon: "Palette",
      color: "primary",
      achievements: ["Responsive Design", "Accessibility", "User Research"]
    },
    {
      id: 5,
      name: "Git & Version Control",
      category: "Tools",
      level: "Advanced",
      progress: 80,
      icon: "GitBranch",
      color: "success",
      achievements: ["Branching", "Merging", "Collaboration"]
    },
    {
      id: 6,
      name: "Testing & Debugging",
      category: "Quality",
      level: "Beginner",
      progress: 45,
      icon: "Bug",
      color: "error",
      achievements: ["Unit Testing", "Console Debugging"]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: 'bg-primary',
        text: 'text-primary',
        light: 'bg-primary/10'
      },
      success: {
        bg: 'bg-success',
        text: 'text-success',
        light: 'bg-success/10'
      },
      warning: {
        bg: 'bg-warning',
        text: 'text-warning',
        light: 'bg-warning/10'
      },
      error: {
        bg: 'bg-error',
        text: 'text-error',
        light: 'bg-error/10'
      }
    };
    return colors?.[color] || colors?.primary;
  };

  const getLevelBadge = (level) => {
    const badges = {
      Beginner: { color: 'bg-error/10 text-error', icon: 'Sprout' },
      Intermediate: { color: 'bg-warning/10 text-warning', icon: 'Zap' },
      Advanced: { color: 'bg-success/10 text-success', icon: 'Award' }
    };
    return badges?.[level] || badges?.Beginner;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-1">
            Skill Progress
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your competency advancement
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
          <Icon name="TrendingUp" size={16} color="var(--color-primary)" />
          <span className="text-sm font-medium text-primary">6 Skills</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {skills?.map((skill) => {
          const colorClasses = getColorClasses(skill?.color);
          const levelBadge = getLevelBadge(skill?.level);

          return (
            <div
              key={skill?.id}
              className="bg-muted/30 rounded-xl p-4 md:p-5 border border-border hover:border-primary/30 transition-smooth"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${colorClasses?.light} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={skill?.icon} size={24} color={`var(--color-${skill?.color})`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
                    {skill?.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{skill?.category}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${levelBadge?.color} flex items-center gap-1 flex-shrink-0`}>
                  <Icon name={levelBadge?.icon} size={12} />
                  {skill?.level}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-muted-foreground">Progress</span>
                  <span className="text-xs md:text-sm font-medium text-foreground data-text">{skill?.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorClasses?.bg} transition-smooth`}
                    style={{ width: `${skill?.progress}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Achievements</p>
                <div className="flex flex-wrap gap-2">
                  {skill?.achievements?.map((achievement, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-background rounded-lg text-xs text-foreground border border-border"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillProgressVisualization;