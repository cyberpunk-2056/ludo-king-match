package com.ludora.app.data

import com.ludora.app.data.local.TokenStore
import com.ludora.app.data.model.*
import com.ludora.app.data.remote.ApiService

/**
 * Single source of truth for the UI. Wraps the shared API and the token store.
 * Everything the app shows comes from here, so the app and website stay in sync
 * through the one backend.
 */
class LudoraRepository(
    private val api: ApiService,
    private val tokens: TokenStore
) {
    // ---- session ----
    fun hasToken(): Boolean = tokens.currentToken()?.isNotBlank() == true

    suspend fun login(phone: String, password: String): User {
        val res = api.login(LoginRequest(phone, password))
        tokens.saveToken(res.token)
        return res.user
    }

    suspend fun signup(name: String, phone: String, email: String, password: String): User {
        val res = api.signup(SignupRequest(name, phone, email, password))
        tokens.saveToken(res.token)
        return res.user
    }

    suspend fun logout() {
        runCatching { api.logout() }
        tokens.clearToken()
    }

    suspend fun me(): User = api.me()

    // ---- wallet ----
    suspend fun wallet(): Wallet = api.wallet()
    suspend fun transactions(limit: Int = 50): List<Transaction> = api.transactions(limit)
    suspend fun deposit(amount: Double, method: String, instrument: String = ""): OpResult =
        api.deposit(DepositRequest(amount, method, instrument))
    suspend fun withdraw(amount: Double, upiId: String): OpResult =
        api.withdraw(WithdrawRequest(amount, upiId))

    // ---- payout methods ----
    suspend fun payoutMethods(): List<UpiAccount> = api.payoutMethods()
    suspend fun verifyUpi(vpa: String): UpiAccount = api.verifyUpi(VerifyUpiRequest(vpa))
    suspend fun setDefaultUpi(id: String): OpResult = api.setDefaultUpi(id)

    // ---- matches ----
    suspend fun liveMatches(): List<Match> = api.liveMatches()
    suspend fun openMatches(): List<Match> = api.openMatches()
    suspend fun recentResults(): List<MatchResult> = api.recentResults()
    suspend fun matchHistory(): List<MatchResult> = api.matchHistory()
    suspend fun createMatch(mode: Int, stake: Double): Match = api.createMatch(CreateMatchRequest(mode, stake))
    suspend fun joinMatch(id: String): JoinResponse = api.joinMatch(id)
    suspend fun reportResult(id: String, result: String, proofUrl: String? = null): OpResult =
        api.reportResult(id, ReportResultRequest(result, proofUrl))

    // ---- referral ----
    suspend fun referral(): Referral = api.referral()
}
