import { useState } from "react";
import { Alert, ScrollView, Text, View, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, money } from "../src/api";
import { useApp } from "../src/state";
import { Btn, Card, Label } from "../src/ui";

const METHODS = [["upi", "UPI"], ["card", "Card"], ["bank", "Net banking"]];
const PRESETS = [10, 25, 50, 100, 250];

export default function Deposit() {
  const { colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("50");
  const [method, setMethod] = useState("upi");
  const [instrument, setInstrument] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const amt = parseFloat(amount) || 0;

  async function pay() {
    setErr(null);
    if (amt < 5) return setErr("Minimum deposit is ₹5.");
    setBusy(true);
    try {
      await api.deposit({ amount: amt, method, instrument });
      Alert.alert(t("dep_submitted_t"), t("dep_submitted_b"), [{ text: t("ok"), onPress: () => router.back() }]);
    }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: colors.fgDim, fontWeight: "700" }}>← {t("back")}</Text></Pressable>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "800", marginVertical: 14 }}>{t("add_money")}</Text>
      <Card>
        <Label>{t("amount")}</Label>
        <TextInput value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric"
          style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 6 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {PRESETS.map((v) => (
            <Pressable key={v} onPress={() => setAmount(String(v))} style={{ backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ color: colors.fgDim, fontWeight: "700" }}>₹{v}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 18 }}><Label>{t("method")}</Label></View>
        {METHODS.map(([id, label]) => (
          <Pressable key={id} onPress={() => setMethod(id)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: method === id ? colors.violet : colors.line, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              {method === id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.violet }} />}
            </View>
            <Text style={{ color: colors.fg, fontWeight: "700" }}>{label}</Text>
          </Pressable>
        ))}
        {method !== "bank" && (
          <TextInput value={instrument} onChangeText={setInstrument} placeholder={method === "upi" ? "Your UPI ID" : "Card number"} placeholderTextColor={colors.muted}
            style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.fg, marginTop: 6 }} />
        )}
        {err && <Text style={{ color: colors.red, marginTop: 8, fontWeight: "700" }}>{err}</Text>}
        <Btn title={`${t("pay")} ${money(amt)}`} variant="green" onPress={pay} disabled={busy || amt < 5} style={{ marginTop: 14 }} />
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>{t("dep_rule")}</Text>
      </Card>
    </ScrollView>
  );
}
