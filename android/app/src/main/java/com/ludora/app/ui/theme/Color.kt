package com.ludora.app.ui.theme

import androidx.compose.ui.graphics.Color

/** Palette mirrors the web app: midnight dark + violet/indigo accent + the four Ludo colors. */
object Palette {
    // accent + semantic (same in both themes)
    val Violet = Color(0xFF8B6CFF)
    val VioletLight = Color(0xFF7A5CF5)
    val Indigo = Color(0xFF5B8DEF)
    val Red = Color(0xFFFF5A6A)
    val Green = Color(0xFF32D583)
    val Yellow = Color(0xFFFFC94D)
    val Blue = Color(0xFF4B9BFF)

    // dark surfaces
    val DarkBg = Color(0xFF080B13)
    val DarkBg2 = Color(0xFF0B0F1A)
    val DarkSurface = Color(0xFF101524)
    val DarkSurface2 = Color(0xFF161D30)
    val DarkFg = Color(0xFFF1F4FB)
    val DarkFgDim = Color(0xFF9AA5C2)
    val DarkMuted = Color(0xFF68728F)
    val DarkLine = Color(0x12FFFFFF)

    // light surfaces
    val LightBg = Color(0xFFF3F6FD)
    val LightBg2 = Color(0xFFEAEEF8)
    val LightSurface = Color(0xFFFFFFFF)
    val LightSurface2 = Color(0xFFF2F5FC)
    val LightFg = Color(0xFF131A2E)
    val LightFgDim = Color(0xFF525C78)
    val LightMuted = Color(0xFF8891AC)
    val LightLine = Color(0x17162040)
}
