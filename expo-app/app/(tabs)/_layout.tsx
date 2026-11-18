import { useEffect, useState } from "react";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Pressable, Text, View, type ColorValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, money } from "../../src/api";
import { useApp } from "../../src/state";
import { BoardMark } from "../../src/ui";
import { goldGradient } from "../../src/theme";

function Header() {
  const { colors, lang, setLang, theme, toggleTheme } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [bal, setBal] = useState<number | null>(null);
  const [cur, setCur] = useState("₹");

  // refresh the balance whenever the active tab changes
  useEffect(() => {
    let alive = true;
    api.wallet().then((w) => { if (alive) { setBal(w.deposit + w.winnings); setCur(w.currency); } }).catch(() => {});
    return () => { alive = false; };
  }, [pathname]);

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.bg, borderBottomColor: colors.line, borderBottomWidth: 1 }}>
      <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 }}>
        <BoardMark size={26} />
        <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "900", color: colors.fg, flexShrink: 1 }}>Ludo King <Text style={{ color: colors.gold }}>Maker</Text></Text>
        <View style={{ flex: 1 }} />

        {/* live wallet balance chip */}
        <Pressable onPress={() => router.push("/wallet")} style={{ borderRadius: 999, overflow: "hidden" }}>
          <LinearGradient colors={goldGradient as readonly [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 }}>
            <Text style={{ color: "#211603", fontWeight: "900", fontSize: 13.5 }}>{bal == null ? "…" : money(bal, cur)}</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => router.push("/deposit")} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.violet, fontSize: 18, fontWeight: "800", marginTop: -2 }}>+</Text>
        </Pressable>

        <Pressable onPress={() => setLang(lang === "en" ? "hi" : "en")}><Text style={{ color: colors.fgDim, fontWeight: "700", fontSize: 12 }}>{lang === "en" ? "हिं" : "EN"}</Text></Pressable>
        <Pressable onPress={toggleTheme}><Text style={{ color: theme === "dark" ? colors.yellow : colors.indigo, fontSize: 16 }}>{theme === "dark" ? "☀" : "☾"}</Text></Pressable>
      </View>
    </View>
  );
}

function tabIcon(emoji: string, color: ColorValue, focused: boolean) {
  return <Text style={{ fontSize: 26, color, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { colors, t } = useApp();
  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.line, height: 66, paddingBottom: 10, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav_home"), tabBarIcon: ({ color, focused }) => tabIcon("🏠", color, focused) }} />
      <Tabs.Screen name="play" options={{ title: t("nav_play"), tabBarIcon: ({ color, focused }) => tabIcon("🎲", color, focused) }} />
      <Tabs.Screen name="wallet" options={{ title: t("nav_wallet"), tabBarIcon: ({ color, focused }) => tabIcon("👛", color, focused) }} />
      <Tabs.Screen name="profile" options={{ title: t("nav_profile"), tabBarIcon: ({ color, focused }) => tabIcon("👤", color, focused) }} />
    </Tabs>
  );
}
