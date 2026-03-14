package com.cityuniclub.app

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.cityuniclub.app.network.ApiService
import com.cityuniclub.app.network.Member
import com.google.gson.Gson

class SessionManager(context: Context) : ISessionManager {

    companion object {
        private const val PREFS_NAME = "cuc_session"
        private const val KEY_TOKEN = "token"
        private const val KEY_MEMBER_JSON = "member_json"
    }

    private val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)

    private val prefs = EncryptedSharedPreferences.create(
        PREFS_NAME,
        masterKeyAlias,
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val gson = Gson()

    override fun saveSession(token: String, member: Member) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_MEMBER_JSON, gson.toJson(member))
            .apply()
    }

    override fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    override fun clearSession() {
        prefs.edit().clear().apply()
    }

    override fun tryRestore(): Pair<String, Member>? {
        val token = prefs.getString(KEY_TOKEN, null) ?: return null
        val statusResponse = ApiService.checkStatus(token)
        return Pair(token, statusResponse)
    }
}
