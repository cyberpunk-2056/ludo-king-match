import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, type SupportMsg } from "../src/api";
import { useApp } from "../src/state";
import { DiceFace } from "../src/ui";

export default function Support() {
  const { colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<SupportMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef<any>(null);

  useEffect(() => { api.supportMessages().then(setMsgs).catch(() => {}); }, []);
  useEffect(() => { const id = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60); return () => clearTimeout(id); }, [msgs]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setText(""); setSending(true);
    // optimistic user bubble
    const temp: SupportMsg = { id: "tmp" + Date.now(), sender: "user", body, created_at: Date.now() };
    setMsgs((m) => [...m, temp]);
    try {
      const pair = await api.sendSupport(body);
      setMsgs((m) => [...m.filter((x) => x.id !== temp.id), ...pair]);
    } catch {
      setMsgs((m) => m.filter((x) => x.id !== temp.id));
      setText(body);
    } finally { setSending(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomColor: colors.line, borderBottomWidth: 1 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: colors.fgDim, fontWeight: "800", fontSize: 15 }}>←</Text></Pressable>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
          <DiceFace size={20} face={5} bg="#fff" pip="#10182b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 15 }}>{t("support")}</Text>
          <Text style={{ color: colors.green, fontSize: 11, fontWeight: "700" }}>● {t("support_online")}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={insets.top + 8}>
        <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 10 }}>
          <View style={{ backgroundColor: colors.surface2, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: colors.fgDim, fontSize: 13, lineHeight: 19 }}>{t("support_intro")}</Text>
          </View>
          {msgs.map((m) => {
            const mine = m.sender === "user";
            return (
              <View key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "84%" }}>
                <View style={{ backgroundColor: mine ? colors.violet : colors.surface, borderColor: colors.line, borderWidth: mine ? 0 : 1, borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4, paddingVertical: 10, paddingHorizontal: 13 }}>
                  <Text style={{ color: mine ? "#fff" : colors.fg, fontSize: 14, lineHeight: 20 }}>{m.body}</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 3, marginHorizontal: 4, alignSelf: mine ? "flex-end" : "flex-start" }}>
                  {mine ? t("support_you") : t("support_team")}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 10, paddingBottom: Math.max(10, insets.bottom), borderTopColor: colors.line, borderTopWidth: 1, backgroundColor: colors.bg }}>
          <TextInput
            value={text} onChangeText={setText} placeholder={t("support_ph")} placeholderTextColor={colors.muted}
            multiline style={{ flex: 1, maxHeight: 110, backgroundColor: colors.surface2, borderColor: colors.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 11, color: colors.fg, fontSize: 15 }} />
          <Pressable onPress={send} disabled={sending || !text.trim()} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: text.trim() ? colors.violet : colors.surface2, alignItems: "center", justifyContent: "center", opacity: sending ? 0.6 : 1 }}>
            <Text style={{ color: text.trim() ? "#fff" : colors.muted, fontSize: 18, fontWeight: "800" }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
