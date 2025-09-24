import { useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  profilePhoto?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (credentials: { email: string; password?: string; fingerprint?: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate authentication - replace with actual auth logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual user data from authentication
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: credentials.email,
        role: credentials.email.includes('admin') ? 'admin' : 'employee',
        status: 'active',
      };

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, user: mockUser };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Authentication failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
}