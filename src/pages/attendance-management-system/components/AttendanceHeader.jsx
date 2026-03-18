import React from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceHeader = ({ currentStatus, sessionTime, onCheckIn, onCheckOut, isLoading }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-6 md:p-8 border border-border">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1 w-full lg:w-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              currentStatus === 'checked-in' ? 'bg-success/10' : 'bg-muted'
            }`}>
              <Icon 
                name={currentStatus === 'checked-in' ? 'CheckCircle' : 'Clock'} 
                size={24} 
                color={currentStatus === 'checked-in' ? 'var(--color-success)' : 'var(--color-muted-foreground)'}
              />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                {currentStatus === 'checked-in' ? 'Currently Checked In' : 'Ready to Check In'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date()?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {currentStatus === 'checked-in' && (
            <div className="bg-success/5 rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-3">
                <Icon name="Timer" size={20} color="var(--color-success)" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Session Duration</p>
                  <p className="text-2xl md:text-3xl font-heading font-semibold text-success data-text">
                    {formatTime(sessionTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {currentStatus === 'checked-out' ? (
            <button
              onClick={onCheckIn}
              disabled={isLoading}
              className="min-w-[160px] px-6 py-4 bg-primary text-primary-foreground rounded-xl font-medium transition-smooth hover:shadow-warm-lg hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="LogIn" size={20} />
              <span>{isLoading ? 'Processing...' : 'Check In'}</span>
            </button>
          ) : (
            <button
              onClick={onCheckOut}
              disabled={isLoading}
              className="min-w-[160px] px-6 py-4 bg-destructive text-destructive-foreground rounded-xl font-medium transition-smooth hover:shadow-warm-lg hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="LogOut" size={20} />
              <span>{isLoading ? 'Processing...' : 'Check Out'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeader;