package com.ludora.app.ui.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ludora.app.data.model.Transaction
import com.ludora.app.data.model.UpiAccount
import com.ludora.app.data.model.Wallet
import com.ludora.app.di.Graph
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WalletUi(
    val loading: Boolean = true,
    val wallet: Wallet = Wallet(),
    val transactions: List<Transaction> = emptyList(),
    val upis: List<UpiAccount> = emptyList(),
    val message: String? = null,
    val error: String? = null,
    val working: Boolean = false,
    val completed: Boolean = false
)

class WalletViewModel : ViewModel() {
    private val repo = Graph.repository
    private val _ui = MutableStateFlow(WalletUi())
    val ui: StateFlow<WalletUi> = _ui.asStateFlow()

    fun load() {
        _ui.value = _ui.value.copy(loading = true, error = null, completed = false, message = null)
        viewModelScope.launch {
            runCatching {
                val w = repo.wallet()
                val tx = repo.transactions(50)
                val upis = runCatching { repo.payoutMethods() }.getOrDefault(emptyList())
                Triple(w, tx, upis)
            }.onSuccess { (w, tx, upis) ->
                _ui.value = _ui.value.copy(loading = false, wallet = w, transactions = tx, upis = upis)
            }.onFailure { e ->
                _ui.value = _ui.value.copy(loading = false, error = e.message ?: "Could not load wallet.")
            }
        }
    }

    val defaultUpi: UpiAccount? get() = _ui.value.upis.firstOrNull { it.isDefault } ?: _ui.value.upis.firstOrNull()

    fun deposit(amount: Double, method: String, instrument: String) {
        _ui.value = _ui.value.copy(working = true, error = null)
        viewModelScope.launch {
            runCatching { repo.deposit(amount, method, instrument) }
                .onSuccess { _ui.value = _ui.value.copy(working = false, completed = true); load() }
                .onFailure { e -> _ui.value = _ui.value.copy(working = false, error = e.message ?: "Deposit failed.") }
        }
    }

    fun withdraw(amount: Double, upiId: String) {
        _ui.value = _ui.value.copy(working = true, error = null)
        viewModelScope.launch {
            runCatching { repo.withdraw(amount, upiId) }
                .onSuccess { _ui.value = _ui.value.copy(working = false, completed = true); load() }
                .onFailure { e -> _ui.value = _ui.value.copy(working = false, error = e.message ?: "Withdrawal failed.") }
        }
    }
}
