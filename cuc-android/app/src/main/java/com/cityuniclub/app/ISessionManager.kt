package com.cityuniclub.app

import com.cityuniclub.app.network.Member

interface ISessionManager {
    fun saveSession(token: String, member: Member)
    fun getToken(): String?
    fun clearSession()
    fun tryRestore(): Pair<String, Member>?
}
