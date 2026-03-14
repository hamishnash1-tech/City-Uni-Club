package com.cityuniclub.app

import com.cityuniclub.app.network.Member

interface ISessionManager {
    fun saveSession(accessToken: String, refreshToken: String, member: Member)
    fun clearSession()
    fun tryRestore(): Pair<String, Member>?
}
