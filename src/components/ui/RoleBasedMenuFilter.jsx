import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleBasedMenuFilter');
  }
  return context;
};

const RoleBasedMenuFilter = ({ children }) => {
  const [userRole, setUserRole] = useState('employee');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');
    
    if (storedRole) {
      setUserRole(storedRole);
    }
    
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const updateRole = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const login = (role, token) => {
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('userRole', role);
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setUserRole('employee');
    setIsAuthenticated(false);
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
  };

  const hasPermission = (requiredRoles) => {
    if (!Array.isArray(requiredRoles)) {
      return false;
    }
    return requiredRoles?.includes(userRole);
  };

  const value = {
    userRole,
    isAuthenticated,
    updateRole,
    login,
    logout,
    hasPermission
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleBasedMenuFilter;