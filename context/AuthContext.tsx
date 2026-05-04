'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/utils/api';

interface User {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('delivery_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const { data } = await authAPI.login({ phone, password });
    setUser(data.user);
    localStorage.setItem('delivery_user', JSON.stringify(data.user));
    localStorage.setItem('delivery_token', data.access_token);
  };

  const signup = async (name: string, phone: string, password: string) => {
    const { data } = await authAPI.signup({ name, phone, password });
    setUser(data.user);
    localStorage.setItem('delivery_user', JSON.stringify(data.user));
    localStorage.setItem('delivery_token', data.access_token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}