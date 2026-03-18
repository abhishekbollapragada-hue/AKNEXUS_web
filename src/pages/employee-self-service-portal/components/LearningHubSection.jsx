import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LearningHubSection = () => {
  const learningResources = [
  {
    id: 1,
    title: "React Fundamentals & Best Practices",
    type: "Tutorial Series",
    duration: "4h 30m",
    modules: 12,
    progress: 75,
    thumbnail: "https://images.unsplash.com/photo-1725800066480-7ccf189e9513",
    thumbnailAlt: "Modern laptop displaying colorful React code editor with component structure on dark themed IDE interface",
    instructor: "Sarah Johnson",
    difficulty: "Intermediate",
    icon: "BookOpen"
  },
  {
    id: 2,
    title: "API Integration & Authentication Guide",
    type: "Documentation",
    duration: "2h 15m",
    modules: 8,
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1649682892309-e10e0b7cd40b",
    thumbnailAlt: "Digital illustration of interconnected network nodes representing API endpoints with glowing blue connections on dark background",
    instructor: "Michael Chen",
    difficulty: "Advanced",
    icon: "FileText"
  },
  {
    id: 3,
    title: "Git Workflow & Collaboration Strategies",
    type: "Recorded Session",
    duration: "1h 45m",
    modules: 6,
    progress: 30,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1440db8a3-1766755920374.png",
    thumbnailAlt: "Close-up view of terminal window showing Git commands and branch visualization with colorful syntax highlighting",
    instructor: "David Martinez",
    difficulty: "Beginner",
    icon: "Video"
  },
  {
    id: 4,
    title: "Company SOPs & Internal Processes",
    type: "SOP Document",
    duration: "30m",
    modules: 5,
    progress: 0,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_110593b4c-1766486242901.png",
    thumbnailAlt: "Professional business documents and flowcharts spread on wooden desk with laptop showing organizational structure diagrams",
    instructor: "HR Department",
    difficulty: "Beginner",
    icon: "FileCheck"
  }];


  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: 'bg-success/10 text-success',
      Intermediate: 'bg-warning/10 text-warning',
      Advanced: 'bg-error/10 text-error'
    };
    return colors?.[difficulty] || colors?.Beginner;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Tutorial Series': 'BookOpen',
      'Documentation': 'FileText',
      'Recorded Session': 'Video',
      'SOP Document': 'FileCheck'
    };
    return icons?.[type] || 'BookOpen';
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-1">
            Learning Hub
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Access tutorials, SOPs, and training materials
          </p>
        </div>
        <Button
          variant="outline"
          iconName="Search"
          iconPosition="left">

          Browse All
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {learningResources?.map((resource) =>
        <div
          key={resource?.id}
          className="bg-muted/30 rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-smooth">

            <div className="relative h-40 md:h-48 overflow-hidden">
              <img
              src={resource?.thumbnail}
              alt={resource?.thumbnailAlt}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/assets/images/no_image.png';
              }} />

              <div className="absolute top-3 right-3 px-2.5 py-1 bg-background/90 backdrop-blur-sm rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Icon name="Clock" size={12} />
                  <span className="text-xs font-medium">{resource?.duration}</span>
                </div>
              </div>
              {resource?.progress > 0 &&
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-background/50">
                  <div
                className="h-full bg-primary transition-smooth"
                style={{ width: `${resource?.progress}%` }} />

                </div>
            }
            </div>

            <div className="p-4 md:p-5">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={getTypeIcon(resource?.type)} size={20} color="var(--color-primary)" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1 line-clamp-2">
                    {resource?.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{resource?.type}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(resource?.difficulty)}`}>
                  {resource?.difficulty}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="Layers" size={12} />
                  <span>{resource?.modules} modules</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="User" size={12} />
                  <span>{resource?.instructor}</span>
                </div>
              </div>

              {resource?.progress > 0 &&
            <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium text-foreground data-text">{resource?.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                  className="h-full bg-primary transition-smooth"
                  style={{ width: `${resource?.progress}%` }} />

                  </div>
                </div>
            }

              <div className="flex gap-2">
                <Button
                variant={resource?.progress > 0 ? "default" : "outline"}
                size="sm"
                iconName={resource?.progress === 100 ? "RotateCcw" : resource?.progress > 0 ? "Play" : "BookOpen"}
                iconPosition="left"
                fullWidth>

                  {resource?.progress === 100 ? 'Review' : resource?.progress > 0 ? 'Continue' : 'Start Learning'}
                </Button>
                <Button
                variant="ghost"
                size="sm"
                iconName="Bookmark" />

              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

};

export default LearningHubSection;