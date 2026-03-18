import React from 'react';
import Image from '../../../components/AppImage';

import Button from '../../../components/ui/Button';

const UserTableRow = ({ user, isSelected, onSelect, onEdit, onDelete, onViewDetails }) => {
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

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-3 py-3 md:px-4 md:py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(user?.id, e?.target?.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Select ${user?.name}`}
        />
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Image
            src={user?.photo}
            alt={user?.photoAlt}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.userId}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <p className="text-xs md:text-sm text-foreground truncate">{user?.email}</p>
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${roleColors?.[user?.role]}`}>
          {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
        </span>
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <p className="text-xs md:text-sm text-foreground truncate">{user?.department}</p>
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColors?.[user?.status]}`}>
          {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
        </span>
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{user?.joiningDate}</p>
      </td>
      <td className="px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(user)}
            iconName="Eye"
            iconSize={16}
            className="w-8 h-8"
            aria-label={`View ${user?.name} details`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            iconName="Edit"
            iconSize={16}
            className="w-8 h-8"
            aria-label={`Edit ${user?.name}`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(user?.id)}
            iconName="Trash2"
            iconSize={16}
            className="w-8 h-8 text-error hover:text-error"
            aria-label={`Delete ${user?.name}`}
          />
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;