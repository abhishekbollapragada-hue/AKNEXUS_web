import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'issued', label: 'Issued' },
    { value: 'pending', label: 'Pending' },
    { value: 'revoked', label: 'Revoked' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Internship Completion', label: 'Internship Completion' },
    { value: 'Employee Recognition', label: 'Employee Recognition' },
    { value: 'Training Completion', label: 'Training Completion' },
    { value: 'Achievement Award', label: 'Achievement Award' }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="text"
          label="Search"
          placeholder="Name or ID..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          label="Certificate Type"
          options={typeOptions}
          value={filters?.type}
          onChange={(value) => onFilterChange('type', value)}
        />

        <Input
          type="date"
          label="Issue Date"
          value={filters?.date}
          onChange={(e) => onFilterChange('date', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default FilterPanel;