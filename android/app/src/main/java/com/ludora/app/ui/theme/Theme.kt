package com.ludora.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/** Extra brand tokens not covered by Material's ColorScheme. */
data class LudoraColors(
    val bg: Color,
    val bg2: Color,
    val surface: Color,
    val surface2: Color,
    val fg: Color,
    val fgDim: Color,
    val muted: Color,
    val line: Color,
    val violet: Color,
    val indigo: Color,
    val green: Color,
    val red: Color,
    val yellow: Color,
    val blue: Color,
    val isDark: Boolean
)

val LocalLudora = staticCompositionLocalOf<LudoraColors> { error("No LudoraColors provided") }

private fun darkTokens() = LudoraColors(
    bg = Palette.DarkBg, bg2 = Palette.DarkBg2, surface = Palette.DarkSurface, surface2 = Palette.DarkSurface2,
    fg = Palette.DarkFg, fgDim = Palette.DarkFgDim, muted = Palette.DarkMuted, line = Palette.DarkLine,
    violet = Palette.Violet, indigo = Palette.Indigo, green = Palette.Green, red = Palette.Red,
    yellow = Palette.Yellow, blue = Palette.Blue, isDark = true
)

private fun lightTokens() = LudoraColors(
    bg = Palette.LightBg, bg2 = Palette.LightBg2, surface = Palette.LightSurface, surface2 = Palette.LightSurface2,
    fg = Palette.LightFg, fgDim = Palette.LightFgDim, muted = Palette.LightMuted, line = Palette.LightLine,
    violet = Palette.VioletLight, indigo = Palette.Indigo, green = Palette.Green, red = Palette.Red,
    yellow = Palette.Yellow, blue = Palette.Blue, isDark = false
)

/** themeMode: "dark" | "light" | null (follow system). */
@Composable
fun LudoraTheme(themeMode: String?, content: @Composable () -> Unit) {
    val dark = when (themeMode) {
        "dark" -> true
        "light" -> false
        else -> isSystemInDarkTheme()
    }
    val tokens = if (dark) darkTokens() else lightTokens()

    val scheme = if (dark) darkColorScheme(
        primary = tokens.violet, background = tokens.bg, surface = tokens.surface,
        onPrimary = Color.White, onBackground = tokens.fg, onSurface = tokens.fg, error = tokens.red
    ) else lightColorScheme(
        primary = tokens.violet, background = tokens.bg, surface = tokens.surface,
        onPrimary = Color.White, onBackground = tokens.fg, onSurface = tokens.fg, error = tokens.red
    )

    CompositionLocalProvider(LocalLudora provides tokens) {
        MaterialTheme(colorScheme = scheme, typography = Typography(), content = content)
    }
}
