import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const UserProfileHeader = ({ isCollapsed = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState('employee');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') || 'employee';
    setUserRole(storedRole);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/authentication-portal';
  };

  const handleProfileClick = () => {
    console.log('Navigate to profile settings');
  };

  return (
    <div className="relative px-4 py-6 border-b border-border" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`
          w-full flex items-center gap-3 transition-smooth
          ${isCollapsed ? 'justify-center' : ''}
          hover:opacity-80
        `}
        aria-label="User profile menu"
        aria-expanded={isDropdownOpen}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={20} color="var(--color-primary)" />
        </div>
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`transition-smooth ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {isDropdownOpen && !isCollapsed && (
        <div className="absolute left-4 right-4 top-full mt-2 bg-popover border border-border rounded-lg shadow-warm-lg z-50">
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="Settings" size={16} />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="LogOut" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileHeader;