import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money, type Tx, type Wallet as W } from "../api";
import { useApp } from "../app-state";

export function Wallet() {
  const { t } = useApp();
  const nav = useNavigate();
  const [wallet, setWallet] = useState<W | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setWallet(await api.wallet());
        setTx(await api.transactions(50));
      } catch (e: any) { setErr(e.message); }
    })();
  }, []);

  const total = wallet ? wallet.deposit + wallet.winnings : 0;
  const cur = wallet?.currency ?? "$";

  return (
    <>
      <h1 className="page-title">{t("nav_wallet")}</h1>
      <div className="wallet-hero">
        <div className="label" style={{ color: "rgba(255,255,255,.7)" }}>{t("w_total")}</div>
        <div className="big num">{money(total, cur)}</div>
        <div className="wsplit">
          <div><div className="label" style={{ color: "rgba(255,255,255,.7)" }}>{t("w_dep")}</div><div className="v num" style={{ color: "var(--blue)" }}>{money(wallet?.deposit ?? 0, cur)}</div></div>
          <div><div className="label" style={{ color: "rgba(255,255,255,.7)" }}>{t("w_win")}</div><div className="v num" style={{ color: "var(--green)" }}>{money(wallet?.winnings ?? 0, cur)}</div></div>
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn green grow" onClick={() => nav("/deposit")}>{t("add_money")}</button>
        <button className="btn ghost grow" onClick={() => nav("/withdraw")}>{t("withdraw")}</button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 16 }}>{t("recent")}</h3>
        {err && <div className="err">{err}</div>}
        {tx.length === 0 && !err && <p className="muted" style={{ marginTop: 8 }}>{t("none")}</p>}
        {tx.map((x) => (
          <div className="tx" key={x.id}>
            <div><div className="t">{x.type.charAt(0).toUpperCase() + x.type.slice(1)}</div>{x.note && <div className="s">{x.note}</div>}</div>
            <div className={"a " + (x.amount >= 0 ? "pos" : "neg")}>{x.amount >= 0 ? "+" : ""}{money(x.amount, cur)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
