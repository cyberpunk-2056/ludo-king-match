import { useCallback, useState } from "react";
import { ScrollView, Text, View, Pressable, Modal } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { api, money, seatsForMode, type Match, type MatchResult } from "../../src/api";
import { useApp } from "../../src/state";
import { Btn, Card } from "../../src/ui";

type Room = { id: string; code: string; opp: string; status: string; joined: number; seats: number };

// Tolerate an older backend that doesn't yet send seats/pot/playersJoined.
const seatsOf = (m: { seats?: number; mode: number }) => (m.seats && m.seats > 0 ? m.seats : seatsForMode(m.mode));
const potOf = (m: { pot?: number; stake: number; seats?: number; mode: number }) =>
  m.pot != null ? m.pot : Math.round(m.stake * seatsOf(m) * 100) / 100;

export default function Play() {
  const { colors, t } = useApp();
  const router = useRouter();
  const [live, setLive] = useState<Match[]>([]);
  const [open, setOpen] = useState<Match[]>([]);
  const [recent, setRecent] = useState<MatchResult[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([api.liveMatches(), api.openMatches(), api.recentResults()])
      .then(([l, o, r]) => { setLive(l); setOpen(o); setRecent(r); })
      .catch(() => {});
  }, []);
  // refresh whenever the tab regains focus (e.g. after creating a match)
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function join(m: Match) {
    setNote(null);
    try {
      const r = await api.joinMatch(m.id);
      setRoom({ id: m.id, code: r.roomCode, opp: r.opponent, status: r.status ?? "live", joined: r.playersJoined ?? seatsOf(m), seats: r.seats || seatsOf(m) });
      load();
    } catch (e: any) { setNote(e.message); }
  }
  async function report(result: "win" | "lose") {
    if (!room) return;
    try { await api.reportResult(room.id, { result }); } catch {}
    setRoom(null); load();
  }

  const isLive = room?.status === "live";

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.3, flex: 1 }}>{t("nav_play")}</Text>
        <Btn title={`＋ ${t("create_match")}`} onPress={() => router.push("/create")} style={{ paddingHorizontal: 16, paddingVertical: 11 }} />
      </View>

      {note && <Text style={{ color: colors.red, marginBottom: 10 }}>{note}</Text>}

      <Section title={t("live_matches")} empty={live.length === 0} emptyText={t("none")}>
        {live.map((m) => <Row key={m.id} title={`${m.playerA} vs ${m.playerB}`} sub={`${money(m.stake)} ${t("entry")} · ${seatsOf(m)} ${t("players")}`} right={money(potOf(m))} rightColor={colors.gold} />)}
      </Section>

      <Section title={t("open_to_join")} empty={open.length === 0} emptyText={t("none")}>
        {open.map((m) => (
          <Row key={m.id} title={m.playerA} sub={`${money(m.stake)} ${t("entry")} · ${m.playersJoined ?? 1}/${seatsOf(m)} ${t("joined")}`}
            action={<Btn title={t("join")} variant="ghost" onPress={() => join(m)} style={{ paddingHorizontal: 16, paddingVertical: 10 }} />} />
        ))}
      </Section>

      <Section title={t("recent_results")} empty={recent.length === 0} emptyText={t("none")}>
        {recent.map((r) => <Row key={r.id} title={`🏆 ${r.winner} beat ${r.loser}`} sub={`${money(r.stake)} ${t("entry")} · ${seatsOf(r)} ${t("players")}`} right={`+${money(r.payout != null ? r.payout : Math.round(r.stake * seatsOf(r) * 0.95 * 100) / 100)}`} rightColor={colors.green} />)}
      </Section>

      <Modal visible={!!room} transparent animationType="slide" onRequestClose={() => setRoom(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}>
          <Card>
            <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 20, textAlign: "center" }}>{t("room_code")}</Text>
            <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 32, textAlign: "center", letterSpacing: 4, marginVertical: 10 }}>{room?.code || "—"}</Text>
            <Text style={{ color: colors.fgDim, textAlign: "center", fontSize: 13 }}>{t("rc_open")}</Text>
            {isLive ? (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: colors.fgDim, textAlign: "center", marginBottom: 12 }}>{t("report")}</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Btn title={t("i_won")} variant="green" onPress={() => report("win")} style={{ flex: 1 }} />
                  <Btn title={t("i_lost")} variant="ghost" onPress={() => report("lose")} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: colors.fg, fontWeight: "700", textAlign: "center" }}>{t("waiting_players")} · {room?.joined}/{room?.seats}</Text>
                <Text style={{ color: colors.fgDim, textAlign: "center", marginTop: 6, marginBottom: 14 }}>{t("waiting_hint")}</Text>
                <Btn title={t("ok")} variant="ghost" onPress={() => setRoom(null)} />
              </View>
            )}
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
      <Text style={{ color: colors.fg, fontSize: 16, fontWeight: "800", marginTop: 18, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>{title}</Text>
      {empty ? <Text style={{ color: colors.fgDim, marginBottom: 4 }}>{emptyText}</Text> : children}
    </View>
  );
}

function Row({ title, sub, right, rightColor, action }: { title: string; sub: string; right?: string; rightColor?: string; action?: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 14 }} numberOfLines={1}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{sub}</Text>
      </View>
      {right && <Text style={{ color: rightColor ?? colors.violet, fontWeight: "800", marginLeft: 10 }}>{right}</Text>}
      {action}
    </View>
  );
}
