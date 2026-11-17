package com.ludora.app.core

import kotlin.math.roundToLong

/** Shared money rules, kept identical to the web client and enforced again on the server. */
object Money {
    const val PLATFORM_FEE = 0.05          // 5% platform fee
    const val WINNER_SHARE = 0.95          // 95% to winner
    const val REFERRAL_RATE = 0.03         // 3% of a referred friend's winnings
    const val MIN_DEPOSIT = 5.0
    const val MIN_WITHDRAW = 10.0
    const val JOIN_WINDOW_MS = 10 * 60 * 1000L   // 10-minute join timer

    fun round2(v: Double): Double = (v * 100).roundToLong() / 100.0

    /** Payout to the winner from a pot (95%). */
    fun winnerPayout(pot: Double): Double = round2(pot * WINNER_SHARE)

    /** Platform fee from a pot (5%). */
    fun fee(pot: Double): Double = round2(pot * PLATFORM_FEE)

    /** Pot for a two-player match at a given stake. */
    fun pot(stake: Double): Double = round2(stake * 2)

    /** Referral commission earned when a referred friend wins [winnings]. */
    fun referralCommission(winnings: Double): Double = round2(winnings * REFERRAL_RATE)

    fun format(amount: Double, currency: String = "₹"): String {
        val neg = amount < 0
        val a = Math.abs(amount)
        val s = String.format("%,.2f", a)
        return (if (neg) "-" else "") + currency + s
    }

    fun mmss(remainingMs: Long): String {
        val ms = if (remainingMs < 0) 0 else remainingMs
        val total = ms / 1000
        val m = total / 60
        val s = total % 60
        return "%d:%02d".format(m, s)
    }
}
