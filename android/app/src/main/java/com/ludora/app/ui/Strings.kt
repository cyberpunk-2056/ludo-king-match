package com.ludora.app.ui

import androidx.compose.runtime.compositionLocalOf

/** In-app English/Hindi strings, same keys as the web client. */
object Strings {
    val en = mapOf(
        "appName" to "Ludora",
        "balance" to "Balance",
        "nav_home" to "Home", "nav_play" to "Play", "nav_wallet" to "Wallet",
        "nav_profile" to "Profile", "nav_deposit" to "Deposit", "nav_withdraw" to "Withdraw",
        "nav_refer" to "Refer", "nav_rules" to "Rules",
        "login_h" to "Welcome back", "login_s" to "Log in to play and manage your wallet.",
        "signup_h" to "Create your account", "signup_s" to "Sign up to start playing for real.",
        "login_btn" to "Log in", "signup_btn" to "Create account",
        "to_signup" to "New here? Create an account", "to_login" to "Already have an account? Log in",
        "f_name" to "Full name", "f_phone" to "Phone number", "f_email" to "Email", "f_pass" to "Password",
        "legal18" to "18+ only. Play responsibly.",
        "hero_h" to "Roll. Race. Win real cash.",
        "hero_s" to "Play Ludo for real money. We match you, hold the stakes, and pay the winner 95%.",
        "play_a_match" to "Play a match", "create_match" to "Create match",
        "live_matches" to "Live matches", "open_to_join" to "Open to join", "recent_results" to "Recent results",
        "mode1" to "1v1 Duel", "mode2" to "4-Player Royale",
        "entry" to "entry", "left" to "left", "join" to "Join",
        "prize_pot" to "Prize pot", "winner_95" to "Winner gets 95%", "fee_5" to "Platform fee 5%",
        "find_match" to "Find match & lock stake",
        "w_total" to "Total balance", "w_dep" to "Deposit balance", "w_win" to "Winnings",
        "add_money" to "Add money", "withdraw" to "Withdraw", "recent" to "Recent activity",
        "amount" to "Amount", "method" to "Payment method",
        "pay" to "Pay", "confirm_wd" to "Confirm withdrawal",
        "dep_rule1" to "Minimum deposit is \$5; used to join matches and also withdrawable.",
        "wd_rule1" to "Minimum withdrawal \$10; deposit + winnings, to a KYC-verified UPI only.",
        "refer_h" to "Refer & earn", "refer_s" to "Earn 3% of your friends' winnings — for life.",
        "profile" to "Profile", "played" to "Played", "wins" to "Wins", "win_rate" to "Win rate", "total_won" to "Total won",
        "match_history" to "Match history", "wallet_history" to "Wallet history", "logout" to "Log out",
        "won" to "You won!", "lost" to "You lost", "retry" to "Retry", "loading" to "Loading…"
    )

    val hi = mapOf(
        "appName" to "Ludora",
        "balance" to "बैलेंस",
        "nav_home" to "होम", "nav_play" to "खेलें", "nav_wallet" to "वॉलेट",
        "nav_profile" to "प्रोफ़ाइल", "nav_deposit" to "जमा", "nav_withdraw" to "निकासी",
        "nav_refer" to "रेफ़र", "nav_rules" to "नियम",
        "login_h" to "वापसी पर स्वागत है", "login_s" to "खेलने और वॉलेट संभालने के लिए लॉग इन करें।",
        "signup_h" to "अपना खाता बनाएं", "signup_s" to "असली के लिए खेलना शुरू करें।",
        "login_btn" to "लॉग इन", "signup_btn" to "खाता बनाएं",
        "to_signup" to "नए हैं? खाता बनाएं", "to_login" to "पहले से खाता है? लॉग इन",
        "f_name" to "पूरा नाम", "f_phone" to "फ़ोन नंबर", "f_email" to "ईमेल", "f_pass" to "पासवर्ड",
        "legal18" to "केवल 18+। ज़िम्मेदारी से खेलें।",
        "hero_h" to "रोल करें। रेस करें। असली पैसे जीतें।",
        "hero_s" to "असली पैसे के लिए लूडो खेलें। हम मैच कराते हैं, स्टेक रखते हैं, और विजेता को 95% देते हैं।",
        "play_a_match" to "मैच खेलें", "create_match" to "मैच बनाएं",
        "live_matches" to "लाइव मैच", "open_to_join" to "जॉइन के लिए खुले", "recent_results" to "हाल के नतीजे",
        "mode1" to "1v1 डुएल", "mode2" to "4-प्लेयर रॉयल",
        "entry" to "एंट्री", "left" to "बाकी", "join" to "जॉइन",
        "prize_pot" to "इनाम राशि", "winner_95" to "विजेता को 95%", "fee_5" to "प्लेटफ़ॉर्म फीस 5%",
        "find_match" to "मैच बनाएं और स्टेक लॉक करें",
        "w_total" to "कुल बैलेंस", "w_dep" to "जमा बैलेंस", "w_win" to "जीत",
        "add_money" to "पैसे जोड़ें", "withdraw" to "निकासी", "recent" to "हाल की गतिविधि",
        "amount" to "राशि", "method" to "भुगतान का तरीका",
        "pay" to "भुगतान करें", "confirm_wd" to "निकासी की पुष्टि करें",
        "dep_rule1" to "न्यूनतम जमा \$5; मैच जॉइन करने के लिए और निकासी योग्य भी।",
        "wd_rule1" to "न्यूनतम निकासी \$10; जमा + जीत, केवल KYC-सत्यापित UPI में।",
        "refer_h" to "रेफ़र करें और कमाएं", "refer_s" to "अपने दोस्तों की जीत का 3% कमाएं — जीवनभर।",
        "profile" to "प्रोफ़ाइल", "played" to "खेले", "wins" to "जीत", "win_rate" to "जीत दर", "total_won" to "कुल जीत",
        "match_history" to "मैच इतिहास", "wallet_history" to "वॉलेट इतिहास", "logout" to "लॉग आउट",
        "won" to "आप जीते!", "lost" to "आप हारे", "retry" to "दोबारा", "loading" to "लोड हो रहा है…"
    )

    fun map(lang: String) = if (lang == "hi") hi else en
}

val LocalLang = compositionLocalOf { "en" }
val LocalStrings = compositionLocalOf { Strings.en }
