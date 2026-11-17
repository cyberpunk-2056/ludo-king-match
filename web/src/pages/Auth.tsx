import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, tokenStore } from "../api";
import { useApp } from "../app-state";

export function Auth() {
  const { t, lang, setLang, setUser } = useApp();
  const nav = useNavigate();
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(null);
    const p = phone.replace(/\D/g, "");
    if (p.length < 10) return setErr("Enter a valid phone number.");
    if (pass.length < 4) return setErr("Password must be at least 4 characters.");
    if (signup) {
      if (name.trim().length < 2) return setErr("Enter your name.");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Enter a valid email.");
    }
    setBusy(true);
    try {
      const res = signup
        ? await api.signup({ name: name.trim(), phone: p, email: email.trim(), password: pass })
        : await api.login({ phone: p, password: pass });
      tokenStore.set(res.token);
      setUser(res.user);
      nav("/home", { replace: true });
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth">
        <button className="chip" style={{ marginBottom: 16 }} onClick={() => setLang(lang === "en" ? "hi" : "en")}>{lang === "en" ? "हिं" : "EN"}</button>
        <div className="mk">♛</div>
        <h2>{signup ? t("signup_h") : t("login_h")}</h2>
        <div className="sub">{signup ? t("signup_s") : t("login_s")}</div>

        {signup && <div className="field"><label>{t("f_name")}</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>}
        <div className="field"><label>{t("f_phone")}</label><input className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        {signup && <div className="field"><label>{t("f_email")}</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>}
        <div className="field"><label>{t("f_pass")}</label><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></div>

        {err && <div className="err">{err}</div>}
        <button className="btn lg block" style={{ marginTop: 14 }} disabled={busy} onClick={submit}>
          {busy ? "…" : signup ? t("signup_btn") : t("login_btn")}
        </button>
        <div className="switch">
          <button onClick={() => { setSignup(!signup); setErr(null); }}>{signup ? t("to_login") : t("to_signup")}</button>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 16 }}>{t("legal18")}</p>
      </div>
    </div>
  );
}
