'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextValue = {
  isAuthenticated: boolean;
  isChecking: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')));
    setIsChecking(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    isChecking,
    login: (token: string) => {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    },
    logout: () => {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    },
  }), [isAuthenticated, isChecking]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isChecking } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthScreen = pathname === '/auth-screen';

  useEffect(() => {
    if (isChecking) return;

    if (!isAuthenticated && !isAuthScreen) {
      router.replace('/auth-screen');
      return;
    }

    if (isAuthenticated && isAuthScreen) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isAuthScreen, isChecking, router]);

  if (isChecking || (!isAuthenticated && !isAuthScreen) || (isAuthenticated && isAuthScreen)) {
    return null;
  }

  return children;
}
