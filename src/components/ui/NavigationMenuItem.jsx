import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationMenuItem = ({ 
  path, 
  label, 
  icon, 
  tooltip, 
  isCollapsed = false,
  onClick 
}) => {
  const location = useLocation();
  const isActive = location?.pathname === path;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth min-h-[48px]
        ${isActive
          ? 'bg-primary text-primary-foreground shadow-warm'
          : 'text-foreground hover:bg-muted hover:translate-y-[-1px]'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? tooltip : ''}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        name={icon}
        size={20}
        color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
      />
      {!isCollapsed && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </Link>
  );
};

export default NavigationMenuItem;