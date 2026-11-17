import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api, money, type Wallet } from "./api";
import { useApp } from "./app-state";

const icons: Record<string, React.ReactNode> = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  play: <><circle cx="12" cy="12" r="9" /><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M16 13h2" /><path d="M3 9.5h15a2 2 0 012 2" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></>,
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export function Board() {
  // original, generic four-colour Ludo-style board — drawn from simple shapes
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
        <span className="brand"><span className="mk">♛</span>{t("appName")}</span>
        <span className="spacer" />
        <div className="hw">
          <button className="hw-main" onClick={() => nav("/wallet")}>
            <span className="hw-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M16 13h2" /><path d="M3 9.5h15a2 2 0 012 2" /></svg>
            </span>
            <span className="hw-amt num">{wallet ? money(wallet.deposit + wallet.winnings, wallet.currency) : "…"}</span>
          </button>
          <button className="hw-add" aria-label="Add money" onClick={() => nav("/deposit")}>+</button>
        </div>
        <button className="icon-btn" title="Language" onClick={() => setLang(lang === "en" ? "hi" : "en")}>{lang === "en" ? "हिं" : "EN"}</button>
        <button className={"icon-btn theme " + theme} title="Theme" onClick={toggleTheme}>{theme === "dark" ? "☀" : "☾"}</button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useApp();
  const items = [
    { to: "/home", k: "nav_home", ic: "home" }, { to: "/play", k: "nav_play", ic: "play" },
    { to: "/wallet", k: "nav_wallet", ic: "wallet" }, { to: "/profile", k: "nav_profile", ic: "profile" },
  ];
  return (
    <nav className="bottomnav">
      <div className="bottomnav-in">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => "bn" + (isActive ? " active" : "")}>
            <Icon name={i.ic} />
            <span>{t(i.k)}</span>
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
