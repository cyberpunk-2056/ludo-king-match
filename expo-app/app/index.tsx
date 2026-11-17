import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useApp } from "../src/state";

export default function Index() {
  const { ready, user, colors } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.violet} size="large" />
      </View>
    );
  }
  return <Redirect href={user ? "/(tabs)" : "/auth"} />;
}
