import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceTable = ({ records, onCorrection }) => {
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-success/10 text-success border-success/20';
      case 'Absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Half Day':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Late':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelectedRecords(records?.map(r => r?.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (id) => {
    setSelectedRecords(prev =>
      prev?.includes(id) ? prev?.filter(i => i !== id) : [...prev, id]
    );
  };

  const sortedRecords = [...records]?.sort((a, b) => {
    if (sortConfig?.key === 'date') {
      return sortConfig?.direction === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    return 0;
  });

  return (
    <div className="bg-card rounded-xl shadow-warm-md border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
              Attendance History
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete record of your attendance
            </p>
          </div>
          {selectedRecords?.length > 0 && (
            <button
              onClick={() => onCorrection(selectedRecords)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:shadow-warm flex items-center gap-2"
            >
              <Icon name="Edit" size={16} />
              <span>Request Correction ({selectedRecords?.length})</span>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-custom">
        <table className="w-full min-w-[800px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRecords?.length === records?.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-border"
                />
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/70 transition-smooth"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  <span>Date</span>
                  <Icon
                    name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                    size={16}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Check In</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Check Out</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Total Hours</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Break Duration</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedRecords?.map((record) => (
              <tr
                key={record?.id}
                className="hover:bg-muted/30 transition-smooth"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRecords?.includes(record?.id)}
                    onChange={() => handleSelectRecord(record?.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                </td>
                <td className="px-4 py-4 text-sm text-foreground font-medium">
                  {new Date(record.date)?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-4 text-sm text-foreground data-text">{record?.checkIn}</td>
                <td className="px-4 py-4 text-sm text-foreground data-text">{record?.checkOut}</td>
                <td className="px-4 py-4 text-sm text-foreground data-text font-medium">
                  {record?.totalHours}
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground data-text">
                  {record?.breakDuration}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record?.status)}`}>
                    {record?.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={record?.locationVerified ? 'MapPin' : 'MapPinOff'}
                      size={16}
                      color={record?.locationVerified ? 'var(--color-success)' : 'var(--color-muted-foreground)'}
                    />
                    <span className="text-xs text-muted-foreground">
                      {record?.locationVerified ? 'Verified' : 'Not verified'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;