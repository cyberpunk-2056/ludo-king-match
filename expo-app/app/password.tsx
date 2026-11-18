import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../src/api";
import { useApp } from "../src/state";
import { Btn, Card, Label } from "../src/ui";

export default function ChangePassword() {
  const { colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(null);
    if (next.length < 4) return setErr(t("pw_short"));
    if (next !== confirm) return setErr(t("pw_mismatch"));
    setBusy(true);
    try {
      await api.changePassword({ currentPassword: cur, newPassword: next });
      Alert.alert(t("pw_changed_t"), t("pw_changed_b"), [{ text: t("ok"), onPress: () => router.back() }]);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  const field = (label: string, value: string, set: (s: string) => void) => (
    <View style={{ marginTop: 14 }}>
      <Label>{label}</Label>
      <TextInput value={value} onChangeText={set} secureTextEntry autoCapitalize="none"
        style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, color: colors.fg, fontSize: 16, fontWeight: "700", marginTop: 6 }} />
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: 28 }}>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: colors.fgDim, fontWeight: "800" }}>← {t("back")}</Text></Pressable>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 10, marginBottom: 14 }}>{t("change_pw")}</Text>
      <Card>
        {field(t("cur_pw"), cur, setCur)}
        {field(t("new_pw"), next, setNext)}
        {field(t("confirm_pw"), confirm, setConfirm)}
        {err && <Text style={{ color: colors.red, marginTop: 10, fontWeight: "700" }}>{err}</Text>}
        <Btn title={t("change_pw")} onPress={submit} disabled={busy || !cur || !next || !confirm} style={{ marginTop: 16 }} />
      </Card>
    </ScrollView>
  );
}
