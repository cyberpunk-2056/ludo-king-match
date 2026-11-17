import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "../api";
import { useApp } from "../app-state";

const METHODS = [["upi", "UPI"], ["card", "Card"], ["bank", "Net banking"]];
const PRESETS = [10, 25, 50, 100, 250];

export function Deposit() {
  const { t } = useApp();
  const nav = useNavigate();
  const [amount, setAmount] = useState("50");
  const [method, setMethod] = useState("upi");
  const [instrument, setInstrument] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const amt = parseFloat(amount) || 0;

  async function pay() {
    setErr(null);
    if (amt < 5) return setErr("Minimum deposit is $5.");
    setBusy(true);
    try {
      await api.deposit({ amount: amt, method, instrument });
      nav("/wallet");
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <>
      <button className="back-btn" onClick={() => nav("/wallet")}>← {t("nav_wallet")}</button>
      <h1 className="page-title">{t("add_money")}</h1>
      <div className="card">
        <div className="label">{t("amount")}</div>
        <input className="input" style={{ marginTop: 6 }} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
        <div className="row" style={{ flexWrap: "wrap", marginTop: 10 }}>
          {PRESETS.map((v) => <button key={v} className="btn ghost" style={{ padding: "8px 14px" }} onClick={() => setAmount(String(v))}>${v}</button>)}
        </div>
        <div className="label" style={{ marginTop: 18 }}>{t("method")}</div>
        {METHODS.map(([id, label]) => (
          <label key={id} className="row" style={{ alignItems: "center", padding: "8px 0" }}>
            <input type="radio" name="m" checked={method === id} onChange={() => setMethod(id)} />
            <span style={{ fontWeight: 700 }}>{label}</span>
          </label>
        ))}
        {method !== "bank" && (
          <input className="input" style={{ marginTop: 6 }} placeholder={method === "upi" ? "Your UPI ID" : "Card number"} value={instrument} onChange={(e) => setInstrument(e.target.value)} />
        )}
        {err && <div className="err">{err}</div>}
        <button className="btn green block" style={{ marginTop: 14 }} disabled={busy || amt < 5} onClick={pay}>{t("pay")} {money(amt)}</button>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("dep_rule")}</p>
      </div>
    </>
  );
}
