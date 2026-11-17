import * as SecureStore from "expo-secure-store";

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? "https://ludo-king-match.onrender.com").replace(/\/$/, "");
const KEY = "ludora_token";

let token: string | null = null;

export async function loadToken(): Promise<string | null> {
  try { token = await SecureStore.getItemAsync(KEY); } catch { token = null; }
  return token;
}
export async function setToken(t: string) { token = t; try { await SecureStore.setItemAsync(KEY, t); } catch {} }
export async function clearToken() { token = null; try { await SecureStore.deleteItemAsync(KEY); } catch {} }

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, (data as any).message ?? `Request failed (${res.status})`);
  return data as T;
}

// ---- types ----
export interface User { id: string; name: string; phone: string; email: string; rating: number; joined: number; stats: { played: number; wins: number; total_won: number } }
export interface Wallet { deposit: number; winnings: number; currency: string }
export interface Tx { id: string; type: string; amount: number; note: string; created_at: number }
export interface UpiAccount { id: string; vpa: string; name: string; verified: boolean; is_default: boolean }
export interface Match { id: string; mode: number; stake: number; playerA: string; playerB: string; status: string; join_deadline: number; room_code: string }
export interface MatchResult { id: string; mode: number; stake: number; winner: string; loser: string; payout: number; result: string; opponent: string; finished_at: number }
export interface Referral { code: string; earnings: number; winnings_base: number; friends: { name: string; winnings: number }[] }

export const api = {
  signup: (b: { name: string; phone: string; email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { phone: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  me: () => request<User>("/api/me"),

  wallet: () => request<Wallet>("/api/wallet"),
  transactions: (limit = 50) => request<Tx[]>(`/api/wallet/transactions?limit=${limit}`),
  deposit: (b: { amount: number; method: string; instrument?: string }) =>
    request<{ status: string; txId: string }>("/api/wallet/deposit", { method: "POST", body: JSON.stringify(b) }),
  withdraw: (b: { amount: number; upiId: string }) =>
    request<{ status: string; txId: string }>("/api/wallet/withdraw", { method: "POST", body: JSON.stringify(b) }),

  payoutMethods: () => request<UpiAccount[]>("/api/payout-methods"),
  verifyUpi: (vpa: string) => request<UpiAccount>("/api/payout-methods/verify", { method: "POST", body: JSON.stringify({ vpa }) }),

  liveMatches: () => request<Match[]>("/api/matches/live"),
  openMatches: () => request<Match[]>("/api/matches/open"),
  recentResults: () => request<MatchResult[]>("/api/matches/recent"),
  createMatch: (b: { mode: number; stake: number }) => request<Match>("/api/matches", { method: "POST", body: JSON.stringify(b) }),
  joinMatch: (id: string) => request<{ roomCode: string; opponent: string }>(`/api/matches/${id}/join`, { method: "POST" }),
  reportResult: (id: string, b: { result: string; proofUrl?: string }) =>
    request<{ status: string }>(`/api/matches/${id}/result`, { method: "POST", body: JSON.stringify(b) }),

  referral: () => request<Referral>("/api/referral"),
};

export const money = (n: number, c = "$") => {
  const neg = n < 0; const a = Math.abs(n);
  return (neg ? "-" : "") + c + a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
