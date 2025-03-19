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

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have tokens
        const accessToken = await secureStorage.getItem('access_token');
        const refreshToken = await secureStorage.getItem('refresh_token');
        
        console.log('Checking auth - Access token exists:', !!accessToken);
        console.log('Checking auth - Refresh token exists:', !!refreshToken);
        
        if (!accessToken || !refreshToken) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Debug: Check authentication headers
        try {
          const debugResponse = await fetch(`${API_URL}/auth/debug-auth`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
          });
          
          if (debugResponse.ok) {
            const debugData = await debugResponse.json();
            console.log('Debug auth response during checkAuth:', debugData);
          } else {
            console.error('Debug auth failed during checkAuth:', await debugResponse.text());
          }
        } catch (debugError) {
          console.error('Debug auth error during checkAuth:', debugError);
        }

        // Validate token by fetching user info
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data fetched successfully:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          console.log('Token expired, trying to refresh...');
          // Token expired, try to refresh
          await refreshAccessToken();
        } else {
          console.error('Auth check failed with status:', response.status);
          console.error('Auth check error response:', await response.text().catch(() => 'No response text'));
          // Other error, clear tokens
          await logout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to refresh the access token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await secureStorage.getItem('refresh_token');
      console.log('Refreshing token - Refresh token exists:', !!refreshToken);
      
      if (!refreshToken) {
        console.log('No refresh token found, logging out');
        await logout();
        return false;
      }

      console.log('Attempting to refresh token...');
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Token refresh successful, new tokens received');
        
        await secureStorage.setItem('access_token', data.access_token);
        await secureStorage.setItem('refresh_token', data.refresh_token);
        
        // Debug: Check if token is stored correctly
        const storedToken = await secureStorage.getItem('access_token');
        console.log('New stored token:', storedToken?.substring(0, 20) + '...');
        
        // Fetch user data with new token
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data fetched successfully after refresh:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error('Failed to fetch user data after refresh:', await userResponse.text().catch(() => 'No response text'));
        }
      } else {
        // Handle specific error responses
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Token refresh failed:', errorData);
        console.error('Token refresh status:', response.status);
      }
      
      // If we get here, refresh failed
      console.log('Token refresh failed, logging out');
      await logout();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Test the test endpoint first
      try {
        const testResponse = await fetch(`${API_URL}/test`);
        if (testResponse.ok) {
          console.log('Test endpoint works:', await testResponse.json());
        } else {
          console.error('Test endpoint failed:', await testResponse.text());
        }
      } catch (testError) {
        console.error('Test endpoint error:', testError);
      }
      
      // Create form data for OAuth2 password flow
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, tokens received:', data);
        
        // Store tokens securely
        await secureStorage.setItem('access_token', data.access_token);
        await secureStorage.setItem('refresh_token', data.refresh_token);
        
        // Debug: Check if token is stored correctly
        const storedToken = await secureStorage.getItem('access_token');
        console.log('Stored token:', storedToken?.substring(0, 20) + '...');
        
        // Debug: Check authentication headers
        try {
          const debugResponse = await fetch(`${API_URL}/auth/debug-auth`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`
            },
          });
          
          if (debugResponse.ok) {
            const debugData = await debugResponse.json();
            console.log('Debug auth response:', debugData);
          } else {
            console.error('Debug auth failed:', await debugResponse.text());
          }
        } catch (debugError) {
          console.error('Debug auth error:', debugError);
        }
        
        // Fetch user data
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error('Failed to fetch user data:', await userResponse.text());
        }
      } else {
        // Handle specific error responses
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Login failed:', errorData);
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email, username, password }),
        // Don't use credentials for now
        // credentials: 'include',
      });

      if (response.ok) {
        // After successful signup, log the user in
        return await login(username, password);
      } else {
        // Handle specific error responses
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Signup failed:', errorData);
        return false;
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear tokens
      await secureStorage.removeItem('access_token');
      await secureStorage.removeItem('refresh_token');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // The value that will be available to consumers of this context
  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 