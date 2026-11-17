import { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { api, setToken } from "../src/api";
import { useApp } from "../src/state";
import { Btn, Field } from "../src/ui";

export default function Auth() {
  const { colors, t, lang, setLang, setUser } = useApp();
  const router = useRouter();
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
      await setToken(res.token);
      setUser(res.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: colors.bg }}>
      <Pressable onPress={() => setLang(lang === "en" ? "hi" : "en")} style={{ alignSelf: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.violet, fontWeight: "700" }}>{lang === "en" ? "हिं" : "EN"}</Text>
      </Pressable>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.violet, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>♛</Text>
      </View>
      <Text style={{ color: colors.fg, fontSize: 25, fontWeight: "800", textAlign: "center", marginTop: 14 }}>{signup ? t("signup_h") : t("login_h")}</Text>
      <Text style={{ color: colors.fgDim, fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 18 }}>{signup ? t("signup_s") : t("login_s")}</Text>

      {signup && <Field label={t("f_name")} value={name} onChangeText={setName} />}
      <Field label={t("f_phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {signup && <Field label={t("f_email")} value={email} onChangeText={setEmail} keyboardType="email-address" />}
      <Field label={t("f_pass")} value={pass} onChangeText={setPass} secure />

      {err && <Text style={{ color: colors.red, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>{err}</Text>}
      <Btn title={busy ? "…" : signup ? t("signup_btn") : t("login_btn")} onPress={submit} disabled={busy} style={{ marginTop: 6 }} />
      <Pressable onPress={() => { setSignup(!signup); setErr(null); }} style={{ marginTop: 16, alignItems: "center" }}>
        <Text style={{ color: colors.violet, fontWeight: "700" }}>{signup ? t("to_login") : t("to_signup")}</Text>
      </Pressable>
      <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>{t("legal18")}</Text>
    </ScrollView>
  );
}
