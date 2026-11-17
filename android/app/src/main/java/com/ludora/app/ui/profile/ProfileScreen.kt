package com.ludora.app.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.ludora.app.core.Money
import com.ludora.app.data.model.User
import com.ludora.app.di.Graph
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.components.GhostButton
import com.ludora.app.ui.components.StatTile
import com.ludora.app.ui.theme.LocalLudora
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val repo = Graph.repository
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user
    fun load() { viewModelScope.launch { runCatching { repo.me() }.onSuccess { _user.value = it } } }
    fun logout(done: () -> Unit) { viewModelScope.launch { repo.logout(); done() } }
}

@Composable
fun ProfileScreen(nav: NavController, onToggleLang: () -> Unit, onToggleTheme: () -> Unit, onLoggedOut: () -> Unit, vm: ProfileViewModel = viewModel()) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val user by vm.user.collectAsState()
    LaunchedEffect(Unit) { vm.load() }
    val u = user ?: User()

    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(t["profile"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
            Spacer(Modifier.weight(1f))
            TextButton(onClick = onToggleLang) { Text("EN/हिं", color = c.fgDim, fontWeight = FontWeight.Bold) }
            TextButton(onClick = onToggleTheme) { Text(if (c.isDark) "☀" else "☾", color = if (c.isDark) c.yellow else c.indigo, fontSize = 18.sp) }
        }
        Spacer(Modifier.height(10.dp))
        Surface(color = c.surface, shape = RoundedCornerShape(18.dp)) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(56.dp).background(Brush.linearGradient(listOf(c.violet, c.indigo)), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) { Text(u.name.take(1).uppercase(), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 24.sp) }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(u.name, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                    val tail = if (u.phone.length >= 4) "•••• " + u.phone.takeLast(4) else "—"
                    Text("$tail · since ${u.joinedYear}", color = c.muted, fontSize = 12.sp)
                }
                Text("★ ${u.rating}", color = c.violet, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile(t["played"]!!, u.stats.played.toString(), c.fg, Modifier.weight(1f))
            StatTile(t["wins"]!!, u.stats.wins.toString(), c.green, Modifier.weight(1f))
            StatTile(t["win_rate"]!!, "${u.stats.winRate}%", c.violet, Modifier.weight(1f))
            StatTile(t["total_won"]!!, Money.format(u.stats.totalWon), c.yellow, Modifier.weight(1f))
        }
        Spacer(Modifier.height(14.dp))
        LinkRow("🎮 " + t["match_history"]!!)
        LinkRow("👛 " + t["wallet_history"]!!)
        LinkRow("🎁 " + t["refer_h"]!!)
        Spacer(Modifier.height(14.dp))
        GhostButton(t["logout"]!!, Modifier.fillMaxWidth()) { vm.logout(onLoggedOut) }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun LinkRow(label: String) {
    val c = LocalLudora.current
    Surface(color = c.surface, shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(label, color = c.fg, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, modifier = Modifier.weight(1f))
            Text("›", color = c.muted, fontSize = 20.sp)
        }
    }
}
