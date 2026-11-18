import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, loadToken, clearToken, type User } from "./api";
import { dict, type Lang } from "./i18n";
import { darkColors, lightColors, type Colors } from "./theme";
import { registerForPush } from "./push";

const TOUR_KEY = "ludora_tour_done";

interface AppState {
  user: User | null;
  ready: boolean;
  lang: Lang;
  theme: "dark" | "light";
  colors: Colors;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  showTour: boolean;
  startTour: () => void;
  endTour: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        try { setUser(await api.me()); } catch { await clearToken(); }
      }
      setReady(true);
    })();
  }, []);

  // once signed in, register push and, on first ever sign-in, open the guided tour
  useEffect(() => {
    if (!user) return;
    registerForPush();
    (async () => {
      try { if ((await SecureStore.getItemAsync(TOUR_KEY)) !== "1") setShowTour(true); } catch {}
    })();
  }, [user]);

  const colors = theme === "dark" ? darkColors : lightColors;
  const t = (key: string) => dict[lang][key] ?? dict.en[key] ?? key;
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));
  const logout = async () => { await clearToken(); setUser(null); };
  const startTour = () => setShowTour(true);
  const endTour = () => { setShowTour(false); SecureStore.setItemAsync(TOUR_KEY, "1").catch(() => {}); };

  const value = useMemo<AppState>(
    () => ({ user, ready, lang, theme, colors, t, setLang, toggleTheme, setUser, logout, showTour, startTour, endTour }),
    [user, ready, lang, theme, showTour]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
