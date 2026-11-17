import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../../src/state";

function Header() {
  const { colors, lang, setLang, theme, toggleTheme } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.bg, borderBottomColor: colors.line, borderBottomWidth: 1 }}>
      <View style={{ height: 52, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.fg }}>Ludo<Text style={{ color: colors.violet }}>ra</Text></Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setLang(lang === "en" ? "hi" : "en")} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: colors.fgDim, fontWeight: "700", fontSize: 13 }}>{lang === "en" ? "हिं" : "EN"}</Text>
        </Pressable>
        <Pressable onPress={toggleTheme} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: theme === "dark" ? colors.yellow : colors.indigo, fontSize: 16 }}>{theme === "dark" ? "☀" : "☾"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function icon(emoji: string, color: string) {
  return <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { colors, t } = useApp();
  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav_home"), tabBarIcon: ({ color }) => icon("🏠", color) }} />
      <Tabs.Screen name="play" options={{ title: t("nav_play"), tabBarIcon: ({ color }) => icon("🎲", color) }} />
      <Tabs.Screen name="wallet" options={{ title: t("nav_wallet"), tabBarIcon: ({ color }) => icon("👛", color) }} />
      <Tabs.Screen name="profile" options={{ title: t("nav_profile"), tabBarIcon: ({ color }) => icon("👤", color) }} />
    </Tabs>
  );
}
