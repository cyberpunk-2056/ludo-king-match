import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "./state";
import { gradient } from "./theme";

type Step = { title: string; body: string };
const STEPS: Record<"en" | "hi", Step[]> = {
  en: [
    { title: "Hi, I'm Ludo! 🎲", body: "Welcome to Ludo King Maker. Let me show you around in a few quick steps." },
    { title: "Your wallet", body: "Your balance sits in the top bar. Tap + to add money. Winnings are withdrawable to your verified UPI." },
    { title: "Create a match", body: "Open Play and tap Create match. Pick 1v1 or 4-player, set the entry fee, and paste your Ludo King room code." },
    { title: "Join a match", body: "Tap Join on any open match and you instantly get the room code. Open Ludo King and join that code." },
    { title: "Report & win", body: "After the game, tap 'I won' or 'I lost'. When results agree, the winner gets 95% of the pot automatically." },
    { title: "Invite & get help", body: "Share your code from Refer & earn for 3% of friends' winnings. Need help? Support chat is in your Profile. You're all set!" },
  ],
  hi: [
    { title: "नमस्ते, मैं लूडो! 🎲", body: "लूडोरा में स्वागत है। चलिए कुछ आसान स्टेप्स में सब दिखाता हूँ।" },
    { title: "आपका वॉलेट", body: "आपका बैलेंस टॉप बार में रहता है। पैसे जोड़ने के लिए + दबाएं। जीत आपके सत्यापित UPI पर निकाली जा सकती है।" },
    { title: "मैच बनाएं", body: "Play खोलकर मैच बनाएं दबाएं। 1v1 या 4-प्लेयर चुनें, एंट्री फीस डालें, और अपना लूडो किंग रूम कोड पेस्ट करें।" },
    { title: "मैच जॉइन करें", body: "किसी खुले मैच पर जॉइन दबाएं, तुरंत रूम कोड मिलेगा। लूडो किंग खोलकर उसी कोड से जुड़ें।" },
    { title: "रिपोर्ट करें और जीतें", body: "गेम के बाद 'मैं जीता' या 'मैं हारा' दबाएं। नतीजे मिलने पर विजेता को पॉट का 95% अपने-आप मिलता है।" },
    { title: "इनवाइट करें और मदद लें", body: "रेफर & कमाएं से कोड शेयर करें और दोस्तों की जीत का 3% पाएं। मदद चाहिए? प्रोफ़ाइल में सपोर्ट चैट है। आप तैयार हैं!" },
  ],
};

/** A friendly dice mascot that bobs gently. */
function Buddy({ size = 96 }: { size?: number }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  const y = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const eye = { width: size * 0.17, height: size * 0.17, borderRadius: size * 0.09, backgroundColor: "#0E1322", alignItems: "center" as const, justifyContent: "center" as const };
  const pup = { width: size * 0.07, height: size * 0.07, borderRadius: size * 0.04, backgroundColor: "#fff" };
  return (
    <Animated.View style={{ transform: [{ translateY: y }], shadowColor: "#4C84FF", shadowOpacity: 0.6, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }}>
      <LinearGradient colors={gradient as readonly [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size * 0.28, alignItems: "center", justifyContent: "center", gap: size * 0.08 }}>
        <View style={{ flexDirection: "row", gap: size * 0.14, marginTop: size * 0.08 }}>
          <View style={eye}><View style={pup} /></View>
          <View style={eye}><View style={pup} /></View>
        </View>
        <View style={{ width: size * 0.32, height: size * 0.16, borderBottomWidth: size * 0.05, borderColor: "#0E1322", borderBottomLeftRadius: size * 0.2, borderBottomRightRadius: size * 0.2 }} />
      </LinearGradient>
    </Animated.View>
  );
}

export function BuddyTour() {
  const { colors, lang, showTour, endTour } = useApp();
  const [i, setI] = useState(0);
  const steps = STEPS[lang] ?? STEPS.en;
  useEffect(() => { if (showTour) setI(0); }, [showTour]);
  if (!showTour) return null;
  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={endTour} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: "rgba(4,6,13,0.8)", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Buddy />
        <View style={{ marginTop: -14, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 20, padding: 22, width: "100%", maxWidth: 360, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 8 }}>
          <Text style={{ color: colors.fg, fontWeight: "900", fontSize: 20, textAlign: "center" }}>{step.title}</Text>
          <Text style={{ color: colors.fgDim, fontSize: 14.5, lineHeight: 21, textAlign: "center", marginTop: 10 }}>{step.body}</Text>

          {/* progress dots */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 18 }}>
            {steps.map((_, k) => (
              <View key={k} style={{ width: k === i ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: k === i ? colors.gold : colors.surface2 }} />
            ))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20, gap: 10 }}>
            <Pressable onPress={endTour} hitSlop={8}><Text style={{ color: colors.muted, fontWeight: "700", fontSize: 14 }}>{lang === "hi" ? "छोड़ें" : "Skip"}</Text></Pressable>
            <View style={{ flex: 1 }} />
            {i > 0 && (
              <Pressable onPress={() => setI(i - 1)} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1 }}>
                <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 14 }}>{lang === "hi" ? "पीछे" : "Back"}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => (last ? endTour() : setI(i + 1))} style={{ borderRadius: 12, overflow: "hidden" }}>
              <LinearGradient colors={gradient as readonly [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 12, paddingHorizontal: 22 }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{last ? (lang === "hi" ? "शुरू करें" : "Start playing") : (lang === "hi" ? "आगे" : "Next")}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
