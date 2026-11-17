package com.ludora.app.data.remote

import com.ludora.app.data.model.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * The shared backend API. The web app calls the same endpoints, so both clients
 * read and write the one database behind this API.
 */
interface ApiService {

    // ---- Auth ----
    @POST("api/auth/signup")
    suspend fun signup(@Body body: SignupRequest): AuthResponse

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("api/auth/logout")
    suspend fun logout(): OpResult

    @GET("api/me")
    suspend fun me(): User

    // ---- Wallet ----
    @GET("api/wallet")
    suspend fun wallet(): Wallet

    @GET("api/wallet/transactions")
    suspend fun transactions(@Query("limit") limit: Int = 50): List<Transaction>

    @POST("api/wallet/deposit")
    suspend fun deposit(@Body body: DepositRequest): OpResult

    @POST("api/wallet/withdraw")
    suspend fun withdraw(@Body body: WithdrawRequest): OpResult

    // ---- Payout methods ----
    @GET("api/payout-methods")
    suspend fun payoutMethods(): List<UpiAccount>

    @POST("api/payout-methods/verify")
    suspend fun verifyUpi(@Body body: VerifyUpiRequest): UpiAccount

    @POST("api/payout-methods/{id}/default")
    suspend fun setDefaultUpi(@Path("id") id: String): OpResult

    // ---- Matches ----
    @GET("api/matches/live")
    suspend fun liveMatches(): List<Match>

    @GET("api/matches/open")
    suspend fun openMatches(): List<Match>

    @GET("api/matches/recent")
    suspend fun recentResults(): List<MatchResult>

    @GET("api/matches/history")
    suspend fun matchHistory(): List<MatchResult>

    @POST("api/matches")
    suspend fun createMatch(@Body body: CreateMatchRequest): Match

    @POST("api/matches/{id}/join")
    suspend fun joinMatch(@Path("id") id: String): JoinResponse

    @POST("api/matches/{id}/result")
    suspend fun reportResult(@Path("id") id: String, @Body body: ReportResultRequest): OpResult

    // ---- Referral ----
    @GET("api/referral")
    suspend fun referral(): Referral
}
