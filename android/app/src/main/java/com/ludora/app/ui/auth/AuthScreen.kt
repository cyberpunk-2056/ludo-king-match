package com.ludora.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ludora.app.ui.LocalStrings
import com.ludora.app.ui.components.GradientButton
import com.ludora.app.ui.theme.LocalLudora

@Composable
fun AuthScreen(vm: AuthViewModel = viewModel(), onToggleLang: () -> Unit, onDone: () -> Unit) {
    val c = LocalLudora.current
    val t = LocalStrings.current
    val s by vm.state.collectAsState()

    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }

    LaunchedEffect(s.done) { if (s.done) onDone() }

    Column(
        Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TextButton(onClick = onToggleLang) { Text("EN / हिं", color = c.violet, fontWeight = FontWeight.Bold) }
        Text(t["appName"] ?: "Ludora", color = c.violet, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp)
        Spacer(Modifier.height(14.dp))
        Text(if (s.signup) t["signup_h"]!! else t["login_h"]!!, color = c.fg, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text(if (s.signup) t["signup_s"]!! else t["login_s"]!!, color = c.fgDim, fontSize = 14.sp)
        Spacer(Modifier.height(18.dp))

        if (s.signup) {
            Field(t["f_name"]!!, name, { name = it })
            Spacer(Modifier.height(10.dp))
        }
        Field(t["f_phone"]!!, phone, { phone = it }, KeyboardType.Phone)
        if (s.signup) {
            Spacer(Modifier.height(10.dp))
            Field(t["f_email"]!!, email, { email = it }, KeyboardType.Email)
        }
        Spacer(Modifier.height(10.dp))
        Field(t["f_pass"]!!, pass, { pass = it }, KeyboardType.Password, password = true)

        s.error?.let { Spacer(Modifier.height(10.dp)); Text(it, color = c.red, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }

        Spacer(Modifier.height(16.dp))
        if (s.loading) {
            CircularProgressIndicator(color = c.violet)
        } else {
            GradientButton(
                if (s.signup) t["signup_btn"]!! else t["login_btn"]!!,
                Modifier.fillMaxWidth()
            ) { vm.submit(name, phone, email, pass) }
        }
        Spacer(Modifier.height(14.dp))
        TextButton(onClick = { vm.toggleMode() }) {
            Text(if (s.signup) t["to_login"]!! else t["to_signup"]!!, color = c.violet, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(10.dp))
        Text(t["legal18"]!!, color = c.muted, fontSize = 12.sp)
    }
}

@Composable
private fun Field(label: String, value: String, onChange: (String) -> Unit, type: KeyboardType = KeyboardType.Text, password: Boolean = false) {
    val c = LocalLudora.current
    Column(Modifier.fillMaxWidth()) {
        Text(label, color = c.fgDim, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(
            value = value, onValueChange = onChange, singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = type),
            visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = c.violet, unfocusedBorderColor = c.line,
                focusedTextColor = c.fg, unfocusedTextColor = c.fg, cursorColor = c.violet
            )
        )
    }
}
