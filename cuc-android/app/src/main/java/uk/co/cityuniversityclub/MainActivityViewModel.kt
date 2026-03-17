package uk.co.cityuniversityclub

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import uk.co.cityuniversityclub.network.ApiService
import uk.co.cityuniversityclub.network.Member
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivityViewModel(application: Application) : AndroidViewModel(application) {

    // runCatching guards against GeneralSecurityException / IOException from
    // EncryptedSharedPreferences on first-run or broken Keystore. Falls back to
    // a no-op that skips persistence rather than crashing.
    private val sessionManager: ISessionManager = runCatching {
        SessionManager(application)
    }.getOrElse {
        object : ISessionManager {
            override fun saveSession(token: String, member: Member) {}
            override fun getToken(): String? = null
            override fun clearSession() {}
            override fun tryRestore(): Pair<String, Member>? = null
        }
    }

    private val userPreferences = UserPreferences(application)

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _member = MutableStateFlow<Member?>(null)
    val member: StateFlow<Member?> = _member.asStateFlow()

    private val _isRestoring = MutableStateFlow(true)
    val isRestoring: StateFlow<Boolean> = _isRestoring.asStateFlow()

    private val _displayName = MutableStateFlow(userPreferences.getDisplayName())
    val displayName: StateFlow<String> = _displayName.asStateFlow()

    var token: String? = null
        private set

    init {
        viewModelScope.launch {
            try {
                val restored = withContext(Dispatchers.IO) { sessionManager.tryRestore() }
                if (restored != null) {
                    token = restored.first
                    _member.value = restored.second
                    _isAuthenticated.value = true
                }
            } catch (_: Exception) {
                sessionManager.clearSession()
            } finally {
                _isRestoring.value = false
            }
        }
    }

    fun login(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiService.login(email, password)
                }
                token = response.session.token
                _member.value = response.member
                _isAuthenticated.value = true
                sessionManager.saveSession(response.session.token, response.member)
                onResult(true, null)
            } catch (e: Exception) {
                onResult(false, e.message ?: "Login failed")
            }
        }
    }

    fun setDisplayName(name: String) {
        userPreferences.setDisplayName(name)
        _displayName.value = name
    }

    fun logout() {
        viewModelScope.launch {
            val t = token
            if (t != null) {
                withContext(Dispatchers.IO) { ApiService.logout(t) }
            }
            token = null
            _member.value = null
            _isAuthenticated.value = false
            sessionManager.clearSession()
        }
    }
}
