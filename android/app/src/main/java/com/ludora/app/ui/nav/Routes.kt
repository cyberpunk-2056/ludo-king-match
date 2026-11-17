package com.ludora.app.ui.nav

object Routes {
    const val AUTH = "auth"
    const val HOME = "home"
    const val PLAY = "play"
    const val CREATE = "create"
    const val WALLET = "wallet"
    const val DEPOSIT = "deposit"
    const val WITHDRAW = "withdraw"
    const val REFER = "refer"
    const val PROFILE = "profile"
    const val MATCH_HISTORY = "match_history"
    const val WALLET_HISTORY = "wallet_history"
    const val RULES = "rules"
}

/** Bottom-bar destinations. */
enum class Tab(val route: String, val labelKey: String) {
    Home(Routes.HOME, "nav_home"),
    Play(Routes.PLAY, "nav_play"),
    Wallet(Routes.WALLET, "nav_wallet"),
    Profile(Routes.PROFILE, "nav_profile")
}
