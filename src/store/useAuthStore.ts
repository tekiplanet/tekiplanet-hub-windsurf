import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';

type UserData = {
  id: number;
  name?: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  wallet_balance?: number;
  account_type?: 'student' | 'business' | 'professional';
  preferences?: {
    dark_mode?: boolean;
    theme?: 'light' | 'dark';
  };
  dark_mode?: boolean;
  theme?: 'light' | 'dark';
};

type UserPreferences = {
  dark_mode?: boolean;
  theme?: 'light' | 'dark';
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_notifications?: boolean;
};

type AuthState = {
  user: UserData | null;
  token: string | null;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserData>) => void;
  updateUserPreferences: (preferences: UserPreferences) => Promise<UserData>;
  updateUserType: (type: 'student' | 'business' | 'professional') => Promise<void>;
  refreshToken: () => Promise<UserData | null>;
  initialize: () => Promise<UserData | null>;
};

const useAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      theme: localStorage.getItem('theme') as 'light' | 'dark' || 'light',
      isAuthenticated: false,

      initialize: async () => {
        console.group('🔍 AuthStore Initialization');
        console.log('Initial State:', {
          token: localStorage.getItem('token'),
          storedTheme: localStorage.getItem('theme'),
          currentStoreTheme: get().theme,
          isAuthenticated: get().isAuthenticated
        });

        const token = localStorage.getItem('token');
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        
        // Explicitly reset authentication if no token
        if (!token) {
          console.log('❌ No token found. Resetting authentication.');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
          console.groupEnd();
          return null;
        }

        try {
          console.log('🌐 Fetching current user with token');
          const userData = await authService.getCurrentUser();
          
          console.log('👤 User Data Received:', userData);

          // Determine theme priority: server > localStorage > default
          const theme = userData.dark_mode ? 'dark' : 'light';
          
          console.log('🎨 Theme Determination:', {
            serverTheme: theme,
            localStorageTheme: storedTheme,
            finalTheme: theme
          });

          // Update localStorage and state
          localStorage.setItem('theme', theme);
          
          set({
            user: {
              ...userData,
              wallet_balance: Number(userData.wallet_balance || 0),
              preferences: {
                dark_mode: userData.dark_mode ?? false,
                theme: theme
              }
            },
            token,
            isAuthenticated: !!token, // Explicitly tie authentication to token
            theme: theme
          });

          console.log('✅ Initialization Complete', {
            user: get().user,
            theme: get().theme,
            isAuthenticated: get().isAuthenticated
          });

          console.groupEnd();
          return userData;
        } catch (error) {
          console.error('❌ Initialization Failed:', error);
          
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
          
          localStorage.removeItem('token');
          console.groupEnd();
          return null;
        }
      },

      setTheme: async (theme: 'light' | 'dark') => {
        try {
          // Update local storage
          localStorage.setItem('theme', theme);

          // Update user preferences with theme
          const updatedUser = await get().updateUserPreferences({ 
            dark_mode: theme === 'dark',
            theme 
          });
          
          // Update local theme state
          set({ 
            theme, 
            user: updatedUser 
          });
        } catch (error) {
          console.error('Failed to update theme:', error);
        }
      },

      login: async (email: string, password: string) => {
        try {
          const { user, token } = await authService.login({ login: email, password });
          
          // Persist token in localStorage
          localStorage.setItem('token', token);
          
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            theme: user.dark_mode ? 'dark' : 'light'
          });

          // Update theme in localStorage
          localStorage.setItem('theme', user.dark_mode ? 'dark' : 'light');

          // Immediately fetch fresh user data
          await get().initialize();
        } catch (error) {
          console.error('Login failed:', error);
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
          throw error;
        }
      },

      logout: () => {
        // Clear local storage
        localStorage.removeItem('token');
        
        // Reset authentication state
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });

        // Optional: Call backend logout service
        try {
          authService.logout().catch(error => {
            // Silently handle any remaining logout errors
            console.warn('Logout service encountered an issue:', error);
          });
        } catch (error) {
          console.error('Logout attempt failed:', error);
        }
      },

      updateUser: (userData: Partial<UserData>) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },

      updateUserPreferences: async (preferences: UserPreferences) => {
        try {
          const updatedUser = await authService.updateUserPreferences(preferences);
          
          // Merge with existing user data
          set(state => ({
            user: state.user ? { 
              ...state.user, 
              preferences: {
                ...state.user.preferences,
                ...updatedUser.preferences
              }
            } : null,
            theme: updatedUser.preferences?.dark_mode ? 'dark' : 'light'
          }));

          return updatedUser;
        } catch (error) {
          console.error('Store: Error updating user preferences', error);
          throw error;
        }
      },

      updateUserType: async (type: 'student' | 'business' | 'professional') => {
        try {
          const updatedUser = await authService.updateUserType(type);
          
          set(state => ({
            user: state.user ? {
              ...state.user,
              ...updatedUser,
              account_type: type
            } : null
          }));
        } catch (error) {
          console.error('Failed to update user type:', error);
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          // If no token exists, do nothing
          const token = localStorage.getItem('token');
          if (!token) {
            return null;
          }

          // Fetch current user data from the server with a unique cache-busting parameter
          const response = await fetch(`${import.meta.env.VITE_API_URL}/user?_=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (!response.ok) {
            // If token is invalid or expired, logout
            get().logout();
            return null;
          }

          const userData = await response.json();

          // Force a complete state update
          set((state) => {
            return {
              ...state,
              user: {
                ...userData,
                wallet_balance: Number(userData.wallet_balance || 0),
                preferences: {
                  dark_mode: userData.dark_mode ?? false,
                  theme: userData.dark_mode ? 'dark' : 'light'
                }
              },
              isAuthenticated: true
            };
          }, true);  // Force update

          return userData;
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // Logout if there's an error
          get().logout();
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        theme: state.theme,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export { useAuthStore };
export default useAuthStore;