import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Easing, Pressable, Text, TextInput, View, ViewStyle, TextStyle } from "react-native";
import Svg, { Rect, Circle, Polygon } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, greenGradient, goldGradient } from "./theme";
import { useApp } from "./state";

/* ---------------- Buttons ---------------- */
export function Btn({ title, onPress, variant = "accent", disabled, style }: {
  title: string; onPress: () => void; variant?: "accent" | "green" | "gold" | "ghost"; disabled?: boolean; style?: ViewStyle;
}) {
  const { colors } = useApp();
  const labelColor = variant === "ghost" ? colors.fg : variant === "gold" ? "#211603" : "#fff";
  const label = <Text style={{ color: labelColor, fontWeight: "800", fontSize: 15, letterSpacing: 0.3, textTransform: "uppercase" }}>{title}</Text>;
  if (variant === "ghost") {
    return (
      <Pressable onPress={onPress} disabled={disabled}
        style={[{ backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1, borderRadius: 14, paddingVertical: 15, alignItems: "center", opacity: disabled ? 0.5 : 1 }, style]}>
        {label}
      </Pressable>
    );
  }
  const cols = (variant === "green" ? greenGradient : variant === "gold" ? goldGradient : gradient) as readonly [string, string];
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ borderRadius: 14, overflow: "hidden", opacity: disabled ? 0.5 : 1 }, style]}>
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

