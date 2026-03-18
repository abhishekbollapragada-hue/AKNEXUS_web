import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TaskCard = ({ task, onStatusUpdate, onFileUpload, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(task?.status);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'completed', label: 'Completed' }
  ];

  const statusColors = {
    pending: 'bg-muted text-muted-foreground',
    'in-progress': 'bg-warning/10 text-warning',
    submitted: 'bg-accent/10 text-accent',
    completed: 'bg-success/10 text-success'
  };

  const priorityColors = {
    high: 'text-error',
    medium: 'text-warning',
    low: 'text-muted-foreground'
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    onStatusUpdate(task?.id, newStatus);
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      onFileUpload(task?.id, file);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-warm transition-smooth hover:shadow-warm-md">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">{task?.title}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors?.[task?.status]}`}>
                {task?.status?.replace('-', ' ')}
              </span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{task?.description}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth flex-shrink-0"
            aria-label={isExpanded ? 'Collapse task' : 'Expand task'}
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6 flex-wrap text-xs md:text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Calendar" size={16} />
            <span>Due: {task?.dueDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Flag" size={16} className={priorityColors?.[task?.priority]} />
            <span className={priorityColors?.[task?.priority]}>{task?.priority} priority</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} />
            <span>{task?.assignedBy}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Task Details</h4>
              <p className="text-sm text-muted-foreground">{task?.detailedDescription}</p>
            </div>

            {task?.attachments && task?.attachments?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Attachments</h4>
                <div className="space-y-2">
                  {task?.attachments?.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Icon name="Paperclip" size={16} />
                      <span className="text-sm text-foreground flex-1 truncate">{attachment?.name}</span>
                      <Button variant="ghost" size="sm" iconName="Download">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userRole === 'employee' && task?.status !== 'completed' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select
                    label="Update Status"
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={handleStatusChange}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.zip"
                    />
                    <Button variant="outline" fullWidth iconName="Upload" iconPosition="left">
                      Upload Work
                    </Button>
                  </label>
                </div>
              </div>
            )}

            {task?.mentorFeedback && (
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="MessageSquare" size={16} color="var(--color-primary)" />
                  <h4 className="text-sm font-medium text-foreground">Mentor Feedback</h4>
                </div>
                <p className="text-sm text-muted-foreground">{task?.mentorFeedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;