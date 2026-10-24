import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthApi { user: User | null; login: (user: User) => void; logout: () => void }

const AuthContext = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

function loadSavedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('user') ?? 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSavedUser);

  const login = (next: User) => {
    localStorage.setItem('user', JSON.stringify(next));
    setUser(next);
  };
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
