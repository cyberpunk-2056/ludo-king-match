import React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, greenGradient } from "./theme";
import { useApp } from "./state";

export function Btn({ title, onPress, variant = "accent", disabled, style }: {
  title: string; onPress: () => void; variant?: "accent" | "green" | "ghost"; disabled?: boolean; style?: ViewStyle;
}) {
  const { colors } = useApp();
  const content = (
    <Text style={{ color: variant === "ghost" ? colors.fg : "#fff", fontWeight: "700", fontSize: 15 }}>{title}</Text>
  );
  if (variant === "ghost") {
    return (
      <Pressable onPress={onPress} disabled={disabled}
        style={[{ backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", opacity: disabled ? 0.5 : 1 }, style]}>
        {content}
      </Pressable>
    );
  }
  const cols = (variant === "green" ? greenGradient : gradient) as unknown as string[];
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ borderRadius: 14, overflow: "hidden", opacity: disabled ? 0.5 : 1 }, style]}>
      <LinearGradient colors={cols} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ paddingVertical: 14, alignItems: "center" }}>
        {content}
      </LinearGradient>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useApp();
  return <View style={[{ backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 18, padding: 18 }, style]}>{children}</View>;
}

export function Field({ label, value, onChangeText, secure, keyboardType }: {
  label: string; value: string; onChangeText: (s: string) => void; secure?: boolean; keyboardType?: "default" | "phone-pad" | "email-address" | "numeric";
}) {
  const { colors } = useApp();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.fgDim, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} secureTextEntry={secure} keyboardType={keyboardType ?? "default"}
        placeholderTextColor={colors.muted} autoCapitalize="none"
        style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.fg, fontSize: 15, fontWeight: "600" }} />
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</Text>;
}

export function Tile({ k, v, color }: { k: string; v: string; color?: string }) {
  const { colors } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 13, alignItems: "center" }}>
      <Text style={{ color: color ?? colors.fg, fontWeight: "800", fontSize: 18 }}>{v}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 }}>{k}</Text>
    </View>
  );
}

export function Spinner() {
  const { colors } = useApp();
  return <ActivityIndicator color={colors.violet} />;
}

/** Original, generic four-colour Ludo-style board (coloured squares + gradient centre). */
export function Board() {
  const { colors } = useApp();
  const sq = (bg: string) => ({ flex: 1, margin: 3, borderRadius: 10, backgroundColor: bg });
  return (
    <View style={{ aspectRatio: 1, width: "66%", alignSelf: "center", backgroundColor: colors.surface2, borderRadius: 18, padding: 7, marginVertical: 16 }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={sq("#FF5A6A")} /><View style={sq(colors.surface)} /><View style={sq("#32D583")} />
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={sq(colors.surface)} />
        <LinearGradient colors={["#FF5A6A", "#FFC94D", "#4B9BFF"]} style={{ flex: 1, margin: 3, borderRadius: 10 }} />
        <View style={sq(colors.surface)} />
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={sq("#4B9BFF")} /><View style={sq(colors.surface)} /><View style={sq("#FFC94D")} />
      </View>
    </View>
  );
}
