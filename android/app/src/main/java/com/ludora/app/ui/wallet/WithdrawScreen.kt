package com.ludora.app.ui.wallet

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

@Composable
fun WithdrawScreen(nav: NavController, vm: WalletViewModel = viewModel()) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val ui by vm.ui.collectAsState()
    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(ui.completed) { if (ui.completed) nav.popBackStack() }

    var amount by remember { mutableStateOf("20") }
    val upi = vm.defaultUpi

    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = { nav.popBackStack() }) { Text("← ${t["nav_wallet"]}", color = c.fgDim) }
        Text(t["withdraw"]!!, color = c.fg, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
        Spacer(Modifier.height(14.dp))
        SurfaceCard {
            Text("${t["w_total"]}", color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            Text(Money.format(ui.wallet.total), color = c.green, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp)
            Spacer(Modifier.height(14.dp))
            Text(t["amount"]!!, color = c.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            OutlinedTextField(
                value = amount, onValueChange = { amount = it.filter { ch -> ch.isDigit() || ch == '.' } },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                prefix = { Text("₹", color = c.muted) },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = c.violet, unfocusedBorderColor = c.line, focusedTextColor = c.fg, unfocusedTextColor = c.fg)
            )
            Spacer(Modifier.height(12.dp))
            Text("${t["withdraw"]} → ", color = c.muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            if (upi != null) {
                Text("${upi.vpa}  ·  ${upi.name}  ✓", color = c.fg, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            } else {
                Text("Add a verified UPI account first.", color = c.red, fontSize = 13.sp)
            }
            ui.error?.let { Spacer(Modifier.height(8.dp)); Text(it, color = c.red, fontSize = 13.sp) }
            Spacer(Modifier.height(14.dp))
            val amt = amount.toDoubleOrNull() ?: 0.0
            val canSend = amt >= Money.MIN_WITHDRAW && amt <= ui.wallet.total + 0.001 && upi != null
            if (ui.working) CircularProgressIndicator(color = c.violet)
            else GradientButton(t["confirm_wd"]!!, Modifier.fillMaxWidth(), enabled = canSend) {
                vm.withdraw(amt, upi!!.vpa)
            }
            Spacer(Modifier.height(8.dp))
            Text(t["wd_rule1"]!!, color = c.muted, fontSize = 12.sp)
        }
    }
}
