import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/Config';
import { Platform } from 'react-native';

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  loading: true,
});

// Storage helper functions that work on both web and native
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      try {
        // Try SecureStore first
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) {
          return value;
        }
        // If not found in SecureStore, check AsyncStorage as fallback
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error(`Error retrieving ${key} from secure storage:`, error);
        // Fall back to AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      try {
        // Store in both SecureStore and AsyncStorage for redundancy
        await SecureStore.setItemAsync(key, value);
        await AsyncStorage.setItem(key, value);
        console.log(`[Auth] Stored ${key} in both SecureStore and AsyncStorage`);
      } catch (error) {
        console.error(`Error storing ${key} in secure storage:`, error);
        // Fall back to AsyncStorage
        await AsyncStorage.setItem(key, value);
        console.log(`[Auth] Stored ${key} in AsyncStorage (fallback)`);
      }
    }
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      try {
        // Remove from both storages
        await SecureStore.deleteItemAsync(key);
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from secure storage:`, error);
        // Make sure it's removed from AsyncStorage at least
        await AsyncStorage.removeItem(key);
      }
    }
  }
};

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to refresh the access token
  const refreshToken = async () => {
    try {
      const refresh_token = await secureStorage.getItem('refresh_token');
      if (!refresh_token) {
        return false;
      }

      const response = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token }),
      });

      if (response.ok) {
        const data = await response.json();
        await secureStorage.setItem('access_token', data.access_token);
        await secureStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // Function to validate and refresh token if needed
  const validateToken = async () => {
    try {
      const access_token = await secureStorage.getItem('access_token');
      if (!access_token) {
        return false;
      }

      const response = await fetch(`${API_URL}/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }

      if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the validation with new token
          return validateToken();
        }
      }

      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) {
          await logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await secureStorage.setItem('access_token', data.access_token);
        await secureStorage.setItem('refresh_token', data.refresh_token);
        
        const userData = await fetch(`${API_URL}/auth/me/`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        }).then(res => res.json());

        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await secureStorage.removeItem('access_token');
      await secureStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // The value that will be available to consumers of this context
  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 