import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lightTheme, darkTheme, Theme } from './themeConfig';

// Fallback theme configuration
const defaultThemeConfig = {
  light: {
    background: 'bg-white',
    text: 'text-black',
    primary: 'text-blue-500',
    secondary: 'text-gray-500'
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-300',
    secondary: 'text-gray-300'
  }
};

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeConfig: Theme;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Determine initial theme
const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return savedTheme || (systemPrefersDark ? 'dark' : 'light');
};

// Theme store definition
const useThemeStore = create(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      themeConfig: getInitialTheme() === 'light' ? 
        (lightTheme || defaultThemeConfig.light) : 
        (darkTheme || defaultThemeConfig.dark),
      
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        return { 
          theme: newTheme, 
          themeConfig: newTheme === 'light' ? 
            (lightTheme || defaultThemeConfig.light) : 
            (darkTheme || defaultThemeConfig.dark)
        };
      }),
      
      setTheme: (theme: 'light' | 'dark') => set({
        theme, 
        themeConfig: theme === 'light' ? 
          (lightTheme || defaultThemeConfig.light) : 
          (darkTheme || defaultThemeConfig.dark)
      })
    }),
    { 
      name: 'theme-storage',
      getStorage: () => localStorage 
    }
  )
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, themeConfig, toggleTheme, setTheme } = useThemeStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Apply theme to document
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light', 'dark');
    htmlElement.classList.add(theme);

    // Persist theme preference
    localStorage.setItem('theme', theme);

    // Mark as initialized
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [theme, isInitialized]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    themeConfig,
    toggleTheme,
    setTheme
  }), [theme, themeConfig, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`${themeConfig.background} ${themeConfig.text} min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