export function Label({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const { colors } = useApp();
  return <Text style={[{ color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 }, style]}>{children}</Text>;
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

/** A Ludo token (goti): a ball on a rounded base. Decorative. */
export function Goti({ size = 28, color = "#FF5B6E" }: { size?: number; color?: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size * 0.62, height: size * 0.62, borderRadius: size * 0.31, backgroundColor: color }} />
      <View style={{ width: size, height: size * 0.34, borderRadius: size * 0.17, backgroundColor: color, marginTop: -size * 0.12 }} />
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
    <Animated.View style={{ transform: [{ rotate }], shadowColor: "#4C84FF", shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}>
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

/* ---------------- Winners ticker (auto-scrolling marquee) ---------------- */
const WINNERS = [
  { name: "RollRoyce", amt: "₹950" }, { name: "Nova_Dice", amt: "₹380" },
  { name: "KashFlow", amt: "₹190" }, { name: "SixOnSix", amt: "₹1,900" },
  { name: "Arjun_92", amt: "₹760" }, { name: "MiraPlays", amt: "₹95" },
];

export function WinnersTicker() {
  const { colors } = useApp();
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    if (w <= 0) return;
    x.setValue(0);
    const anim = Animated.loop(
      Animated.timing(x, { toValue: -w, duration: Math.max(6000, w * 16), easing: Easing.linear, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, [w]);

  const Strip = ({ measure }: { measure?: boolean }) => (
    <View style={{ flexDirection: "row" }} onLayout={measure ? (e) => setW(e.nativeEvent.layout.width) : undefined}>
      {WINNERS.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginRight: 22 }}>
          <Text style={{ color: colors.fgDim, fontSize: 12.5, fontWeight: "600" }}>🏆 <Text style={{ color: colors.fg, fontWeight: "800" }}>{it.name}</Text> won </Text>
          <Text style={{ color: colors.green, fontSize: 12.5, fontWeight: "800" }}>{it.amt}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 13, overflow: "hidden" }}>
      <View style={{ backgroundColor: colors.gold, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: "#211603", fontWeight: "900", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>🏆</Text>
      </View>
      <View style={{ flex: 1, overflow: "hidden", paddingVertical: 10 }}>
        <Animated.View style={{ flexDirection: "row", transform: [{ translateX: x }], paddingLeft: 14 }}>
          <Strip measure />
          <Strip />
        </Animated.View>
      </View>
    </View>
  );
}

/* ---------------- Ludo board (matches the website SVG, with live play) ---------------- */
const ACircle = Animated.createAnimatedComponent(Circle);
const R_ = "#FF5A6A", G_ = "#32D583", B_ = "#4B9BFF", Y_ = "#FFC94D";
// the 16 home tokens, exactly as the website lays them out
const HOME: [number, number, string][] = [
  [60,60,R_],[92,60,R_],[60,92,R_],[92,92,R_],
  [228,60,G_],[260,60,G_],[228,92,G_],[260,92,G_],
  [60,228,B_],[92,228,B_],[60,260,B_],[92,260,B_],
  [228,228,Y_],[260,228,Y_],[228,260,Y_],[260,260,Y_],
];
// a piece of each colour advances along its arm toward the centre, then the next starts
const TOKENS: { color: string; fx: number; fy: number; tx: number; ty: number }[] = [
  { color: R_, fx: 40, fy: 160, tx: 128, ty: 160 },
  { color: G_, fx: 160, fy: 40, tx: 160, ty: 128 },
  { color: Y_, fx: 280, fy: 160, tx: 192, ty: 160 },
  { color: B_, fx: 160, fy: 280, tx: 160, ty: 192 },
];

/** Small Ludo-board logo mark (matches the home board), for headers. */
export function BoardMark({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={1.5} y={1.5} width={21} height={21} rx={6} fill="#fff" />
      <Rect x={4} y={4} width={6.6} height={6.6} rx={2} fill={R_} />
      <Rect x={13.4} y={4} width={6.6} height={6.6} rx={2} fill={G_} />
      <Rect x={4} y={13.4} width={6.6} height={6.6} rx={2} fill={B_} />
      <Rect x={13.4} y={13.4} width={6.6} height={6.6} rx={2} fill={Y_} />
      <Polygon points="9,9 15,9 12,12" fill={G_} />
      <Polygon points="15,9 15,15 12,12" fill={Y_} />
      <Polygon points="15,15 9,15 12,12" fill={B_} />
      <Polygon points="9,15 9,9 12,12" fill={R_} />
    </Svg>
  );
}

export function Board({ size }: { size?: number }) {
  const { colors } = useApp();
  const dim = size ?? Math.min(280, Dimensions.get("window").width - 80);
  const boardBg = colors.isDark ? "#0B1020" : "#EEF2FB";
  const line = colors.isDark ? "rgba(130,160,230,0.22)" : "rgba(18,28,56,0.16)";
  const progress = useRef(TOKENS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = progress.map((v, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 480),
        Animated.timing(v, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: 1, useNativeDriver: false }),
        Animated.delay(900),
      ]))
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={{ alignSelf: "center", marginVertical: 16 }}>
      <Svg width={dim} height={dim} viewBox="0 0 320 320">
        <Rect x={2} y={2} width={316} height={316} rx={26} fill={boardBg} stroke={line} strokeWidth={2} />
        {/* colour homes */}
        <Rect x={16} y={16} width={120} height={120} rx={18} fill={R_} />
        <Rect x={184} y={16} width={120} height={120} rx={18} fill={G_} />
        <Rect x={16} y={184} width={120} height={120} rx={18} fill={B_} />
        <Rect x={184} y={184} width={120} height={120} rx={18} fill={Y_} />
        <Rect x={38} y={38} width={76} height={76} rx={14} fill={boardBg} />
        <Rect x={206} y={38} width={76} height={76} rx={14} fill={boardBg} />
        <Rect x={38} y={206} width={76} height={76} rx={14} fill={boardBg} />
        <Rect x={206} y={206} width={76} height={76} rx={14} fill={boardBg} />
        {HOME.map((d, i) => <Circle key={i} cx={d[0]} cy={d[1]} r={9} fill={d[2]} />)}
        {/* coloured arms */}
        <Rect x={146} y={20} width={28} height={112} rx={8} fill={G_} opacity={0.85} />
        <Rect x={20} y={146} width={112} height={28} rx={8} fill={R_} opacity={0.85} />
        <Rect x={188} y={146} width={112} height={28} rx={8} fill={Y_} opacity={0.85} />
        <Rect x={146} y={188} width={28} height={112} rx={8} fill={B_} opacity={0.85} />
        {/* centre diamond */}
        <Polygon points="136,136 184,136 160,160" fill={G_} />
        <Polygon points="184,136 184,184 160,160" fill={Y_} />
        <Polygon points="184,184 136,184 160,160" fill={B_} />
        <Polygon points="136,184 136,136 160,160" fill={R_} />
        {/* animated pieces advancing toward home */}
        {TOKENS.map((tk, i) => {
          const p = progress[i];
          const cx = p.interpolate({ inputRange: [0, 1], outputRange: [tk.fx, tk.tx] });
          const cy = p.interpolate({ inputRange: [0, 1], outputRange: [tk.fy, tk.ty] });
          const opacity = p.interpolate({ inputRange: [0, 0.12, 0.82, 1], outputRange: [0, 1, 1, 0] });
          return (
            <ACircle key={i} cx={cx as any} cy={cy as any} r={12} fill={tk.color} opacity={opacity as any}
              stroke="#ffffff" strokeWidth={2} strokeOpacity={0.6} />
          );
        })}
      </Svg>
    </View>
  );
}
