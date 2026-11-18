package com.ludora.app.ui.play

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.ludora.app.core.Money
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.components.GradientButton
import com.ludora.app.ui.components.StatTile
import com.ludora.app.ui.components.SurfaceCard
import com.ludora.app.ui.theme.LocalLudora

@Composable
fun CreateMatchScreen(nav: NavController, vm: PlayViewModel = viewModel()) {
    val c = LocalLudora.current
    val t = LocalStrings.current

    var mode by remember { mutableStateOf(1) }
    var stakeText by remember { mutableStateOf("20") }
    var roomCode by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var working by remember { mutableStateOf(false) }

    val stake = stakeText.toDoubleOrNull() ?: 0.0
    val seats = Money.seatsForMode(mode)
    val pot = Money.pot(stake, seats)

    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = { nav.popBackStack() }) { Text("← ${t["nav_play"]}", color = c.fgDim) }
        Text(t["create_match"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
        Spacer(Modifier.height(14.dp))
        SurfaceCard {
            Text("Mode", color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            Spacer(Modifier.height(8.dp))
            listOf(1 to t["mode1"]!!, 2 to t["mode2"]!!).forEach { (id, label) ->
                Row(
                    Modifier.fillMaxWidth().selectable(selected = mode == id, onClick = { mode = id }).padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(selected = mode == id, onClick = { mode = id })
                    Text(label, color = c.fg, fontWeight = FontWeight.SemiBold)
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(t["amount"]!!, color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            OutlinedTextField(
                value = stakeText, onValueChange = { stakeText = it.filter { ch -> ch.isDigit() || ch == '.' } },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                prefix = { Text("₹", color = c.muted) },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = c.violet, unfocusedBorderColor = c.line, focusedTextColor = c.fg, unfocusedTextColor = c.fg)
            )
            Spacer(Modifier.height(10.dp))
            Text(t["rc_label"]!!, color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            OutlinedTextField(
                value = roomCode, onValueChange = { roomCode = it.filter { ch -> ch.isLetterOrDigit() }.take(20) },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                placeholder = { Text(t["rc_ph"]!!, color = c.muted) },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = c.violet, unfocusedBorderColor = c.line, focusedTextColor = c.fg, unfocusedTextColor = c.fg)
            )
            Text(t["rc_hint"]!!, color = c.muted, fontSize = 12.sp)
            Spacer(Modifier.height(14.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile(t["prize_pot"]!!, Money.format(pot), c.fg, Modifier.weight(1f))
                StatTile(t["winner_95"]!!, Money.format(Money.winnerPayout(pot)), c.green, Modifier.weight(1f))
                StatTile(t["fee_5"]!!, Money.format(Money.fee(pot)), c.fg, Modifier.weight(1f))
            }
            error?.let { Spacer(Modifier.height(10.dp)); Text(it, color = c.red, fontSize = 13.sp) }
            Spacer(Modifier.height(14.dp))
            if (working) CircularProgressIndicator(color = c.violet)
            else GradientButton(t["find_match"]!!, Modifier.fillMaxWidth(), enabled = stake >= 1.0 && roomCode.trim().length >= 4) {
                working = true; error = null
                vm.create(mode, stake, roomCode.trim(), onCreated = {
                    working = false
                    nav.popBackStack()   // in a full build this opens the match-room / room-code screen
                }, onError = { working = false; error = it })
            }
            Spacer(Modifier.height(8.dp))
            Text("You'll play in the Ludo King app using a room code. Winner gets 95% after the result is verified.", color = c.muted, fontSize = 12.sp)
        }
    }
}
