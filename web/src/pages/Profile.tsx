import { useNavigate } from "react-router-dom";
import { money } from "../api";
import { useApp } from "../app-state";

export function Profile() {
  const { t, user, logout } = useApp();
  const nav = useNavigate();
  if (!user) return null;
  const s = user.stats;
  const tail = user.phone.length >= 4 ? "•••• " + user.phone.slice(-4) : "—";

  return (
    <>
      <h1 className="page-title">{t("profile")}</h1>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="pf-av">{user.name.charAt(0).toUpperCase()}</div>
        <div className="grow">
          <div style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18 }}>{user.name}</div>
          <div className="muted" style={{ fontSize: 12 }}>{tail} · since {user.joined}</div>
        </div>
        <span className="pf-rating">★ <b>{user.rating}</b></span>
      </div>

      <div className="tiles" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="tile"><div className="v num">{s.played}</div><div className="k">{t("played")}</div></div>
        <div className="tile"><div className="v num" style={{ color: "var(--green)" }}>{s.wins}</div><div className="k">{t("wins")}</div></div>
        <div className="tile"><div className="v num" style={{ color: "var(--violet)" }}>{s.played ? Math.round((s.wins / s.played) * 100) : 0}%</div><div className="k">{t("win_rate")}</div></div>
        <div className="tile"><div className="v num" style={{ color: "var(--yellow)" }}>{money(s.total_won)}</div><div className="k">{t("total_won")}</div></div>
      </div>

      <button className="btn ghost block" style={{ marginTop: 16 }} onClick={() => { logout(); nav("/auth", { replace: true }); }}>{t("logout")}</button>
    </>
  );
}
