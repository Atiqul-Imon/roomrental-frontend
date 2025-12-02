'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord' | 'staff' | 'admin' | 'super_admin';
  profileImage?: string;
  bio?: string;
  phone?: string;
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  adminMetadata?: {
    isActive: boolean;
    permissions?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'student' | 'landlord') => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const api = (await import('./api')).default;
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      const { user: userData, tokens } = response.data.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error(response.data.error || 'Login failed');
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'landlord'
  ): Promise<User> => {
    const api = (await import('./api')).default;
    
    try {
      // Validate inputs before sending
      if (!email || !password || !name || !role) {
        throw new Error('All fields are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await api.post('/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role,
      });

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        
        // Validate response data
        if (!userData || !userData.id) {
          throw new Error('Invalid response from server: missing user data');
        }

        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
          throw new Error('Invalid response from server: missing tokens');
        }

        // Store authentication data
        try {
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (storageError) {
          console.error('Failed to store authentication data:', storageError);
          throw new Error('Failed to save authentication data. Please try again.');
        }

        setUser(userData);
        return userData;
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      // Handle network errors
      if (!error.response) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      // Handle validation errors from backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle Zod validation errors with details array
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map((detail: any) => {
            if (typeof detail === 'string') return detail;
            return detail.message || `${detail.field}: ${detail.message || 'Invalid'}`;
          });
          throw new Error(errorMessages.join('. '));
        }
        
        // Handle single error message
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Handle HTTP status codes
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid input. Please check your information.');
      }
      
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists.');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    if (!user) return false;
    return ['staff', 'admin', 'super_admin'].includes(user.role);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Admin has most permissions (except super admin specific ones)
    if (user.role === 'admin') {
      const restricted = ['manage_super_admins', 'system_settings'];
      return !restricted.includes(permission);
    }
    
    // Staff has only explicitly assigned permissions
    if (user.role === 'staff' && user.adminMetadata?.permissions) {
      return user.adminMetadata.permissions.includes(permission);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        hasPermission,
      }}
    >
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

