package com.cityuniclub.app

import com.cityuniclub.app.network.AuthResponse
import com.cityuniclub.app.network.Member
import com.cityuniclub.app.network.Session
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import kotlinx.coroutines.Dispatchers

/**
 * Unit tests for auth business logic. Rather than testing AndroidViewModel (which requires
 * an Application instance and Robolectric), we test the state-transition logic directly
 * using a [FakeSessionManager] and a [AuthStateMachine] — a plain class that mirrors the
 * auth logic of MainActivityViewModel without the Android lifecycle dependency.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class AuthStateMachineTest {

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var fake: FakeSessionManager

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fake = FakeSessionManager()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    // ── restore ────────────────────────────────────────────────────────────────

    @Test
    fun `restore with no saved session returns null`() {
        fake.shouldRestoreSession = false
        val result = fake.tryRestore()
        assertNull(result)
    }

    @Test
    fun `restore with saved session returns access token and member`() {
        fake.shouldRestoreSession = true
        val result = fake.tryRestore()
        assertNotNull(result)
        assertEquals("restored_access_token", result?.first)
        assertEquals("Restored User", result?.second?.fullName)
    }

    @Test
    fun `restore throws when token is expired`() {
        fake.shouldThrowOnRestore = true
        var threw = false
        try {
            fake.tryRestore()
        } catch (_: Exception) {
            threw = true
        }
        assertTrue(threw)
    }

    @Test
    fun `failed restore triggers clearSession`() {
        fake.shouldThrowOnRestore = true
        try { fake.tryRestore() } catch (_: Exception) {}
        val sm = AuthStateMachine(fake)
        sm.handleRestoreFailure()
        assertEquals(1, fake.clearSessionCallCount)
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    fun `login success sets authenticated state`() {
        val machine = AuthStateMachine(fake)
        val auth = fakeAuthResponse("id1", "Alice Smith", "alice@example.com", "Full Member")
        machine.handleLoginSuccess(auth)
        assertTrue(machine.isAuthenticated.value)
        assertEquals("Alice Smith", machine.member.value?.fullName)
        assertEquals("access_tok", machine.token)
    }

    @Test
    fun `login success saves session`() {
        val machine = AuthStateMachine(fake)
        val auth = fakeAuthResponse("id1", "Alice Smith", "alice@example.com", "Full Member")
        machine.handleLoginSuccess(auth)
        assertEquals(1, fake.saveSessionCallCount)
        assertEquals("alice@example.com", fake.getSavedMember()?.email)
        assertEquals("access_tok", fake.getSavedToken())
    }

    @Test
    fun `login failure leaves unauthenticated`() {
        val machine = AuthStateMachine(fake)
        machine.handleLoginFailure("Invalid credentials")
        assertFalse(machine.isAuthenticated.value)
        assertNull(machine.member.value)
        assertNull(machine.token)
        assertEquals(0, fake.saveSessionCallCount)
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Test
    fun `logout clears state and session`() {
        val machine = AuthStateMachine(fake)
        machine.handleLoginSuccess(fakeAuthResponse("id1", "Alice", "alice@example.com", "Full"))
        assertTrue(machine.isAuthenticated.value)

        machine.handleLogout()
        assertFalse(machine.isAuthenticated.value)
        assertNull(machine.member.value)
        assertNull(machine.token)
        assertEquals(1, fake.clearSessionCallCount)
    }

    @Test
    fun `logout without prior login still clears session`() {
        val machine = AuthStateMachine(fake)
        machine.handleLogout()
        assertFalse(machine.isAuthenticated.value)
        assertEquals(1, fake.clearSessionCallCount)
    }

    // ── restore + subsequent login ────────────────────────────────────────────

    @Test
    fun `restored session can be replaced by a fresh login`() {
        val machine = AuthStateMachine(fake)
        machine.handleRestore("token_old", fake.restoredMember)
        assertEquals("token_old", machine.token)

        machine.handleLoginSuccess(fakeAuthResponse("id2", "Bob Jones", "bob@example.com", "Associate"))
        assertEquals("Bob Jones", machine.member.value?.fullName)
        assertEquals("access_tok", machine.token)
        assertEquals(1, fake.saveSessionCallCount)
    }

    // ── FakeSessionManager self-tests ─────────────────────────────────────────

    @Test
    fun `FakeSessionManager saveSession stores values`() {
        val member = Member(id = "x", email = "x@x.com", fullName = "X User")
        fake.saveSession("acc", "ref", member)
        assertEquals(1, fake.saveSessionCallCount)
        assertEquals("acc", fake.getSavedToken())
        assertEquals("x@x.com", fake.getSavedMember()?.email)
    }

    @Test
    fun `FakeSessionManager clearSession resets call count tracking`() {
        fake.clearSession()
        assertEquals(1, fake.clearSessionCallCount)
    }

    @Test
    fun `FakeSessionManager tryRestore increments counter`() {
        fake.tryRestore()
        assertEquals(1, fake.tryRestoreCallCount)
        fake.tryRestore()
        assertEquals(2, fake.tryRestoreCallCount)
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun fakeAuthResponse(id: String, name: String, email: String, type: String) =
        AuthResponse(
            member = Member(
                id = id,
                email = email,
                fullName = name,
                firstName = name.split(" ").first(),
                membershipNumber = "M001",
                membershipType = type
            ),
            session = Session(
                token = "access_tok",
                refreshToken = "refresh_tok",
                expiresAt = "2026-12-31T23:59:59Z"
            )
        )
}

/**
 * Pure state machine mirroring the auth transitions in MainActivityViewModel.
 * No Android dependencies — fully testable on the JVM.
 */
class AuthStateMachine(private val sessionManager: ISessionManager) {

    val isAuthenticated = MutableStateFlow(false)
    val member = MutableStateFlow<Member?>(null)
    var token: String? = null
        private set

    fun handleRestore(accessToken: String, restoredMember: Member) {
        token = accessToken
        member.value = restoredMember
        isAuthenticated.value = true
    }

    fun handleRestoreFailure() {
        sessionManager.clearSession()
    }

    fun handleLoginSuccess(auth: AuthResponse) {
        token = auth.session.token
        member.value = auth.member
        isAuthenticated.value = true
        sessionManager.saveSession(auth.session.token, auth.session.refreshToken, auth.member)
    }

    fun handleLoginFailure(@Suppress("UNUSED_PARAMETER") error: String) {
        // State stays unauthenticated — no changes needed
    }

    fun handleLogout() {
        token = null
        member.value = null
        isAuthenticated.value = false
        sessionManager.clearSession()
    }
}
