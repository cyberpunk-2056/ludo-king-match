import { useEffect, useState } from "react";
import { ScrollView, Text, View, TextInput, Pressable, Modal } from "react-native";
import { api, money, type Match, type MatchResult } from "../../src/api";
import { useApp } from "../../src/state";
import { Btn, Card, Label, Tile } from "../../src/ui";

export default function Play() {
  const { colors, t } = useApp();
  const [live, setLive] = useState<Match[]>([]);
  const [open, setOpen] = useState<Match[]>([]);
  const [recent, setRecent] = useState<MatchResult[]>([]);
  const [mode, setMode] = useState(1);
  const [stake, setStake] = useState("20");
  const [busy, setBusy] = useState(false);
  const [room, setRoom] = useState<{ id: string; code: string; opp: string } | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    try {
      const [l, o, r] = await Promise.all([api.liveMatches(), api.openMatches(), api.recentResults()]);
      setLive(l); setOpen(o); setRecent(r);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  const s = parseFloat(stake) || 0;
  const pot = Math.round(s * 2 * 100) / 100;

  async function create() {
    setNote(null); setBusy(true);
    try {
      const m = await api.createMatch({ mode, stake: s });
      setRoom({ id: m.id, code: m.room_code || "—", opp: "waiting" });
      load();
    } catch (e: any) { setNote(e.message); } finally { setBusy(false); }
  }
  async function join(m: Match) {
    setNote(null);
    try { const r = await api.joinMatch(m.id); setRoom({ id: m.id, code: r.roomCode, opp: r.opponent }); load(); }
    catch (e: any) { setNote(e.message); }
  }
  async function report(result: "win" | "lose") {
    if (!room) return;
    try { await api.reportResult(room.id, { result }); } catch {}
    setRoom(null); load();
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "800", marginBottom: 14 }}>{t("nav_play")}</Text>

      <Card>
        <Label>{t("create_match")}</Label>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {[1, 2].map((m) => (
            <Pressable key={m} onPress={() => setMode(m)}
              style={{ flex: 1, backgroundColor: colors.bg2, borderRadius: 12, padding: 12, borderWidth: 2, borderColor: mode === m ? colors.violet : "transparent" }}>
              <Text style={{ color: colors.fg, fontWeight: "700" }}>{t(m === 1 ? "mode1" : "mode2")}</Text>
            </Pressable>
          ))}
        </View>
        <Label>{t("amount")}</Label>
        <TextInput value={stake} onChangeText={(v) => setStake(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric"
          style={{ backgroundColor: colors.bg2, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, color: colors.fg, fontSize: 16, fontWeight: "700", marginTop: 6 }} />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Tile k={t("prize_pot")} v={money(pot)} />
          <Tile k={t("winner_95")} v={money(Math.round(pot * 95) / 100)} color={colors.green} />
          <Tile k={t("fee_5")} v={money(Math.round(pot * 5) / 100)} />
        </View>
        {note && <Text style={{ color: colors.fgDim, marginTop: 10 }}>{note}</Text>}
        <Btn title={t("find_match")} onPress={create} disabled={busy || s < 1} style={{ marginTop: 14 }} />
      </Card>

      <Section title={t("live_matches")} empty={live.length === 0} emptyText={t("none")}>
        {live.map((m) => <Row key={m.id} title={`${m.playerA} vs ${m.playerB}`} sub={`${money(m.stake)} ${t("entry")}`} right={money(m.stake * 2)} />)}
      </Section>

      <Section title={t("open_to_join")} empty={open.length === 0} emptyText={t("none")}>
        {open.map((m) => (
          <Row key={m.id} title={m.playerA} sub={`${money(m.stake)} ${t("entry")}`}
            action={<Btn title={t("join")} variant="ghost" onPress={() => join(m)} style={{ paddingHorizontal: 16 }} />} />
        ))}
      </Section>

      <Section title={t("recent_results")} empty={recent.length === 0} emptyText={t("none")}>
        {recent.map((r) => <Row key={r.id} title={`🏆 ${r.winner} beat ${r.loser}`} sub={`${money(r.stake)} ${t("entry")}`} right={`+${money(r.payout)}`} rightColor={colors.green} />)}
      </Section>

      <Modal visible={!!room} transparent animationType="slide" onRequestClose={() => setRoom(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}>
          <Card>
            <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 20, textAlign: "center" }}>{t("room_code")}</Text>
            <Text style={{ color: colors.violet, fontWeight: "800", fontSize: 30, textAlign: "center", letterSpacing: 4, marginVertical: 10 }}>{room?.code}</Text>
            <Text style={{ color: colors.fgDim, textAlign: "center", marginBottom: 14 }}>{t("report")}</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Btn title={t("i_won")} variant="green" onPress={() => report("win")} style={{ flex: 1 }} />
              <Btn title={t("i_lost")} variant="ghost" onPress={() => report("lose")} style={{ flex: 1 }} />
            </View>
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Section({ title, empty, emptyText, children }: { title: string; empty: boolean; emptyText: string; children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View>
      <Text style={{ color: colors.fg, fontSize: 17, fontWeight: "700", marginTop: 20, marginBottom: 10 }}>{title}</Text>
      {empty ? <Text style={{ color: colors.fgDim }}>{emptyText}</Text> : children}
    </View>
  );
}

function Row({ title, sub, right, rightColor, action }: { title: string; sub: string; right?: string; rightColor?: string; action?: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 14 }}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{sub}</Text>
      </View>
      {right && <Text style={{ color: rightColor ?? colors.violet, fontWeight: "800" }}>{right}</Text>}
      {action}
    </View>
  );
}
