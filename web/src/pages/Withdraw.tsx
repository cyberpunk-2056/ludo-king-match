import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money, type UpiAccount, type Wallet as W } from "../api";
import { useApp } from "../app-state";

export function Withdraw() {
  const { t } = useApp();
  const nav = useNavigate();
  const [wallet, setWallet] = useState<W | null>(null);
  const [upis, setUpis] = useState<UpiAccount[]>([]);
  const [amount, setAmount] = useState("20");
  const [newVpa, setNewVpa] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setWallet(await api.wallet());
    try { setUpis(await api.payoutMethods()); } catch { setUpis([]); }
  }
  useEffect(() => { load(); }, []);

  const total = wallet ? wallet.deposit + wallet.winnings : 0;
  const def = upis.find((u) => u.is_default) ?? upis[0] ?? null;
  const amt = parseFloat(amount) || 0;

  async function addUpi() {
    setErr(null);
    if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(newVpa.trim())) return setErr("Enter a valid UPI ID, like name@bank.");
    try { await api.verifyUpi(newVpa.trim()); setNewVpa(""); load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function send() {
    setErr(null);
    if (amt < 10) return setErr("Minimum withdrawal is $10.");
    if (amt > total + 0.001) return setErr("Amount exceeds your balance.");
    if (!def) return setErr("Add a verified UPI account first.");
    setBusy(true);
    try { await api.withdraw({ amount: amt, upiId: def.vpa }); nav("/wallet"); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <>
      <button className="back-btn" onClick={() => nav("/wallet")}>← {t("nav_wallet")}</button>
      <h1 className="page-title">{t("withdraw")}</h1>
      <div className="card">
        <div className="label">{t("w_total")}</div>
        <div className="num" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 28, color: "var(--green)" }}>{money(total)}</div>

        <div className="label" style={{ marginTop: 14 }}>{t("amount")}</div>
        <input className="input" style={{ marginTop: 6 }} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />

        <div className="label" style={{ marginTop: 14 }}>Pay out to</div>
        {def ? (
          <div style={{ fontWeight: 700, marginTop: 4 }}>{def.vpa} · {def.name} ✓</div>
        ) : (
          <div className="row" style={{ marginTop: 6 }}>
            <input className="input grow" placeholder="name@bank" value={newVpa} onChange={(e) => setNewVpa(e.target.value)} />
            <button className="btn" onClick={addUpi}>Verify</button>
          </div>
        )}

        {err && <div className="err">{err}</div>}
        <button className="btn block" style={{ marginTop: 14 }} disabled={busy || amt < 10 || !def} onClick={send}>{t("confirm_wd")}</button>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("wd_rule")}</p>
      </div>
    </>
  );
}
