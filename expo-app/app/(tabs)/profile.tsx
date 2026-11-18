import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, Text, UIManager, View } from "react-native";
import { useRouter } from "expo-router";
import { money } from "../../src/api";
import { useApp } from "../../src/state";
import { Btn, Card, DiceFace, Goti, Tile } from "../../src/ui";
import { GUIDES } from "../../src/guides";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LUDO = ["#FF5B6E", "#2BD98A", "#4C84FF", "#FFC53D"];

export default function Profile() {
  const { colors, t, lang, user, logout, startTour } = useApp();
  const router = useRouter();
  const [openKey, setOpenKey] = useState<number | null>(null);
  if (!user) return null;
  const s = user.stats;
  const tail = user.phone.length >= 4 ? "•••• " + user.phone.slice(-4) : "—";
  const guides = GUIDES[lang] ?? GUIDES.en;

  function toggle(i: number) {
    LayoutAnimation.configureNext(LayoutAnimation.create(180, "easeInEaseOut", "opacity"));
    setOpenKey((k) => (k === i ? null : i));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GamerBackdrop />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "900", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.3 }}>{t("profile")}</Text>

        <Card style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.violet, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 24 }}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
            <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 18 }} numberOfLines={1}>{user.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>{tail} · since {user.joined}</Text>
          </View>
          <Text style={{ color: colors.gold, fontWeight: "800" }}>★ {user.rating}</Text>
        </Card>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Tile k={t("played")} v={String(s.played)} />
          <Tile k={t("wins")} v={String(s.wins)} color={colors.green} />
          <Tile k={t("win_rate")} v={`${s.played ? Math.round((s.wins / s.played) * 100) : 0}%`} color={colors.violet} />
          <Tile k={t("total_won")} v={money(s.total_won)} color={colors.gold} />
        </View>

        {/* quick actions */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Btn title={`🎁 ${t("refer")}`} variant="ghost" onPress={() => router.push("/refer")} style={{ flex: 1 }} />
          <Btn title={`🧭 ${t("take_tour")}`} variant="ghost" onPress={startTour} style={{ flex: 1 }} />
        </View>

        {/* help & guides — separate expandable sections */}
        <Text style={{ color: colors.fg, fontSize: 16, fontWeight: "800", marginTop: 22, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>{t("rules_policies")}</Text>
        {guides.map((g, i) => {
          const open = openKey === i;
          return (
            <View key={i} style={{ backgroundColor: colors.surface, borderColor: open ? colors.violet : colors.line, borderWidth: 1, borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
              <Pressable onPress={() => toggle(i)} style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 17 }}>{g.icon}</Text>
                </View>
                <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 14, flex: 1, marginLeft: 12 }}>{g.title}</Text>
                <Text style={{ color: open ? colors.violet : colors.muted, fontSize: 18, fontWeight: "800", transform: [{ rotate: open ? "90deg" : "0deg" }] }}>›</Text>
              </Pressable>
              {open && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 }}>
                  {g.items.map((it, j) => (
                    <View key={j} style={{ flexDirection: "row", gap: 9, marginTop: j === 0 ? 0 : 9 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold, marginTop: 7 }} />
                      <Text style={{ color: colors.fgDim, fontSize: 13.5, lineHeight: 20, flex: 1 }}>{it}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Btn title={`💬 ${t("support")}`} variant="ghost" onPress={() => router.push("/support")} style={{ marginTop: 10 }} />
        <Btn title={t("logout")} variant="ghost" onPress={async () => { await logout(); router.replace("/auth"); }} style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );
}

/** Faint dice + Ludo tokens scattered behind the profile for a gamer feel. */
function GamerBackdrop() {
  const { colors } = useApp();
  const op = colors.isDark ? 0.07 : 0.05;
  const pip = colors.isDark ? "#8fa6d8" : "#4a5f94";
  const bg = colors.isDark ? "#223052" : "#cbd6ef";
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: op }}>
      <View style={{ position: "absolute", top: 70, right: 18, transform: [{ rotate: "14deg" }] }}><DiceFace size={74} face={5} bg={bg} pip={pip} /></View>
      <View style={{ position: "absolute", top: 230, left: -10, transform: [{ rotate: "-18deg" }] }}><DiceFace size={92} face={3} bg={bg} pip={pip} /></View>
      <View style={{ position: "absolute", top: 460, right: -6, transform: [{ rotate: "-10deg" }] }}><DiceFace size={60} face={6} bg={bg} pip={pip} /></View>
      <View style={{ position: "absolute", top: 150, left: 40 }}><Goti size={40} color={LUDO[0]} /></View>
      <View style={{ position: "absolute", top: 380, right: 60 }}><Goti size={52} color={LUDO[1]} /></View>
      <View style={{ position: "absolute", top: 560, left: 30 }}><Goti size={44} color={LUDO[2]} /></View>
      <View style={{ position: "absolute", top: 650, right: 40 }}><Goti size={48} color={LUDO[3]} /></View>
      <View style={{ position: "absolute", top: 320, left: 150 }}><Goti size={34} color={LUDO[3]} /></View>
    </View>
  );
}
