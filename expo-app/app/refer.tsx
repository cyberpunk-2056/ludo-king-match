import { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { api, money, type Referral } from "../src/api";
import { useApp } from "../src/state";
import { Card, Tile } from "../src/ui";

export default function Refer() {
  const { colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ref, setRef] = useState<Referral | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.referral().then(setRef).catch((e) => setErr(e.message));
  }, []);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: colors.fgDim, fontWeight: "700" }}>← {t("back")}</Text></Pressable>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "800", marginVertical: 14 }}>{t("refer")}</Text>

      <LinearGradient colors={["#2457E6", "#0a1a4d"] as readonly [string, string]} style={{ borderRadius: 22, padding: 22, alignItems: "center" }}>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" }}>{t("refer_s")}</Text>
        <Text style={{ color: "#FFC53D", fontSize: 34, fontWeight: "800", marginTop: 6 }}>{money(ref?.earnings ?? 0)}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 13, paddingHorizontal: 16, paddingVertical: 12, marginTop: 14 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 2 }}>{ref?.code ?? "……"}</Text>
        </View>
      </LinearGradient>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Tile k="Friends" v={String(ref?.friends.length ?? 0)} color={colors.violet} />
        <Tile k="Their winnings" v={money(ref?.winnings_base ?? 0)} color={colors.blue} />
        <Tile k="Commission" v="3%" color={colors.green} />
      </View>

      {err && <Text style={{ color: colors.red, marginTop: 12 }}>{err}</Text>}

      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: colors.fg, fontWeight: "700", fontSize: 16, marginBottom: 6 }}>Your referred friends</Text>
        {(!ref || ref.friends.length === 0) && <Text style={{ color: colors.fgDim }}>{t("none")}</Text>}
        {ref?.friends.map((f, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomColor: colors.line, borderBottomWidth: 1 }}>
            <Text style={{ color: colors.fg, fontWeight: "700", flex: 1 }}>{f.name}</Text>
            <Text style={{ color: colors.green, fontWeight: "800" }}>+{money(f.winnings * 0.03)}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
