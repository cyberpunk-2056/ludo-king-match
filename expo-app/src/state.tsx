import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, loadToken, clearToken, type User } from "./api";
import { dict, type Lang } from "./i18n";
import { darkColors, lightColors, type Colors } from "./theme";

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
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        try { setUser(await api.me()); } catch { await clearToken(); }
      }
      setReady(true);
    })();
  }, []);

  const colors = theme === "dark" ? darkColors : lightColors;
  const t = (key: string) => dict[lang][key] ?? dict.en[key] ?? key;
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));
  const logout = async () => { await clearToken(); setUser(null); };

  const value = useMemo<AppState>(
    () => ({ user, ready, lang, theme, colors, t, setLang, toggleTheme, setUser, logout }),
    [user, ready, lang, theme]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
