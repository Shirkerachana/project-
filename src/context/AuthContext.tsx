import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../api/auth.service';

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole, email?: string) => Promise<User>;
  loginWithCredentials: (email: string, role?: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((curr) => {
        setUser(curr);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loginAsRole = async (targetRole: UserRole, email?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.loginAsRole(targetRole, email);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, targetRole: UserRole = 'Recruiter'): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.loginAsRole(targetRole, email);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'Recruiter',
        isLoading,
        isAuthenticated,
        loginAsRole,
        loginWithCredentials,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
