package com.ludora.app.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.components.GhostButton
import com.ludora.app.ui.components.GradientButton
import com.ludora.app.ui.components.LudoBoard
import com.ludora.app.ui.components.SurfaceCard
import com.ludora.app.ui.nav.Routes
import com.ludora.app.ui.theme.LocalLudora

@Composable
fun HomeScreen(nav: NavController, onToggleLang: () -> Unit, onToggleTheme: () -> Unit) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TopRow(onToggleLang, onToggleTheme)
        Spacer(Modifier.height(12.dp))
        SurfaceCard {
            Text(t["appName"]!!.uppercase(), color = c.violet, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            Text(t["hero_h"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 30.sp)
            Spacer(Modifier.height(10.dp))
            Text(t["hero_s"]!!, color = c.fgDim, fontSize = 15.sp)
            Spacer(Modifier.height(16.dp))
            LudoBoard(Modifier.fillMaxWidth(0.72f).align(Alignment.CenterHorizontally))
            Spacer(Modifier.height(16.dp))
            GradientButton(t["play_a_match"]!!, Modifier.fillMaxWidth()) { nav.navigate(Routes.PLAY) }
            Spacer(Modifier.height(10.dp))
            GhostButton(t["add_money"]!!, Modifier.fillMaxWidth()) { nav.navigate(Routes.WALLET) }
        }
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            HomeStat("128K", "Players", c.violet, Modifier.weight(1f))
            HomeStat("\$4.2M", "Paid", c.green, Modifier.weight(1f))
            HomeStat("36K", "Today", c.blue, Modifier.weight(1f))
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun TopRow(onToggleLang: () -> Unit, onToggleTheme: () -> Unit) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(t["appName"]!!, color = c.violet, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
        Spacer(Modifier.weight(1f))
        TextButton(onClick = onToggleLang) { Text("EN/हिं", color = c.fgDim, fontWeight = FontWeight.Bold) }
        TextButton(onClick = onToggleTheme) { Text(if (c.isDark) "☀" else "☾", color = if (c.isDark) c.yellow else c.indigo, fontSize = 18.sp) }
    }
}

@Composable
private fun HomeStat(value: String, label: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier) {
    val c = LocalLudora.current
    SurfaceCard(modifier) {
        Text(value, color = color, fontWeight = FontWeight.ExtraBold, fontSize = 22.sp)
        Text(label, color = c.fgDim, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}
