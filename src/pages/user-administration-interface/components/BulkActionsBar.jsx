import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [bulkAction, setBulkAction] = React.useState('');

  const actionOptions = [
    { value: '', label: 'Select Action' },
    { value: 'activate', label: 'Activate Users' },
    { value: 'deactivate', label: 'Deactivate Users' },
    { value: 'suspend', label: 'Suspend Users' },
    { value: 'change-role', label: 'Change Role' },
    { value: 'change-department', label: 'Change Department' },
    { value: 'send-email', label: 'Send Email' },
    { value: 'export', label: 'Export Selected' },
    { value: 'delete', label: 'Delete Users' }
  ];

  const handleApply = () => {
    if (bulkAction) {
      onBulkAction(bulkAction);
      setBulkAction('');
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base">
            {selectedCount}
          </div>
          <div>
            <p className="text-sm md:text-base font-medium text-foreground">
              {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-muted-foreground">Choose an action to apply</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial md:w-64">
            <Select
              options={actionOptions}
              value={bulkAction}
              onChange={setBulkAction}
              placeholder="Select action"
            />
          </div>
          <Button
            variant="default"
            onClick={handleApply}
            disabled={!bulkAction}
            iconName="Check"
            iconSize={16}
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            onClick={onClearSelection}
            iconName="X"
            iconSize={16}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;