package com.ludora.app.ui.wallet

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
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
import com.ludora.app.ui.components.SurfaceCard
import com.ludora.app.ui.theme.LocalLudora

private val METHODS = listOf("upi" to "UPI", "card" to "Card", "bank" to "Net banking")
private val PRESETS = listOf(10.0, 25.0, 50.0, 100.0, 250.0)

@Composable
fun DepositScreen(nav: NavController, vm: WalletViewModel = viewModel()) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val ui by vm.ui.collectAsState()
    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(ui.completed) { if (ui.completed) nav.popBackStack() }

    var amount by remember { mutableStateOf("50") }
    var method by remember { mutableStateOf("upi") }
    var instrument by remember { mutableStateOf("") } // upi id / card number (demo)

    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = { nav.popBackStack() }) { Text("← ${t["nav_wallet"]}", color = c.fgDim) }
        Text(t["add_money"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
        Spacer(Modifier.height(14.dp))
        SurfaceCard {
            Text(t["amount"]!!, color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            OutlinedTextField(
                value = amount, onValueChange = { amount = it.filter { ch -> ch.isDigit() || ch == '.' } },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                prefix = { Text("₹", color = c.muted) },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = c.violet, unfocusedBorderColor = c.line, focusedTextColor = c.fg, unfocusedTextColor = c.fg)
            )
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PRESETS.forEach { v ->
                    AssistChip(onClick = { amount = v.toInt().toString() }, label = { Text("₹${v.toInt()}") })
                }
            }
            Spacer(Modifier.height(18.dp))
            Text(t["method"]!!, color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            Spacer(Modifier.height(8.dp))
            METHODS.forEach { (id, label) ->
                Row(
                    Modifier.fillMaxWidth().selectable(selected = method == id, onClick = { method = id }).padding(vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(selected = method == id, onClick = { method = id })
                    Text(label, color = c.fg, fontWeight = FontWeight.SemiBold)
                }
            }
            if (method != "bank") {
                OutlinedTextField(
                    value = instrument, onValueChange = { instrument = it },
                    label = { Text(if (method == "upi") "Your UPI ID" else "Card number") },
                    singleLine = true, modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = c.violet, unfocusedBorderColor = c.line, focusedTextColor = c.fg, unfocusedTextColor = c.fg)
                )
            }
            ui.error?.let { Spacer(Modifier.height(8.dp)); Text(it, color = c.red, fontSize = 13.sp) }
            Spacer(Modifier.height(14.dp))
            val amt = amount.toDoubleOrNull() ?: 0.0
            if (ui.working) CircularProgressIndicator(color = c.violet)
            else GradientButton("${t["pay"]} ${Money.format(amt)}", Modifier.fillMaxWidth(), enabled = amt >= Money.MIN_DEPOSIT) {
                vm.deposit(amt, method, instrument)
            }
            Spacer(Modifier.height(8.dp))
            Text(t["dep_rule1"]!!, color = c.muted, fontSize = 12.sp)
        }
    }
}
