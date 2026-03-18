import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const UserFilterPanel = ({ filters, onFilterChange, onReset, onApply }) => {
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'employee', label: 'Employee' },
    { value: 'intern', label: 'Intern' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-warm mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          iconName="RotateCcw"
          iconPosition="left"
          iconSize={14}
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
        <Select
          label="Role"
          options={roleOptions}
          value={filters?.role}
          onChange={(value) => onFilterChange('role', value)}
        />

        <Select
          label="Department"
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => onFilterChange('department', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Input
          label="Joining Date From"
          type="date"
          value={filters?.joiningDateFrom}
          onChange={(e) => onFilterChange('joiningDateFrom', e?.target?.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={onApply}
          iconName="Filter"
          iconPosition="left"
          iconSize={16}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default UserFilterPanel;