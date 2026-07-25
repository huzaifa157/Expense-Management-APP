import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme, useColorScheme } from "nativewind";

const THEME_KEY = "theme_preference";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { colorScheme: scheme } = useColorScheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === "dark" || stored === "light") {
        colorScheme.set(stored);
      }
      setReady(true);
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const next = scheme === "dark" ? "light" : "dark";
    colorScheme.set(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ isDark: scheme === "dark", toggleTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
