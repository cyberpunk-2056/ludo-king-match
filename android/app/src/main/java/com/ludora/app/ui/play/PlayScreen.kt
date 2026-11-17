package com.ludora.app.ui.play

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.ludora.app.core.Money
import com.ludora.app.data.model.Match
import com.ludora.app.data.model.MatchResult
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.components.GhostButton
import com.ludora.app.ui.components.GradientButton
import com.ludora.app.ui.nav.Routes
import com.ludora.app.ui.theme.LocalLudora

@Composable
fun PlayScreen(nav: NavController, onToggleLang: () -> Unit, onToggleTheme: () -> Unit, vm: PlayViewModel = viewModel()) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val ui by vm.ui.collectAsState()
    LaunchedEffect(Unit) { vm.load() }

    LazyColumn(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        item {
            Spacer(Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(t["nav_play"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
                Spacer(Modifier.weight(1f))
                GradientButton("+ ${t["create_match"]}") { nav.navigate(Routes.CREATE) }
            }
            Spacer(Modifier.height(16.dp))
            SectionTitle(t["live_matches"]!!)
            if (ui.loading) LinearProgressIndicator(color = c.violet, modifier = Modifier.fillMaxWidth())
            ui.error?.let { Text(it, color = c.red, fontSize = 13.sp) }
        }
        items(ui.live) { m -> LiveRow(m) }
        item { Spacer(Modifier.height(12.dp)); SectionTitle(t["open_to_join"]!!) }
        items(ui.open) { m -> OpenRow(m) { nav.navigate(Routes.CREATE) } }
        item { Spacer(Modifier.height(12.dp)); SectionTitle(t["recent_results"]!!) }
        items(ui.recent) { r -> ResultRow(r) }
        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun SectionTitle(text: String) {
    val c = LocalLudora.current
    Text(text, color = c.fg, fontWeight = FontWeight.Bold, fontSize = 17.sp, modifier = Modifier.padding(vertical = 8.dp))
}

@Composable
private fun LiveRow(m: Match) {
    val c = LocalLudora.current
    Surface(color = c.surface, shape = RoundedCornerShape(14.dp)) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("${m.playerA}  vs  ${m.playerB}", color = c.fg, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("LIVE · ${Money.format(m.stake)} entry", color = c.red, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
            Text(Money.format(m.pot), color = c.violet, fontWeight = FontWeight.Bold)
        }
    }
    Spacer(Modifier.height(8.dp))
}

@Composable
private fun OpenRow(m: Match, onJoin: () -> Unit) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val remaining = (m.joinDeadline - System.currentTimeMillis()).coerceAtLeast(0)
    Surface(color = c.surface, shape = RoundedCornerShape(14.dp)) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(m.playerA, color = c.fg, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("${Money.mmss(remaining)} ${t["left"]}", color = c.yellow, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
            Text(Money.format(m.stake), color = c.violet, fontWeight = FontWeight.Bold)
            Spacer(Modifier.width(10.dp))
            GhostButton(t["join"]!!) { onJoin() }
        }
    }
    Spacer(Modifier.height(8.dp))
}

@Composable
private fun ResultRow(r: MatchResult) {
    val c = LocalLudora.current
    Surface(color = c.surface, shape = RoundedCornerShape(14.dp)) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("🏆 ${r.winner} beat ${r.loser}", color = c.fg, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("${Money.format(r.stake)} entry", color = c.muted, fontSize = 12.sp)
            }
            Text("+${Money.format(Money.winnerPayout(r.stake * 2))}", color = c.green, fontWeight = FontWeight.Bold)
        }
    }
    Spacer(Modifier.height(8.dp))
}
