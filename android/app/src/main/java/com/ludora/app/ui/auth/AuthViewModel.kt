package com.ludora.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ludora.app.di.Graph
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthState(
    val signup: Boolean = false,
    val loading: Boolean = false,
    val error: String? = null,
    val done: Boolean = false
)

class AuthViewModel : ViewModel() {
    private val repo = Graph.repository
    private val _state = MutableStateFlow(AuthState())
    val state: StateFlow<AuthState> = _state.asStateFlow()

    fun toggleMode() { _state.value = _state.value.copy(signup = !_state.value.signup, error = null) }

    private fun digits(s: String) = s.filter { it.isDigit() }

    fun submit(name: String, phone: String, email: String, password: String) {
        val p = digits(phone)
        val s = _state.value
        if (p.length < 10) { _state.value = s.copy(error = "Enter a valid phone number."); return }
        if (password.length < 4) { _state.value = s.copy(error = "Password must be at least 4 characters."); return }
        if (s.signup) {
            if (name.trim().length < 2) { _state.value = s.copy(error = "Enter your name."); return }
            if (!Regex("^\\S+@\\S+\\.\\S+$").matches(email.trim())) { _state.value = s.copy(error = "Enter a valid email."); return }
        }
        _state.value = s.copy(loading = true, error = null)
        viewModelScope.launch {
            runCatching {
                if (s.signup) repo.signup(name.trim(), p, email.trim(), password)
                else repo.login(p, password)
            }.onSuccess {
                _state.value = _state.value.copy(loading = false, done = true)
            }.onFailure { e ->
                _state.value = _state.value.copy(loading = false, error = e.message ?: "Something went wrong. Try again.")
            }
        }
    }
}
