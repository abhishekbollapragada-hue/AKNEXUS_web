import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterPanel = ({ onFilterChange, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'this-month',
    department: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'half-day', label: 'Half Day' },
    { value: 'late', label: 'Late' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: 'this-month',
      department: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Filter" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
                Filters & Export
              </h3>
              <p className="text-xs text-muted-foreground">
                Customize your attendance view
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <Icon
              name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
              size={20}
            />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />

            <Select
              label="Department"
              options={departmentOptions}
              value={filters?.department}
              onChange={(value) => handleFilterChange('department', value)}
            />

            <Select
              label="Status"
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
          </div>

          {filters?.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <Input
                label="Start Date"
                type="date"
                value={filters?.startDate}
                onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={filters?.endDate}
                onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium transition-smooth hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <Icon name="RotateCcw" size={16} />
              <span>Reset Filters</span>
            </button>

            <div className="flex-1"></div>

            <button
              onClick={() => onExport('pdf')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-warm flex items-center justify-center gap-2"
            >
              <Icon name="FileText" size={16} />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => onExport('excel')}
              className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-warm flex items-center justify-center gap-2"
            >
              <Icon name="FileSpreadsheet" size={16} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;