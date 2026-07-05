import { createContext } from 'react';

export interface AuthContextValue {
  token: string | null;
  userId: string | null;
  mobileNumber: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, mobileNumber: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);