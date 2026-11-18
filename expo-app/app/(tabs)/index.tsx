import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../src/state";
import { Btn, Board, Card, WinnersTicker } from "../../src/ui";

const LEADERS = [
  { r: 1, name: "RollRoyce", rating: "1,920", won: "₹48,200" },
  { r: 2, name: "SixOnSix", rating: "1,885", won: "₹41,050" },
  { r: 3, name: "Nova_Dice", rating: "1,842", won: "₹33,400" },
  { r: 4, name: "Arjun_92", rating: "1,806", won: "₹28,900" },
  { r: 5, name: "KashFlow", rating: "1,771", won: "₹24,150" },
];

export default function Home() {
  const { colors, t } = useApp();
  const router = useRouter();

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      {/* hero */}
      <Card style={{ alignItems: "center", overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: colors.isDark ? "rgba(255,197,61,0.14)" : "rgba(201,138,0,0.12)", borderColor: colors.gold, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold }} />
          <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>{t("ranked")}</Text>
        </View>
        <Text style={{ color: colors.fg, fontWeight: "900", fontSize: 30, textAlign: "center", marginTop: 12, textTransform: "uppercase", letterSpacing: 0.3, lineHeight: 34 }}>{t("hero_h")}</Text>
        <Text style={{ color: colors.fgDim, textAlign: "center", marginTop: 10, fontSize: 14 }}>{t("hero_s")}</Text>
        <Board />
        <Btn title={t("play_a_match")} onPress={() => router.push("/(tabs)/play")} style={{ alignSelf: "stretch" }} />
        <Btn title={t("add_money")} variant="gold" onPress={() => router.push("/deposit")} style={{ alignSelf: "stretch", marginTop: 10 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 16 }}>
          <Trust icon="⚡" label={t("trust1")} c={colors.fgDim} />
          <Trust icon="🛡" label={t("trust2")} c={colors.fgDim} />
          <Trust icon="🏆" label={t("trust3")} c={colors.fgDim} />
        </View>
      </Card>

      {/* recent winners ticker */}
      <View style={{ marginTop: 14 }}><WinnersTicker /></View>

      {/* season stats */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        {[["128K", t("stat_players"), colors.violet], ["₹4.2M", t("stat_paid"), colors.green], ["36K", t("stat_today"), colors.gold]].map(([v, k, c]) => (
          <View key={k as string} style={{ flex: 1, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 16, overflow: "hidden" }}>
            <LinearGradient colors={[c as string, c as string] as readonly [string, string]} style={{ height: 3 }} />
            <View style={{ padding: 14, alignItems: "center" }}>
              <Text style={{ color: c as string, fontWeight: "900", fontSize: 21 }}>{v}</Text>
              <Text style={{ color: colors.fgDim, fontSize: 11, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 }}>{k}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* leaderboard */}
      <Text style={{ color: colors.fg, fontSize: 16, fontWeight: "800", marginTop: 22, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>{t("top_players")}</Text>
      <Card style={{ paddingVertical: 6 }}>
        {LEADERS.map((p, i) => (
          <View key={p.r} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomColor: colors.line, borderBottomWidth: i < LEADERS.length - 1 ? 1 : 0 }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: p.r === 1 ? colors.gold : p.r <= 3 ? colors.violet : colors.surface2 }}>
              <Text style={{ color: p.r === 1 ? "#211603" : p.r <= 3 ? "#fff" : colors.fg, fontWeight: "900", fontSize: 14 }}>{p.r}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 14 }}>{p.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>{t("rating")} {p.rating}</Text>
            </View>
            <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 14 }}>{p.won}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function Trust({ icon, label, c }: { icon: string; label: string; c: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Text style={{ fontSize: 13 }}>{icon}</Text>
      <Text style={{ color: c, fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
