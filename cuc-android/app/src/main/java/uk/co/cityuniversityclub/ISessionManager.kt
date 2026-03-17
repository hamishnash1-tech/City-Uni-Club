package uk.co.cityuniversityclub

import uk.co.cityuniversityclub.network.Member

interface ISessionManager {
    fun saveSession(token: String, member: Member)
    fun getToken(): String?
    fun clearSession()
    fun tryRestore(): Pair<String, Member>?
}
