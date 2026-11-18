import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserSession, UserRole } from '../types';
import { api, setSessionRevocationListener, setStoredSessionId } from '../services/api';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  isLoading: boolean;
  isRevokedModalOpen: boolean;
  revokedReason: string;
  closeRevokedModal: () => void;
  login: (email: string, password?: string, deviceLabel?: string) => Promise<void>;
  loginWithGoogle: (payload: {
    credential?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    deviceLabel?: string;
  }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password?: string;
    role: string;
    collegeId: string;
    branch?: string;
    semester?: number;
    deviceLabel?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevokedModalOpen, setIsRevokedModalOpen] = useState(false);
  const [revokedReason, setRevokedReason] = useState('');

  // Handle session revocation trigger
  const handleSessionRevoked = useCallback((message: string) => {
    setRevokedReason(message);
    setIsRevokedModalOpen(true);
    setUser(null);
    setSession(null);
    setStoredSessionId(null);
  }, []);

  useEffect(() => {
    setSessionRevocationListener(handleSessionRevoked);
  }, [handleSessionRevoked]);

  // Initial session check
  const refreshSession = useCallback(async () => {
    try {
      const res = await api.checkSession();
      if (res.valid && res.user && res.session) {
        setUser(res.user);
        setSession(res.session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Session Heartbeat: checks every 4 seconds to catch multi-device logins in real-time
  useEffect(() => {
    if (!session || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.checkSession();
        if (!res.valid) {
          handleSessionRevoked(res.error || 'Your account was signed in on another device. Please log in again.');
        } else if (res.session) {
          setSession(res.session);
        }
      } catch {
        // Handled by 401 interceptor
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [session, user, handleSessionRevoked]);

  const login = async (email: string, password?: string, deviceLabel?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password, deviceLabel || 'Primary Web Device');
      setUser(res.user);
      setSession(res.session);
      setIsRevokedModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload: {
    credential?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    deviceLabel?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle({
        ...payload,
        deviceLabel: payload.deviceLabel || 'Primary Web Device'
      });
      setUser(res.user);
      setSession(res.session);
      setIsRevokedModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password?: string;
    role: string;
    collegeId: string;
    branch?: string;
    semester?: number;
    deviceLabel?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setSession(res.session);
      setIsRevokedModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const closeRevokedModal = () => {
    setIsRevokedModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isRevokedModalOpen,
        revokedReason,
        closeRevokedModal,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
