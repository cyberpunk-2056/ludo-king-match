package com.ludora.app.ui.play

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ludora.app.data.model.Match
import com.ludora.app.data.model.MatchResult
import com.ludora.app.di.Graph
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PlayUi(
    val loading: Boolean = true,
    val live: List<Match> = emptyList(),
    val open: List<Match> = emptyList(),
    val recent: List<MatchResult> = emptyList(),
    val error: String? = null
)

class PlayViewModel : ViewModel() {
    private val repo = Graph.repository
    private val _ui = MutableStateFlow(PlayUi())
    val ui: StateFlow<PlayUi> = _ui.asStateFlow()

    fun load() {
        _ui.value = _ui.value.copy(loading = true, error = null)
        viewModelScope.launch {
            runCatching {
                Triple(repo.liveMatches(), repo.openMatches(), repo.recentResults())
            }.onSuccess { (live, open, recent) ->
                _ui.value = PlayUi(loading = false, live = live, open = open, recent = recent)
            }.onFailure { e ->
                _ui.value = _ui.value.copy(loading = false, error = e.message ?: "Could not load matches.")
            }
        }
    }

    fun create(mode: Int, stake: Double, onCreated: (Match) -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            runCatching { repo.createMatch(mode, stake) }
                .onSuccess(onCreated)
                .onFailure { onError(it.message ?: "Could not create match.") }
        }
    }
}
