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
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
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

    override fun saveSession(accessToken: String, refreshToken: String, member: Member) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .putString(KEY_MEMBER_JSON, gson.toJson(member))
            .apply()
    }

    override fun clearSession() {
        prefs.edit().clear().apply()
    }

    override fun tryRestore(): Pair<String, Member>? {
        val storedRefreshToken = prefs.getString(KEY_REFRESH_TOKEN, null) ?: return null
        val memberJson = prefs.getString(KEY_MEMBER_JSON, null) ?: return null
        val member = try { gson.fromJson(memberJson, Member::class.java) } catch (_: Exception) { return null }

        val (newAccessToken, newRefreshToken) = ApiService.refreshAccessToken(storedRefreshToken)

        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, newAccessToken)
            .putString(KEY_REFRESH_TOKEN, newRefreshToken)
            .apply()

        return Pair(newAccessToken, member)
    }
}
