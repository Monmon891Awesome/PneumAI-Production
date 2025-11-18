import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('pneumai-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [modernUI, setModernUI] = useState(() => {
    // Check localStorage for saved UI preference
    const saved = localStorage.getItem('pneumai-modern-ui');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Apply dark mode class to html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('pneumai-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Save UI preference to localStorage
    localStorage.setItem('pneumai-modern-ui', JSON.stringify(modernUI));
  }, [modernUI]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleModernUI = () => {
    setModernUI(prev => !prev);
  };

  const value = {
    darkMode,
    toggleDarkMode,
    setDarkMode,
    modernUI,
    toggleModernUI,
    setModernUI
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
