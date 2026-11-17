package com.ludora.app.ui.wallet

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.ludora.app.core.Money
import com.ludora.app.data.model.Transaction
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.components.GhostButton
import com.ludora.app.ui.components.GradientButton
import com.ludora.app.ui.nav.Routes
import com.ludora.app.ui.theme.LocalLudora

@Composable
fun WalletScreen(nav: NavController, onToggleLang: () -> Unit, onToggleTheme: () -> Unit, vm: WalletViewModel = viewModel()) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val ui by vm.ui.collectAsState()
    LaunchedEffect(Unit) { vm.load() }

    LazyColumn(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        item {
            Spacer(Modifier.height(16.dp))
            Text(t["nav_wallet"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
            Spacer(Modifier.height(14.dp))
            // balance hero
            Surface(shape = RoundedCornerShape(22.dp), color = Color.Transparent, modifier = Modifier.fillMaxWidth()) {
                Column(
                    Modifier.background(Brush.linearGradient(listOf(Color(0xFF1F2750), Color(0xFF121634))), RoundedCornerShape(22.dp)).padding(22.dp)
                ) {
                    Text(t["w_total"]!!, color = Color(0xB3FFFFFF), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(Money.format(ui.wallet.total, ui.wallet.currency), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 40.sp)
                    Spacer(Modifier.height(16.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        SplitTile(t["w_dep"]!!, Money.format(ui.wallet.deposit), c.blue, Modifier.weight(1f))
                        SplitTile(t["w_win"]!!, Money.format(ui.wallet.winnings), c.green, Modifier.weight(1f))
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                GradientButton(t["add_money"]!!, Modifier.weight(1f)) { nav.navigate(Routes.DEPOSIT) }
                GhostButton(t["withdraw"]!!, Modifier.weight(1f)) { nav.navigate(Routes.WITHDRAW) }
            }
            Spacer(Modifier.height(18.dp))
            Text(t["recent"]!!, color = c.fg, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(Modifier.height(6.dp))
            if (ui.loading) LinearProgressIndicator(color = c.violet, modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp))
            ui.error?.let { Text(it, color = c.red, fontSize = 13.sp) }
        }
        items(ui.transactions) { tx -> TxRow(tx) }
        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun SplitTile(label: String, value: String, color: Color, modifier: Modifier) {
    Column(modifier.background(Color(0x14FFFFFF), RoundedCornerShape(14.dp)).padding(13.dp)) {
        Text(label, color = Color(0xA6FFFFFF), fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 21.sp)
    }
}

@Composable
fun TxRow(tx: Transaction) {
    val c = LocalLudora.current
    val pos = tx.amount >= 0
    Row(
        Modifier.fillMaxWidth().padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(tx.type.replaceFirstChar { it.uppercase() }, color = c.fg, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            if (tx.note.isNotBlank()) Text(tx.note, color = c.muted, fontSize = 12.sp)
        }
        Text(
            (if (pos) "+" else "") + Money.format(tx.amount),
            color = if (pos) c.green else c.red, fontWeight = FontWeight.Bold, fontSize = 14.sp
        )
    }
    Divider(color = c.line)
}
