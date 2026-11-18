import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { api, money, type Tx, type Wallet as W } from "../../src/api";
import { useApp } from "../../src/state";
import { Btn, Card } from "../../src/ui";

export default function Wallet() {
  const { colors, t } = useApp();
  const router = useRouter();
  const [wallet, setWallet] = useState<W | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setWallet(await api.wallet()); setTx(await api.transactions(50)); }
      catch (e: any) { setErr(e.message); }
    })();
  }, []);

  const total = wallet ? wallet.deposit + wallet.winnings : 0;
  const cur = wallet?.currency ?? "₹";

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "800", marginBottom: 14 }}>{t("nav_wallet")}</Text>

      <LinearGradient colors={["#1f2750", "#121634"] as readonly [string, string]} style={{ borderRadius: 22, padding: 22 }}>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" }}>{t("w_total")}</Text>
        <Text style={{ color: "#fff", fontSize: 40, fontWeight: "800" }}>{money(total, cur)}</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 13 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700" }}>{t("w_dep")}</Text>
            <Text style={{ color: colors.blue, fontSize: 20, fontWeight: "700" }}>{money(wallet?.deposit ?? 0, cur)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 13 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700" }}>{t("w_win")}</Text>
            <Text style={{ color: colors.green, fontSize: 20, fontWeight: "700" }}>{money(wallet?.winnings ?? 0, cur)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <Btn title={t("add_money")} variant="green" onPress={() => router.push("/deposit")} style={{ flex: 1 }} />
        <Btn title={t("withdraw")} variant="ghost" onPress={() => router.push("/withdraw")} style={{ flex: 1 }} />
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={{ color: colors.fg, fontWeight: "700", fontSize: 16 }}>{t("recent")}</Text>
        {err && <Text style={{ color: colors.red, marginTop: 8 }}>{err}</Text>}
        {tx.length === 0 && !err && <Text style={{ color: colors.fgDim, marginTop: 8 }}>{t("none")}</Text>}
        {tx.map((x) => (
          <View key={x.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomColor: colors.line, borderBottomWidth: 1 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.fg, fontWeight: "700", fontSize: 14 }}>{x.type.charAt(0).toUpperCase() + x.type.slice(1)}</Text>
              {x.note ? <Text style={{ color: colors.muted, fontSize: 12 }}>{x.note}</Text> : null}
            </View>
            <Text style={{ color: x.amount >= 0 ? colors.green : colors.red, fontWeight: "800" }}>{x.amount >= 0 ? "+" : ""}{money(x.amount, cur)}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
