import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { money } from "../../src/api";
import { useApp } from "../../src/state";
import { Btn, Card, Tile } from "../../src/ui";

export default function Profile() {
  const { colors, t, user, logout, startTour } = useApp();
  const router = useRouter();
  if (!user) return null;
  const s = user.stats;
  const tail = user.phone.length >= 4 ? "•••• " + user.phone.slice(-4) : "—";

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "800", marginBottom: 14 }}>{t("profile")}</Text>

      <Card style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.violet, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 24 }}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 18 }}>{user.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{tail} · since {user.joined}</Text>
        </View>
        <Text style={{ color: colors.violet, fontWeight: "700" }}>★ {user.rating}</Text>
      </Card>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Tile k={t("played")} v={String(s.played)} />
        <Tile k={t("wins")} v={String(s.wins)} color={colors.green} />
        <Tile k={t("win_rate")} v={`${s.played ? Math.round((s.wins / s.played) * 100) : 0}%`} color={colors.violet} />
        <Tile k={t("total_won")} v={money(s.total_won)} color={colors.yellow} />
      </View>

      <Btn title={`🎁 ${t("refer")}`} variant="ghost" onPress={() => router.push("/refer")} style={{ marginTop: 14 }} />
      <Btn title={`📜 ${t("rules_policies")}`} variant="ghost" onPress={() => router.push("/rules")} style={{ marginTop: 10 }} />
      <Btn title={`🧭 ${t("take_tour")}`} variant="ghost" onPress={startTour} style={{ marginTop: 10 }} />
      <Btn title={`💬 ${t("support")}`} variant="ghost" onPress={() => router.push("/support")} style={{ marginTop: 10 }} />
      <Btn title={t("logout")} variant="ghost" onPress={async () => { await logout(); router.replace("/auth"); }} style={{ marginTop: 10 }} />
    </ScrollView>
  );
}
