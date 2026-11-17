import { useEffect, useState } from "react";
import { api, money, type Match, type MatchResult } from "../api";
import { useApp } from "../app-state";

const colors = ["#4B9BFF", "#32D583", "#FFC94D", "#FF5A6A", "#8B6CFF"];
const av = (name: string, i: number) => ({ background: `linear-gradient(145deg,${colors[i % colors.length]},${colors[(i + 1) % colors.length]})` });

export function Play() {
  const { t } = useApp();
  const [live, setLive] = useState<Match[]>([]);
  const [open, setOpen] = useState<Match[]>([]);
  const [recent, setRecent] = useState<MatchResult[]>([]);
  const [mode, setMode] = useState(1);
  const [stake, setStake] = useState("20");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [l, o, r] = await Promise.all([api.liveMatches(), api.openMatches(), api.recentResults()]);
      setLive(l); setOpen(o); setRecent(r);
    } catch { /* empty until data exists */ }
  }
  useEffect(() => { load(); }, []);

  const s = parseFloat(stake) || 0;
  const pot = Math.round(s * 2 * 100) / 100;

  async function create() {
    setMsg(null); setBusy(true);
    try { await api.createMatch({ mode, stake: s }); setMsg("Match created — stake held. Your opponent can now join."); load(); }
    catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  }
  async function join(m: Match) {
    setMsg(null);
    try { const r = await api.joinMatch(m.id); setMsg(`Joined. Ludo King room code: ${r.roomCode}`); load(); }
    catch (e: any) { setMsg(e.message); }
  }

  return (
    <>
      <h1 className="page-title">{t("nav_play")}</h1>

      <div className="card">
        <div className="label">{t("create_match")}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className={"pm" + (mode === 1 ? " on" : "")} onClick={() => setMode(1)}><h4>{t("mode1")}</h4><p>Head-to-head</p></button>
          <button className={"pm" + (mode === 2 ? " on" : "")} onClick={() => setMode(2)}><h4>{t("mode2")}</h4><p>Four players</p></button>
        </div>
        <div className="label" style={{ marginTop: 14 }}>{t("amount")}</div>
        <input className="input" style={{ marginTop: 6 }} inputMode="decimal" value={stake} onChange={(e) => setStake(e.target.value.replace(/[^0-9.]/g, ""))} />
        <div className="tiles">
          <div className="tile"><div className="k">{t("prize_pot")}</div><div className="v num">{money(pot)}</div></div>
          <div className="tile win"><div className="k">{t("winner_95")}</div><div className="v num">{money(Math.round(pot * 95) / 100)}</div></div>
          <div className="tile"><div className="k">{t("fee_5")}</div><div className="v num">{money(Math.round(pot * 5) / 100)}</div></div>
        </div>
        {msg && <div className="err" style={{ color: "var(--fg-dim)" }}>{msg}</div>}
        <button className="btn block lg" style={{ marginTop: 14 }} disabled={busy || s < 1} onClick={create}>{t("find_match")}</button>
      </div>

      <div className="section-title">{t("live_matches")}</div>
      {live.length === 0 && <p className="muted">{t("none")}</p>}
      {live.map((m, i) => (
        <div className="lrow" key={m.id}>
          <span className="av" style={av(m.playerA, i)}>{m.playerA.charAt(0)}</span>
          <div><div className="names">{m.playerA} vs {m.playerB}</div><div className="sub"><span className="live-badge"><i />Live</span> {money(m.stake)} {t("entry")}</div></div>
          <div className="right">{money(m.stake * 2)}</div>
        </div>
      ))}

      <div className="section-title">{t("open_to_join")}</div>
      {open.length === 0 && <p className="muted">{t("none")}</p>}
      {open.map((m, i) => (
        <div className="lrow" key={m.id}>
          <span className="av" style={av(m.playerA, i)}>{m.playerA.charAt(0)}</span>
          <div className="grow"><div className="names">{m.playerA}</div><div className="sub">{money(m.stake)} {t("entry")}</div></div>
          <button className="btn ghost" onClick={() => join(m)}>{t("join")}</button>
        </div>
      ))}

      <div className="section-title">{t("recent_results")}</div>
      {recent.length === 0 && <p className="muted">{t("none")}</p>}
      {recent.map((r) => (
        <div className="lrow" key={r.id}>
          <span className="av" style={{ background: "linear-gradient(145deg,#FFC94D,#FF9E3D)" }}>🏆</span>
          <div className="grow"><div className="names">{r.winner} beat {r.loser}</div><div className="sub">{money(r.stake)} {t("entry")}</div></div>
          <div className="right pos">+{money(r.payout)}</div>
        </div>
      ))}
    </>
  );
}
