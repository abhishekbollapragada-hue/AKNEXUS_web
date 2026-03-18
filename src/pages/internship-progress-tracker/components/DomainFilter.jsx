import React from 'react';
import Icon from '../../../components/AppIcon';

const DomainFilter = ({ domains, selectedDomain, onDomainChange }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-warm">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Filter" size={20} color="var(--color-primary)" />
        <h3 className="text-sm md:text-base font-heading font-semibold text-foreground">Filter by Domain</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onDomainChange('all')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-smooth ${
            selectedDomain === 'all' ?'bg-primary text-primary-foreground shadow-warm' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          All Tasks
        </button>
        {domains?.map((domain) => (
          <button
            key={domain?.id}
            onClick={() => onDomainChange(domain?.id)}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-smooth ${
              selectedDomain === domain?.id
                ? 'bg-primary text-primary-foreground shadow-warm'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {domain?.name}
            <span className="ml-2 opacity-70">({domain?.taskCount})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DomainFilter;