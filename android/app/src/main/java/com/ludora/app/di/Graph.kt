package com.ludora.app.di

import android.content.Context
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.ludora.app.BuildConfig
import com.ludora.app.data.LudoraRepository
import com.ludora.app.data.local.TokenStore
import com.ludora.app.data.remote.ApiService
import com.ludora.app.data.remote.AuthInterceptor
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit

/**
 * Lightweight service locator. Call [Graph.init] once from the Application.
 * Avoids Hilt/kapt so the project builds with no annotation processors.
 */
object Graph {
    lateinit var repository: LudoraRepository
        private set
    lateinit var tokenStore: TokenStore
        private set

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    fun init(context: Context) {
        tokenStore = TokenStore(context.applicationContext)

        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
            else HttpLoggingInterceptor.Level.NONE
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor { tokenStore.currentToken() })
            .addInterceptor(logging)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()

        val api = retrofit.create(ApiService::class.java)
        repository = LudoraRepository(api, tokenStore)
    }
}
