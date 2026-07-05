import { useReducer, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { AuthContext } from './AuthContext.context';
import type { AuthContextValue } from './AuthContext.context';

interface AuthState {
  token: string | null;
  userId: string | null;
  mobileNumber: string | null;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; userId: string; mobileNumber: string } }
  | { type: 'LOGOUT' };

const initialState: AuthState = { token: null, userId: null, mobileNumber: null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { token: action.payload.token, userId: action.payload.userId, mobileNumber: action.payload.mobileNumber };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  useEffect(() => {
    setUnauthorizedHandler(() => dispatch({ type: 'LOGOUT' }));
  }, []);

  const login = (token: string, userId: string, mobileNumber: string) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, userId, mobileNumber } });
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, isAuthenticated: state.token !== null, login, logout }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}