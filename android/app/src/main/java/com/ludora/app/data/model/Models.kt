package com.ludora.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/* ---- Auth ---- */
@Serializable
data class SignupRequest(val name: String, val phone: String, val email: String, val password: String)

@Serializable
data class LoginRequest(val phone: String, val password: String)

@Serializable
data class AuthResponse(val token: String, val user: User)

@Serializable
data class User(
    val id: String = "",
    val name: String = "Player",
    val phone: String = "",
    val email: String = "",
    val rating: Int = 1820,
    @SerialName("joined") val joinedYear: Int = 2026,
    val stats: PlayerStats = PlayerStats()
)

@Serializable
data class PlayerStats(
    val played: Int = 0,
    val wins: Int = 0,
    @SerialName("total_won") val totalWon: Double = 0.0
) {
    val winRate: Int get() = if (played > 0) (wins * 100.0 / played).toInt() else 0
}

/* ---- Wallet ---- */
@Serializable
data class Wallet(
    val deposit: Double = 0.0,
    val winnings: Double = 0.0,
    val currency: String = "₹"
) {
    val total: Double get() = deposit + winnings
}

@Serializable
data class Transaction(
    val id: String = "",
    val type: String,          // deposit | withdraw | win | stake | referral | refund
    val amount: Double,
    val note: String = "",
    @SerialName("created_at") val createdAt: Long = 0
)

@Serializable
data class DepositRequest(val amount: Double, val method: String, val instrument: String = "")

@Serializable
data class WithdrawRequest(val amount: Double, val upiId: String)

@Serializable
data class OpResult(val status: String = "ok", val txId: String = "", val message: String = "")

/* ---- Payout methods ---- */
@Serializable
data class UpiAccount(
    val id: String = "",
    val vpa: String,
    val name: String = "",
    val verified: Boolean = false,
    @SerialName("is_default") val isDefault: Boolean = false
)

@Serializable
data class VerifyUpiRequest(val vpa: String)

/* ---- Matches ---- */
@Serializable
data class Match(
    val id: String = "",
    val mode: Int = 1,                 // 1 = 1v1 duel, 2 = 4-player royale
    val stake: Double = 0.0,
    val playerA: String = "",
    val playerB: String = "",
    val status: String = "open",       // open | waiting | live | settled
    @SerialName("join_deadline") val joinDeadline: Long = 0,
    @SerialName("room_code") val roomCode: String = ""
) {
    val pot: Double get() = stake * 2
}

@Serializable
data class MatchResult(
    val id: String = "",
    val mode: Int = 1,
    val stake: Double = 0.0,
    val winner: String = "",
    val loser: String = "",
    val payout: Double = 0.0,
    val result: String = "win",        // from the current user's view: win | lose
    val opponent: String = "",
    @SerialName("finished_at") val finishedAt: Long = 0
)

@Serializable
data class CreateMatchRequest(val mode: Int, val stake: Double)

@Serializable
data class JoinResponse(val roomCode: String, val opponent: String)

@Serializable
data class ReportResultRequest(val result: String, val proofUrl: String? = null)

/* ---- Referral ---- */
@Serializable
data class Referral(
    val code: String = "",
    val earnings: Double = 0.0,
    @SerialName("winnings_base") val winningsBase: Double = 0.0,
    val friends: List<ReferredFriend> = emptyList()
)

@Serializable
data class ReferredFriend(val name: String, val winnings: Double)
