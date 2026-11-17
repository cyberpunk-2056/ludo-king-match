import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../../src/state";
import { Btn, Board, Card } from "../../src/ui";

export default function Home() {
  const { colors, t } = useApp();
  const router = useRouter();
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card style={{ alignItems: "center" }}>
        <Text style={{ color: colors.violet, fontWeight: "700", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{t("appName")}</Text>
        <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 30, textAlign: "center", marginTop: 8 }}>{t("hero_h")}</Text>
        <Text style={{ color: colors.fgDim, textAlign: "center", marginTop: 10 }}>{t("hero_s")}</Text>
        <Board />
        <Btn title={t("play_a_match")} onPress={() => router.push("/(tabs)/play")} style={{ alignSelf: "stretch" }} />
        <Btn title={t("add_money")} variant="ghost" onPress={() => router.push("/deposit")} style={{ alignSelf: "stretch", marginTop: 10 }} />
      </Card>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        {[["128K", "Players", colors.violet], ["₹4.2M", "Paid", colors.green], ["36K", "Today", colors.blue]].map(([v, k, c]) => (
          <View key={k as string} style={{ flex: 1, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: "center" }}>
            <Text style={{ color: c as string, fontWeight: "800", fontSize: 22 }}>{v}</Text>
            <Text style={{ color: colors.fgDim, fontSize: 12, marginTop: 2 }}>{k}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
