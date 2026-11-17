package com.ludora.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import com.ludora.app.di.Graph
import com.ludora.app.ui.LocalLang
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.Strings
import com.ludora.app.ui.nav.LudoraNavHost
import com.ludora.app.ui.theme.LudoraTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val scope = rememberCoroutineScope()
            var lang by rememberSaveable { mutableStateOf("en") }
            var theme by rememberSaveable { mutableStateOf<String?>(null) }

            // load saved prefs once
            LaunchedEffect(Unit) {
                lang = Graph.tokenStore.language()
                theme = Graph.tokenStore.theme()
            }

            val setLang: (String) -> Unit = { code ->
                lang = code
                scope.launch { Graph.tokenStore.setLanguage(code) }
            }
            val toggleTheme: () -> Unit = {
                val next = if (theme == "dark") "light" else "dark"
                theme = next
                scope.launch { Graph.tokenStore.setTheme(next) }
            }

            CompositionLocalProvider(
                LocalLang provides lang,
                LocalStrings provides Strings.map(lang)
            ) {
                LudoraTheme(themeMode = theme) {
                    LudoraNavHost(
                        loggedIn = Graph.repository.hasToken(),
                        onToggleLang = { setLang(if (lang == "en") "hi" else "en") },
                        onToggleTheme = toggleTheme
                    )
                }
            }
        }
    }
}
