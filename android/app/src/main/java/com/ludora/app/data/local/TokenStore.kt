package com.ludora.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore by preferencesDataStore(name = "ludora_prefs")

/** Persists the JWT, chosen language, and theme across launches. */
class TokenStore(private val context: Context) {
    private val TOKEN = stringPreferencesKey("token")
    private val LANG = stringPreferencesKey("lang")
    private val THEME = stringPreferencesKey("theme")

    val tokenFlow: Flow<String?> = context.dataStore.data.map { it[TOKEN] }

    /** Synchronous read for the OkHttp interceptor. */
    fun currentToken(): String? = runBlocking { context.dataStore.data.first()[TOKEN] }

    suspend fun saveToken(token: String) = context.dataStore.edit { it[TOKEN] = token }
    suspend fun clearToken() = context.dataStore.edit { it.remove(TOKEN) }

    suspend fun language(): String = context.dataStore.data.first()[LANG] ?: "en"
    suspend fun setLanguage(code: String) = context.dataStore.edit { it[LANG] = code }

    suspend fun theme(): String? = context.dataStore.data.first()[THEME]
    suspend fun setTheme(mode: String) = context.dataStore.edit { it[THEME] = mode }
}
