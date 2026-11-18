/** Server-side money rules — the source of truth. Clients mirror these for display only. */
export const Money = {
  PLATFORM_FEE: 0.05,
  WINNER_SHARE: 0.95,
  REFERRAL_RATE: 0.03,
  MIN_DEPOSIT: 5,
  MIN_WITHDRAW: 10,
  JOIN_WINDOW_MS: 10 * 60 * 1000,

  round2(v: number): number {
    return Math.round(v * 100) / 100;
  },
  // how many players a mode seats: mode 1 = 1v1 (2), anything else = 4-player
  seatsForMode(mode: number): number {
    return mode === 1 ? 2 : 4;
  },
  // total prize pool = every seat pays the same entry fee
  pot(stake: number, seats = 2): number {
    return Money.round2(stake * seats);
  },
  winnerPayout(pot: number): number {
    return Money.round2(pot * Money.WINNER_SHARE);
  },
  fee(pot: number): number {
    return Money.round2(pot * Money.PLATFORM_FEE);
  },
  referralCommission(winnings: number): number {
    return Money.round2(winnings * Money.REFERRAL_RATE);
  },
};
