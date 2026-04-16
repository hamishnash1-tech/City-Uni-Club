package uk.co.cityuniversityclub

import uk.co.cityuniversityclub.network.Member

class FakeSessionManager : ISessionManager {

    private var savedToken: String? = null
    private var savedMember: Member? = null

    var shouldRestoreSession: Boolean = false
    var restoredAccessToken: String = "restored_access_token"
    var restoredMember: Member = Member(
        id = "restored_id",
        email = "restored@example.com",
        firstName = "Restored",
        lastName = "User",
        membershipNumber = "R001",
        membershipType = "Full Member"
    )

    var shouldThrowOnRestore: Boolean = false

    var saveSessionCallCount = 0
    var clearSessionCallCount = 0
    var tryRestoreCallCount = 0

    override fun saveSession(token: String, member: Member) {
        saveSessionCallCount++
        savedToken = token
        savedMember = member
    }

    override fun getToken(): String? = savedToken

    override fun clearSession() {
        clearSessionCallCount++
        savedToken = null
        savedMember = null
    }

    override fun tryRestore(): Pair<String, Member>? {
        tryRestoreCallCount++
        if (shouldThrowOnRestore) throw Exception("Token expired")
        return if (shouldRestoreSession) Pair(restoredAccessToken, restoredMember) else null
    }

    fun getSavedMember(): Member? = savedMember
    fun getSavedToken(): String? = savedToken
}
