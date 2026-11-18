import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, Text, TextInput, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, greenGradient } from "./theme";
import { useApp } from "./state";

/* ---------------- Buttons ---------------- */
export function Btn({ title, onPress, variant = "accent", disabled, style }: {
  title: string; onPress: () => void; variant?: "accent" | "green" | "ghost"; disabled?: boolean; style?: ViewStyle;
}) {
  const { colors } = useApp();
  const label = <Text style={{ color: variant === "ghost" ? colors.fg : "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.2 }}>{title}</Text>;
  if (variant === "ghost") {
    return (
      <Pressable onPress={onPress} disabled={disabled}
        style={[{ backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1, borderRadius: 16, paddingVertical: 15, alignItems: "center", opacity: disabled ? 0.5 : 1 }, style]}>
        {label}
      </Pressable>
    );
  }
  const cols = (variant === "green" ? greenGradient : gradient) as readonly [string, string];
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ borderRadius: 16, overflow: "hidden", opacity: disabled ? 0.5 : 1 }, style]}>
      <LinearGradient colors={cols} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 15, alignItems: "center" }}>
        {label}
      </LinearGradient>
    </Pressable>
  );
}

/* ---------------- Surfaces ---------------- */
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useApp();
  return (
    <View style={[{
      backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 22, padding: 18,
      shadowColor: "#000", shadowOpacity: colors.isDark ? 0.4 : 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 3,
    }, style]}>{children}</View>
  );
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
        style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, color: colors.fg, fontSize: 15, fontWeight: "600" }} />
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 }}>{children}</Text>;
}

export function Tile({ k, v, color }: { k: string; v: string; color?: string }) {
  const { colors } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, alignItems: "center" }}>
      <Text style={{ color: color ?? colors.fg, fontWeight: "900", fontSize: 18 }}>{v}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 }}>{k}</Text>
    </View>
  );
}

export function Spinner() {
  const { colors } = useApp();
  return <ActivityIndicator color={colors.violet} />;
}

/* ---------------- Dice (original art) ---------------- */
const PIPS: Record<number, number[]> = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

/** A single dice face with pips, drawn from a 3x3 grid. */
export function DiceFace({ size = 64, face = 5, bg = "#fff", pip = "#10182b" }: { size?: number; face?: number; bg?: string; pip?: string }) {
  const dots = PIPS[face] ?? PIPS[5];
  const d = Math.round(size * 0.17);
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.22, backgroundColor: bg, padding: size * 0.12, flexDirection: "row", flexWrap: "wrap" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={{ width: "33.33%", height: "33.33%", alignItems: "center", justifyContent: "center" }}>
          {dots.includes(i) ? <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: pip }} /> : null}
        </View>
      ))}
    </View>
  );
}

/** Animated rolling die: spins and cycles faces. Used as the loading indicator. */
export function DiceRoll({ size = 72 }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  const [face, setFace] = useState(5);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 680, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
    );
    anim.start();
    const iv = setInterval(() => setFace((f) => (f % 6) + 1), 340);
    return () => { anim.stop(); clearInterval(iv); };
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={{ transform: [{ rotate }], shadowColor: "#8B6CFF", shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}>
      <DiceFace size={size} face={face} />
    </Animated.View>
  );
}

/** Full-screen loading with the rolling die. */
export function Loading({ text }: { text?: string }) {
  const { colors, t } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: 18 }}>
      <DiceRoll />
      <Text style={{ color: colors.fgDim, fontSize: 14, fontWeight: "700" }}>{text ?? t("loading")}</Text>
    </View>
  );
}

/* ---------------- Ludo board (original, generic) ---------------- */
export function Board() {
  const { colors } = useApp();
  const sq = (bg: string) => ({ flex: 1, margin: 3, borderRadius: 12, backgroundColor: bg });
  return (
    <View style={{ aspectRatio: 1, width: "64%", alignSelf: "center", backgroundColor: colors.surface2, borderRadius: 20, padding: 8, marginVertical: 16, borderColor: colors.line, borderWidth: 1 }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={sq("#FF5A6A")} /><View style={sq(colors.surface)} /><View style={sq("#32D583")} />
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={sq(colors.surface)} />
        <View style={{ flex: 1, margin: 3, alignItems: "center", justifyContent: "center" }}><DiceFace size={30} face={5} /></View>
        <View style={sq(colors.surface)} />
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={sq("#4B9BFF")} /><View style={sq(colors.surface)} /><View style={sq("#FFC94D")} />
      </View>
    </View>
  );
}
