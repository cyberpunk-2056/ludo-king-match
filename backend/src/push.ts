import { query } from "./db.js";

// Store (or refresh) an Expo push token for a user. One row per token; if the
// same device later signs in as someone else, the token moves to that user.
export async function savePushToken(userId: string, token: string, platform?: string) {
  await query(
    `insert into push_tokens (token, user_id, platform, updated_at)
     values ($1,$2,$3, now())
     on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now()`,
    [token, userId, platform ?? null]
  );
}

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Send a push to every device of the given users via Expo's push service.
// Fire-and-forget: never throws into the caller, so a push failure can't break
// a wallet or match transaction.
export async function sendPushToUsers(userIds: string[], msg: PushMessage): Promise<void> {
  try {
    const ids = userIds.filter(Boolean);
    if (ids.length === 0) return;
    const rows = await query("select token from push_tokens where user_id = any($1::uuid[])", [ids]);
    const tokens: string[] = rows.rows
      .map((r: any) => r.token as string)
      .filter((t) => typeof t === "string" && t.startsWith("ExponentPushToken"));
    if (tokens.length === 0) return;

    const messages = tokens.map((to) => ({
      to,
      sound: "default",
      title: msg.title,
      body: msg.body,
      data: msg.data ?? {},
      priority: "high",
      channelId: "default",
    }));

    // Expo accepts up to 100 messages per request.
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Expo push non-OK:", res.status, text.slice(0, 300));
      }
    }
  } catch (e) {
    console.error("sendPushToUsers failed (ignored):", e);
  }
}
