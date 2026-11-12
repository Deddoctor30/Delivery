import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "theme-preference";
export type ThemePreference = "light" | "dark" | "system";

/** Восстанавливает сохранённую тему при старте приложения. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === "light" || value === "dark" || value === "system") {
        setColorScheme(value);
      }
    });
  }, [setColorScheme]);

  return <>{children}</>;
}

/** Текущая тема + переключение с сохранением выбора. */
export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const setTheme = useCallback(
    (preference: ThemePreference) => {
      setColorScheme(preference);
      void AsyncStorage.setItem(STORAGE_KEY, preference);
    },
    [setColorScheme],
  );

  const toggle = useCallback(() => {
    setTheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setTheme]);

  return { colorScheme, setTheme, toggle };
}
