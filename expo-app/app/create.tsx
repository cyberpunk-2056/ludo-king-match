import { useState } from "react";
import { ScrollView, Text, View, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, money, seatsForMode } from "../src/api";
import { useApp } from "../src/state";
import { Btn, Card, Label, Tile } from "../src/ui";

const CHIPS = [10, 20, 50, 100, 200];
const r2 = (n: number) => Math.round(n * 100) / 100;

export default function Create() {
  const { colors, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState(1);
  const [stake, setStake] = useState("20");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; status: string; joined: number; seats: number } | null>(null);

  const s = parseFloat(stake) || 0;
  const pot = r2(s * seatsForMode(mode));

  async function create() {
    setNote(null); setBusy(true);
    try {
      const m = await api.createMatch({ mode, stake: s, roomCode: code.trim() });
      setDone({ code: m.room_code || code.trim(), status: m.status ?? "waiting", joined: m.playersJoined ?? 1, seats: m.seats || seatsForMode(mode) });
    } catch (e: any) { setNote(e.message); } finally { setBusy(false); }
  }

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, justifyContent: "center", padding: 20 }}>
        <Card style={{ alignItems: "center" }}>
          <Text style={{ color: colors.green, fontWeight: "900", fontSize: 18, textTransform: "uppercase" }}>{t("match_created")}</Text>
          <Text style={{ color: colors.fgDim, fontSize: 13, textAlign: "center", marginTop: 6 }}>{t("waiting_players")} · {done.joined}/{done.seats}</Text>
          <Text style={{ color: colors.fgDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginTop: 18 }}>{t("room_code")}</Text>
          <Text style={{ color: colors.gold, fontWeight: "900", fontSize: 34, letterSpacing: 4, marginTop: 6 }}>{done.code}</Text>
          <Text style={{ color: colors.fgDim, fontSize: 13, textAlign: "center", marginTop: 12 }}>{t("rc_open")}</Text>
          <Btn title={t("done")} onPress={() => router.back()} style={{ alignSelf: "stretch", marginTop: 20 }} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: 28 }}>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: colors.fgDim, fontWeight: "800" }}>← {t("back")}</Text></Pressable>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 10, marginBottom: 14 }}>{t("create_match")}</Text>

      <Card>
        <Label>{t("mode")}</Label>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          {[1, 2].map((m) => (
            <Pressable key={m} onPress={() => setMode(m)}
              style={{ flex: 1, backgroundColor: colors.bg2, borderRadius: 12, padding: 13, borderWidth: 2, borderColor: mode === m ? colors.violet : "transparent" }}>
              <Text style={{ color: colors.fg, fontWeight: "800" }}>{t(m === 1 ? "mode1" : "mode2")}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{seatsForMode(m)} {t("players")}</Text>
            </Pressable>
          ))}
        </View>

        <Label style={{ marginTop: 16 }}>{t("amount")}</Label>
        <TextInput value={stake} onChangeText={(v) => setStake(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric"
          style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, color: colors.fg, fontSize: 18, fontWeight: "800", marginTop: 6 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {CHIPS.map((c) => (
            <Pressable key={c} onPress={() => setStake(String(c))}
              style={{ backgroundColor: s === c ? colors.violet : colors.surface2, borderColor: colors.line, borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 }}>
              <Text style={{ color: s === c ? "#fff" : colors.fgDim, fontWeight: "800", fontSize: 13 }}>{money(c)}</Text>
            </Pressable>
          ))}
        </View>

        <Label style={{ marginTop: 16 }}>{t("rc_label")}</Label>
        <TextInput value={code} onChangeText={(v) => setCode(v.replace(/[^A-Za-z0-9]/g, ""))} placeholder={t("rc_ph")}
          placeholderTextColor={colors.muted} autoCapitalize="characters" maxLength={20}
          style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 13, color: colors.fg, fontSize: 17, fontWeight: "800", letterSpacing: 2, marginTop: 6 }} />
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{t("rc_hint")}</Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <Tile k={t("prize_pot")} v={money(pot)} color={colors.gold} />
          <Tile k={t("winner_95")} v={money(r2(pot * 0.95))} color={colors.green} />
          <Tile k={t("fee_5")} v={money(r2(pot * 0.05))} />
        </View>

        {note && <Text style={{ color: colors.red, marginTop: 12 }}>{note}</Text>}
        <Btn title={t("find_match")} onPress={create} disabled={busy || s < 1 || code.trim().length < 4} style={{ marginTop: 16 }} />
      </Card>
    </ScrollView>
  );
}
