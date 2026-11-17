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
  pot(stake: number): number {
    return Money.round2(stake * 2);
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
