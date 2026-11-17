package com.ludora.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ludora.app.ui.theme.LocalLudora
import com.ludora.app.ui.theme.Palette

/** A filled accent button with the violet→indigo gradient. */
@Composable
fun GradientButton(text: String, modifier: Modifier = Modifier, enabled: Boolean = true, onClick: () -> Unit) {
    val c = LocalLudora.current
    Button(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(14.dp),
        contentPadding = PaddingValues(vertical = 14.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, disabledContainerColor = Color.Transparent),
        modifier = modifier.background(
            brush = if (enabled) Brush.horizontalGradient(listOf(c.violet, c.indigo))
            else Brush.horizontalGradient(listOf(c.muted, c.muted)),
            shape = RoundedCornerShape(14.dp)
        )
    ) {
        Text(text, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
    }
}

@Composable
fun GhostButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val c = LocalLudora.current
    OutlinedButton(
        onClick = onClick,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, c.line),
        colors = ButtonDefaults.outlinedButtonColors(containerColor = c.surface2),
        contentPadding = PaddingValues(vertical = 14.dp),
        modifier = modifier
    ) { Text(text, color = c.fg, fontWeight = FontWeight.SemiBold, fontSize = 15.sp) }
}

/** Card surface with the app's ring/shadow look. */
@Composable
fun SurfaceCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    val c = LocalLudora.current
    Surface(
        color = c.surface,
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.dp, c.line),
        modifier = modifier
    ) { Column(Modifier.padding(18.dp), content = content) }
}

/** A small stat tile (used on Profile and payout preview). */
@Composable
fun StatTile(label: String, value: String, valueColor: Color? = null, modifier: Modifier = Modifier) {
    val c = LocalLudora.current
    Surface(color = c.bg2, shape = RoundedCornerShape(14.dp), border = BorderStroke(1.dp, c.line), modifier = modifier) {
        Column(Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, color = valueColor ?: c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
            Spacer(Modifier.height(4.dp))
            Text(label, color = c.muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
    }
}

/**
 * Original Ludo board: four colored corner bases, white cross arms and a central
 * pinwheel. Drawn from scratch on Canvas — not anyone's branded artwork.
 */
@Composable
fun LudoBoard(modifier: Modifier = Modifier) {
    val c = LocalLudora.current
    Canvas(modifier = modifier.aspectRatio(1f)) {
        val s = size.minDimension
        val cell = s / 15f
        fun r(x: Float, y: Float, w: Float, h: Float, color: Color, rad: Float = cell * 0.4f) =
            drawRoundRect(color, Offset(x, y), Size(w, h), CornerRadius(rad, rad))

        // board background
        r(0f, 0f, s, s, c.surface2, cell)
        val bases = cell * 6
        // corners: red TL, green TR, blue BL, yellow BR
        r(0f, 0f, bases, bases, Palette.Red)
        r(s - bases, 0f, bases, bases, Palette.Green)
        r(0f, s - bases, bases, bases, Palette.Blue)
        r(s - bases, s - bases, bases, bases, Palette.Yellow)
        // inner white pockets
        val pad = cell
        r(pad, pad, bases - 2 * pad, bases - 2 * pad, c.surface)
        r(s - bases + pad, pad, bases - 2 * pad, bases - 2 * pad, c.surface)
        r(pad, s - bases + pad, bases - 2 * pad, bases - 2 * pad, c.surface)
        r(s - bases + pad, s - bases + pad, bases - 2 * pad, bases - 2 * pad, c.surface)
        // colored home lanes along each arm
        val arm = cell * 6
        r(arm + cell, cell, cell, arm - cell, Palette.Green)       // top
        r(cell, arm + cell, arm - cell, cell, Palette.Red)          // left
        r(s - arm, arm + cell, arm - cell, cell, Palette.Yellow)    // right
        r(arm + cell, s - arm, cell, arm - cell, Palette.Blue)      // bottom
        // centre pinwheel (four triangles meeting at the middle)
        val a = arm; val b = s - arm; val mid = s / 2f
        fun tri(p1: Offset, p2: Offset, color: Color) {
            val path = Path().apply { moveTo(p1.x, p1.y); lineTo(p2.x, p2.y); lineTo(mid, mid); close() }
            drawPath(path, color)
        }
        tri(Offset(a, a), Offset(b, a), Palette.Green)
        tri(Offset(b, a), Offset(b, b), Palette.Yellow)
        tri(Offset(b, b), Offset(a, b), Palette.Blue)
        tri(Offset(a, b), Offset(a, a), Palette.Red)
    }
}
