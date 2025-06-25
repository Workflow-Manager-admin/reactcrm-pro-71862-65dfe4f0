import React, { createContext, useContext, useState } from "react";
const ThemeContext = createContext();

// PUBLIC_INTERFACE
export const ThemeContextProvider = ({ children }) => {
  const localTheme = localStorage.getItem("crm_theme");
  const [theme, setTheme] = useState(localTheme || "light");
  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(t => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem("crm_theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
// PUBLIC_INTERFACE
export const useTheme = () => {
  return useContext(ThemeContext);
};
