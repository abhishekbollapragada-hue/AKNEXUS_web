import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const statusColors = {
    active: 'bg-success/10 text-success',
    inactive: 'bg-muted text-muted-foreground',
    pending: 'bg-warning/10 text-warning',
    suspended: 'bg-error/10 text-error'
  };

  const roleColors = {
    admin: 'bg-primary/10 text-primary',
    mentor: 'bg-accent/10 text-accent',
    employee: 'bg-secondary/10 text-secondary',
    intern: 'bg-muted text-muted-foreground'
  };

  const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={16} color="var(--color-muted-foreground)" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-warm-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">User Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
            aria-label="Close modal"
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-border">
            <Image
              src={user?.photo}
              alt={user?.photoAlt}
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">{user?.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{user?.userId}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${roleColors?.[user?.role]}`}>
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${statusColors?.[user?.status]}`}>
                  {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-heading font-semibold text-foreground mb-4">Contact Information</h4>
              <div className="space-y-0">
                <DetailRow icon="Mail" label="Email" value={user?.email} />
                <DetailRow icon="Phone" label="Phone" value={user?.phone} />
              </div>
            </div>

            <div>
              <h4 className="text-base font-heading font-semibold text-foreground mb-4">Work Details</h4>
              <div className="space-y-0">
                <DetailRow icon="Building2" label="Department" value={user?.department} />
                <DetailRow icon="Calendar" label="Joining Date" value={user?.joiningDate} />
              </div>
            </div>

            {user?.role === 'intern' && (
              <div>
                <h4 className="text-base font-heading font-semibold text-foreground mb-4">Education</h4>
                <div className="space-y-0">
                  <DetailRow icon="GraduationCap" label="College" value={user?.college} />
                  <DetailRow icon="BookOpen" label="Year" value={user?.year} />
                  <DetailRow icon="Clock" label="Duration" value={user?.internshipDuration ? `${user?.internshipDuration} months` : 'Not specified'} />
                </div>
              </div>
            )}

            <div>
              <h4 className="text-base font-heading font-semibold text-foreground mb-4">Skills & Mentor</h4>
              <div className="space-y-0">
                <div className="py-3 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills && user?.skills?.length > 0 ? (
                      user?.skills?.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No skills listed</span>
                    )}
                  </div>
                </div>
                <DetailRow icon="Users" label="Mentor" value={user?.mentor} />
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-base font-heading font-semibold text-foreground mb-4">HR Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <DetailRow icon="DollarSign" label="Salary" value={user?.salary ? `$${parseInt(user?.salary)?.toLocaleString()}` : 'Not disclosed'} />
                <DetailRow icon="Star" label="Performance Rating" value={user?.performanceRating ? `${user?.performanceRating}/5.0` : 'Not rated'} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-base font-heading font-semibold text-foreground mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {user?.recentActivity && user?.recentActivity?.length > 0 ? (
                user?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={activity?.icon} size={16} color="var(--color-primary)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">{activity?.action}</p>
                      <p className="text-xs text-muted-foreground">{activity?.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            iconName="Edit"
            iconPosition="left"
            iconSize={16}
          >
            Edit User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;