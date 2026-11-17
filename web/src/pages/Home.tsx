import { useNavigate } from "react-router-dom";
import { Board } from "../components";
import { useApp } from "../app-state";

export function Home() {
  const { t } = useApp();
  const nav = useNavigate();
  return (
    <>
      <div className="card" style={{ marginTop: 16, textAlign: "center" }}>
        <span className="label" style={{ color: "var(--violet)" }}>{t("appName")}</span>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{t("hero_h")}</h1>
        <p className="muted" style={{ marginTop: 10 }}>{t("hero_s")}</p>
        <Board />
        <button className="btn block" onClick={() => nav("/play")}>{t("play_a_match")}</button>
        <button className="btn ghost block" style={{ marginTop: 10 }} onClick={() => nav("/wallet")}>{t("add_money")}</button>
      </div>
    </>
  );
}
