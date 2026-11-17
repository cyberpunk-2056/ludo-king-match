package com.ludora.app.ui.nav

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.auth.AuthScreen
import com.ludora.app.ui.home.HomeScreen
import com.ludora.app.ui.play.CreateMatchScreen
import com.ludora.app.ui.play.PlayScreen
import com.ludora.app.ui.profile.ProfileScreen
import com.ludora.app.ui.theme.LocalLudora
import com.ludora.app.ui.wallet.DepositScreen
import com.ludora.app.ui.wallet.WalletScreen
import com.ludora.app.ui.wallet.WithdrawScreen

@Composable
fun LudoraNavHost(loggedIn: Boolean, onToggleLang: () -> Unit, onToggleTheme: () -> Unit) {
    val nav = rememberNavController()
    val c = LocalLudora.current
    val t = LocalStrings.current
    val start = if (loggedIn) Routes.HOME else Routes.AUTH

    val backStack by nav.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route
    val showBar = currentRoute in Tab.values().map { it.route }

    Scaffold(
        containerColor = c.bg,
        bottomBar = {
            if (showBar) NavigationBar(containerColor = c.surface) {
                Tab.values().forEach { tab ->
                    val selected = backStack?.destination?.hierarchy?.any { it.route == tab.route } == true
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            nav.navigate(tab.route) {
                                popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true; restoreState = true
                            }
                        },
                        icon = {},
                        label = {
                            Text(
                                t[tab.labelKey] ?: tab.name,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (selected) c.violet else c.muted
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(indicatorColor = Color.Transparent)
                    )
                }
            }
        }
    ) { pad ->
        NavHost(nav, startDestination = start, modifier = Modifier.padding(pad)) {
            composable(Routes.AUTH) {
                AuthScreen(onToggleLang = onToggleLang) {
                    nav.navigate(Routes.HOME) { popUpTo(Routes.AUTH) { inclusive = true } }
                }
            }
            composable(Routes.HOME) { HomeScreen(nav, onToggleLang, onToggleTheme) }
            composable(Routes.PLAY) { PlayScreen(nav, onToggleLang, onToggleTheme) }
            composable(Routes.CREATE) { CreateMatchScreen(nav) }
            composable(Routes.WALLET) { WalletScreen(nav, onToggleLang, onToggleTheme) }
            composable(Routes.DEPOSIT) { DepositScreen(nav) }
            composable(Routes.WITHDRAW) { WithdrawScreen(nav) }
            composable(Routes.PROFILE) {
                ProfileScreen(nav, onToggleLang, onToggleTheme, onLoggedOut = {
                    nav.navigate(Routes.AUTH) { popUpTo(0) }
                })
            }
        }
    }
}
