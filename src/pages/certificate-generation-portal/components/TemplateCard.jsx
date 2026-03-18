import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplateCard = ({ template, onEdit, onDelete, onUse }) => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        <Image
          src={template?.preview}
          alt={template?.previewAlt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1 truncate">
              {template?.name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template?.description}
            </p>
          </div>
          {template?.isDefault && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex-shrink-0">
              <Icon name="Star" size={12} />
              Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon name="Calendar" size={14} />
            <span>{template?.createdDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="FileText" size={14} />
            <span>{template?.usageCount} used</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            iconName="FileCheck"
            iconPosition="left"
            onClick={() => onUse(template)}
            fullWidth
          >
            Use Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            onClick={() => onEdit(template)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={() => onDelete(template)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;