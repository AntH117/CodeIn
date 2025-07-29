import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
      const saved = localStorage.getItem("darkMode");
      return saved === "true" || false;
    });
  
    useEffect(() => {
      document.body.className = isDarkMode ? "dark" : "light";
      localStorage.setItem("darkMode", isDarkMode);
    }, [isDarkMode]);
  
    return (
      <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  
  export const useTheme = () => useContext(ThemeContext);