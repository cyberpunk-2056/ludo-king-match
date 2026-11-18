package com.ludora.app.ui.theme

import androidx.compose.ui.graphics.Color

/** Bold esports palette, mirrors the web + Expo apps: near-black navy, royal-blue
 *  accent, gold for prizes/winners (Yellow), emerald for cash. */
object Palette {
    // accent + semantic (same in both themes)
    val Violet = Color(0xFF4C84FF)       // royal-blue primary accent
    val VioletLight = Color(0xFF2457E6)
    val Indigo = Color(0xFF6FA0FF)
    val Red = Color(0xFFFF5B6E)
    val Green = Color(0xFF2BD98A)
    val Yellow = Color(0xFFFFC53D)       // gold — prizes / winners / rank
    val Blue = Color(0xFF6FA0FF)

    // dark surfaces
    val DarkBg = Color(0xFF060912)
    val DarkBg2 = Color(0xFF090D18)
    val DarkSurface = Color(0xFF0E1322)
    val DarkSurface2 = Color(0xFF141C30)
    val DarkFg = Color(0xFFEEF2FC)
    val DarkFgDim = Color(0xFF97A3C2)
    val DarkMuted = Color(0xFF5C688A)
    val DarkLine = Color(0x2482A0E6)

    // light surfaces
    val LightBg = Color(0xFFEEF2FB)
    val LightBg2 = Color(0xFFE4EAF7)
    val LightSurface = Color(0xFFFFFFFF)
    val LightSurface2 = Color(0xFFF3F6FD)
    val LightFg = Color(0xFF0E1526)
    val LightFgDim = Color(0xFF46506C)
    val LightMuted = Color(0xFF808BA6)
    val LightLine = Color(0x1F121C38)
}
