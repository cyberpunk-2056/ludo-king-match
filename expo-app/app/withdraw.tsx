import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, money, type UpiAccount, type Wallet as W } from "../src/api";
import { useApp } from "../src/state";
import { Btn, Card, Label } from "../src/ui";

export default function Withdraw() {
  const { colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    if (amt < 10) return setErr("Minimum withdrawal is ₹10.");
    if (amt > total + 0.001) return setErr("Amount exceeds your balance.");
    if (!def) return setErr("Add a verified UPI account first.");
    setBusy(true);
    try {
      await api.withdraw({ amount: amt, upiId: def.vpa });
      Alert.alert(t("wd_submitted_t"), t("wd_submitted_b"), [{ text: t("ok"), onPress: () => router.back() }]);
    }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: colors.fgDim, fontWeight: "700" }}>← {t("back")}</Text></Pressable>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "800", marginVertical: 14 }}>{t("withdraw")}</Text>
      <Card>
        <Label>{t("w_total")}</Label>
        <Text style={{ color: colors.green, fontSize: 28, fontWeight: "800" }}>{money(total)}</Text>

        <View style={{ marginTop: 14 }}><Label>{t("amount")}</Label></View>
        <TextInput value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric"
          style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 6 }} />

        <View style={{ marginTop: 14 }}><Label>Pay out to</Label></View>
        {def ? (
          <Text style={{ color: colors.fg, fontWeight: "700", marginTop: 4 }}>{def.vpa} · {def.name} ✓</Text>
        ) : (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            <TextInput value={newVpa} onChangeText={setNewVpa} placeholder="name@bank" placeholderTextColor={colors.muted}
              style={{ flex: 1, backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.fg }} />
            <Btn title="Verify" onPress={addUpi} style={{ paddingHorizontal: 16 }} />
          </View>
        )}
        {err && <Text style={{ color: colors.red, marginTop: 8, fontWeight: "700" }}>{err}</Text>}
        <Btn title={t("confirm_wd")} onPress={send} disabled={busy || amt < 10 || !def} style={{ marginTop: 14 }} />
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>{t("wd_rule")}</Text>
      </Card>
    </ScrollView>
  );
}
