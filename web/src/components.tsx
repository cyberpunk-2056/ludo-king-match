import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api, money, type Wallet } from "./api";
import { useApp } from "./app-state";

export function Board() {
  // original generic Ludo-style board: four colored corners + gradient center
  return (
    <div className="board" aria-hidden>
      <div className="q r" /><div className="q x" /><div className="q g" />
      <div className="q x" /><div className="q center" /><div className="q x" />
      <div className="q b" /><div className="q x" /><div className="q y" />
    </div>
  );
}

export function TopBar() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const nav = useNavigate();

  useEffect(() => { api.wallet().then(setWallet).catch(() => {}); }, []);

  return (
    <header className="topbar">
      <div className="topbar-in">
        <span className="brand">{t("appName")}</span>
        <span className="spacer" />
        <button className="wallet-chip" onClick={() => nav("/wallet")}>
          <span className="amt num">{wallet ? money(wallet.deposit + wallet.winnings, wallet.currency) : "…"}</span>
          <span className="add" onClick={(e) => { e.stopPropagation(); nav("/deposit"); }}>+</span>
        </button>
        <button className="icon-btn" title="Language" onClick={() => setLang(lang === "en" ? "hi" : "en")}>
          {lang === "en" ? "हिं" : "EN"}
        </button>
        <button className="icon-btn" title="Theme" onClick={toggleTheme}>{theme === "dark" ? "☀" : "☾"}</button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useApp();
  const items = [
    { to: "/home", k: "nav_home" }, { to: "/play", k: "nav_play" },
    { to: "/wallet", k: "nav_wallet" }, { to: "/profile", k: "nav_profile" },
  ];
  return (
    <nav className="bottomnav">
      <div className="bottomnav-in">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => "bn" + (isActive ? " active" : "")}>
            {t(i.k)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="container">{children}</main>
      <BottomNav />
    </>
  );
}
