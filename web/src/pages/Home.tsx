import { useNavigate } from "react-router-dom";
import { Board } from "../components";
import { useApp } from "../app-state";

export function Home() {
  const { t } = useApp();
  const nav = useNavigate();
  return (
    <>
      <div className="hero">
        <span className="eyebrow">{t("appName")}</span>
        <h1>{t("hero_h")}</h1>
        <p>{t("hero_s")}</p>
        <Board />
        <button className="btn lg block" onClick={() => nav("/play")}>{t("play_a_match")}</button>
        <button className="btn ghost block" style={{ marginTop: 10 }} onClick={() => nav("/wallet")}>{t("add_money")}</button>
      </div>
      <div className="stat-row">
        <div className="stat"><div className="n" style={{ color: "var(--violet)" }}>128K</div><div className="c">Players</div></div>
        <div className="stat"><div className="n" style={{ color: "var(--green)" }}>$4.2M</div><div className="c">Paid</div></div>
        <div className="stat"><div className="n" style={{ color: "var(--blue)" }}>36K</div><div className="c">Today</div></div>
      </div>
    </>
  );
}
