import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to every outgoing request, if one exists.
// Read directly from a small in-memory holder (see below) rather than
// importing AuthContext here — this file must stay framework-agnostic
// and can't call React hooks.
let currentToken: string | null = null;

export function setAuthToken(token: string | null): void {
  currentToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Globally handle 401s — if the token is invalid/expired, clear it and
// let the app react (AuthContext listens for this via the callback below).
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      currentToken = null;
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default apiClient;