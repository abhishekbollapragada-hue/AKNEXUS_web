import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MentorFeedbackCard = ({ feedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ratingStars = Array.from({ length: 5 }, (_, index) => index < feedback?.rating);

  return (
    <div className="bg-card rounded-xl border border-border shadow-warm transition-smooth hover:shadow-warm-md">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={20} color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-heading font-semibold text-foreground truncate">{feedback?.mentorName}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{feedback?.date}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth flex-shrink-0"
            aria-label={isExpanded ? 'Collapse feedback' : 'Expand feedback'}
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {ratingStars?.map((filled, index) => (
            <Icon
              key={index}
              name={filled ? 'Star' : 'Star'}
              size={16}
              color={filled ? 'var(--color-warning)' : 'var(--color-muted)'}
              className={filled ? 'fill-warning' : ''}
            />
          ))}
          <span className="text-sm font-medium text-foreground ml-2">{feedback?.rating}/5</span>
        </div>

        <p className={`text-sm md:text-base text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {feedback?.comment}
        </p>

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            {feedback?.strengths && feedback?.strengths?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Icon name="ThumbsUp" size={16} color="var(--color-success)" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {feedback?.strengths?.map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Icon name="CheckCircle2" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback?.improvements && feedback?.improvements?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Icon name="Target" size={16} color="var(--color-warning)" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {feedback?.improvements?.map((improvement, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Icon name="AlertCircle" size={14} color="var(--color-warning)" className="mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback?.nextSteps && (
              <div className="bg-accent/5 rounded-lg p-3">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Icon name="ArrowRight" size={16} color="var(--color-accent)" />
                  Next Steps
                </h4>
                <p className="text-sm text-muted-foreground">{feedback?.nextSteps}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorFeedbackCard;