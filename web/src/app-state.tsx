import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, tokenStore, type User } from "./api";
import { dict, type Lang } from "./i18n";

interface AppState {
  user: User | null;
  ready: boolean;
  lang: Lang;
  theme: "dark" | "light";
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  setUser: (u: User | null) => void;
  logout: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState<Lang>((localStorage.getItem("ludora_lang") as Lang) || "en");
  const [theme, setTheme] = useState<"dark" | "light">((localStorage.getItem("ludora_theme") as "dark" | "light") || "dark");

  // restore session from the token
  useEffect(() => {
    (async () => {
      if (tokenStore.get()) {
        try { setUser(await api.me()); } catch { tokenStore.clear(); }
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("lang", lang);
  }, [theme, lang]);

  const t = (key: string) => dict[lang][key] ?? dict.en[key] ?? key;
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("ludora_lang", l); };
  const toggleTheme = () => setTheme((prev) => { const n = prev === "dark" ? "light" : "dark"; localStorage.setItem("ludora_theme", n); return n; });
  const logout = () => { tokenStore.clear(); setUser(null); };

  const value = useMemo<AppState>(() => ({ user, ready, lang, theme, t, setLang, toggleTheme, setUser, logout }), [user, ready, lang, theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
