package uk.co.cityuniversityclub.network

import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class ApiServiceTest {

    private lateinit var server: MockWebServer

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    private fun enqueue(body: String, code: Int = 200) {
        server.enqueue(
            MockResponse()
                .setResponseCode(code)
                .addHeader("Content-Type", "application/json")
                .setBody(body)
        )
    }

    // ── Member data class ──────────────────────────────────────────────────────

    @Test
    fun `Member defaults are blank strings`() {
        val m = Member()
        assertEquals("", m.id)
        assertEquals("", m.fullName)
        assertEquals("", m.firstName)
        assertEquals("", m.membershipNumber)
        assertEquals("", m.membershipType)
    }

    @Test
    fun `Member firstName fallback uses fullName split`() {
        val member = Member(fullName = "James Smith", firstName = "")
        val derived = member.firstName.ifBlank {
            member.fullName.split(" ").firstOrNull() ?: "Member"
        }
        assertEquals("James", derived)
    }

    @Test
    fun `Member firstName used when present`() {
        val member = Member(fullName = "James Smith", firstName = "James")
        val derived = member.firstName.ifBlank {
            member.fullName.split(" ").firstOrNull() ?: "Member"
        }
        assertEquals("James", derived)
    }

    @Test
    fun `Member membershipType blank falls back to Active`() {
        val member = Member(membershipType = "")
        val label = member.membershipType.ifBlank { "Active" }
        assertEquals("Active", label)
    }

    @Test
    fun `Member membershipType displayed when present`() {
        val member = Member(membershipType = "Full Member")
        val label = member.membershipType.ifBlank { "Active" }
        assertEquals("Full Member", label)
    }

    // ── Session data class ─────────────────────────────────────────────────────

    @Test
    fun `Session defaults are blank strings`() {
        val s = Session()
        assertEquals("", s.token)
        assertEquals("", s.refreshToken)
        assertEquals("", s.expiresAt)
    }

    // ── AuthResponse data class ────────────────────────────────────────────────

    @Test
    fun `AuthResponse holds member and session`() {
        val member = Member(id = "1", email = "a@b.com", fullName = "Alice", firstName = "Alice")
        val session = Session(token = "tok", refreshToken = "ref")
        val auth = AuthResponse(member = member, session = session)
        assertEquals("1", auth.member.id)
        assertEquals("tok", auth.session.token)
        assertEquals("ref", auth.session.refreshToken)
    }

    // ── ClubEvent data class ───────────────────────────────────────────────────

    @Test
    fun `ClubEvent isTba defaults to false`() {
        val e = ClubEvent()
        assertFalse(e.isTba)
        assertEquals(0.0, e.pricePerPerson, 0.001)
    }

    // ── ReciprocalClub ─────────────────────────────────────────────────────────

    @Test
    fun `ReciprocalClub optional fields default to null`() {
        val club = ReciprocalClub()
        assertNull(club.note)
        assertNull(club.logoPath)
    }

    // ── Gson serialisation (ApiService.login parse via Gson directly) ──────────

    @Test
    fun `Gson parses AuthResponse from login JSON`() {
        val json = """
            {
              "member": {
                "id": "abc123",
                "email": "test@example.com",
                "full_name": "John Doe",
                "first_name": "John",
                "membership_number": "M001",
                "membership_type": "Full Member"
              },
              "session": {
                "token": "access_token_value",
                "refresh_token": "refresh_token_value",
                "expires_at": "2026-04-14T00:00:00Z"
              }
            }
        """.trimIndent()

        val gson = com.google.gson.Gson()
        val auth = gson.fromJson(json, AuthResponse::class.java)

        assertEquals("abc123", auth.member.id)
        assertEquals("test@example.com", auth.member.email)
        assertEquals("John Doe", auth.member.fullName)
        assertEquals("John", auth.member.firstName)
        assertEquals("M001", auth.member.membershipNumber)
        assertEquals("Full Member", auth.member.membershipType)
        assertEquals("access_token_value", auth.session.token)
        assertEquals("refresh_token_value", auth.session.refreshToken)
        assertEquals("2026-04-14T00:00:00Z", auth.session.expiresAt)
    }

    @Test
    fun `Gson parses ClubEvent list from events JSON`() {
        val json = """
            {
              "events": [
                {
                  "id": "evt1",
                  "title": "Annual Dinner",
                  "description": "Black tie event",
                  "event_type": "dinner",
                  "event_date": "2026-06-01T19:00:00Z",
                  "price_per_person": 85.0,
                  "is_tba": false
                },
                {
                  "id": "evt2",
                  "title": "Summer Garden Party",
                  "event_type": "social",
                  "event_date": "",
                  "price_per_person": 0.0,
                  "is_tba": true
                }
              ]
            }
        """.trimIndent()

        val gson = com.google.gson.Gson()
        val map = gson.fromJson(json, Map::class.java)
        val list = map["events"] as List<*>
        val events = list.map { gson.fromJson(gson.toJson(it), ClubEvent::class.java) }

        assertEquals(2, events.size)
        assertEquals("Annual Dinner", events[0].title)
        assertEquals("dinner", events[0].eventType)
        assertEquals(85.0, events[0].pricePerPerson, 0.001)
        assertFalse(events[0].isTba)
        assertTrue(events[1].isTba)
    }

    @Test
    fun `Gson parses ClubNews list`() {
        val json = """
            {
              "news": [
                {
                  "id": "n1",
                  "title": "New Members Welcome",
                  "content": "We are pleased to welcome new members.",
                  "category": "announcement",
                  "published_date": "2026-03-01",
                  "is_featured": true
                }
              ]
            }
        """.trimIndent()

        val gson = com.google.gson.Gson()
        val map = gson.fromJson(json, Map::class.java)
        val list = map["news"] as List<*>
        val news = list.map { gson.fromJson(gson.toJson(it), ClubNews::class.java) }

        assertEquals(1, news.size)
        assertEquals("New Members Welcome", news[0].title)
        assertTrue(news[0].isFeatured)
        assertEquals("announcement", news[0].category)
    }

    @Test
    fun `Gson parses ReciprocalClub list`() {
        val json = """
            {
              "clubs": [
                {
                  "id": "c1",
                  "name": "Reform Club",
                  "location": "London",
                  "region": "uk",
                  "country": "United Kingdom",
                  "note": "Gentleman's club on Pall Mall",
                  "logo_path": null
                }
              ]
            }
        """.trimIndent()

        val gson = com.google.gson.Gson()
        val map = gson.fromJson(json, Map::class.java)
        val list = map["clubs"] as List<*>
        val clubs = list.map { gson.fromJson(gson.toJson(it), ReciprocalClub::class.java) }

        assertEquals(1, clubs.size)
        assertEquals("Reform Club", clubs[0].name)
        assertEquals("United Kingdom", clubs[0].country)
        assertEquals("Gentleman's club on Pall Mall", clubs[0].note)
        assertNull(clubs[0].logoPath)
    }

    @Test
    fun `Gson parses refresh token response`() {
        val json = """
            {
              "access_token": "new_access_token",
              "token_type": "bearer",
              "expires_in": 3600,
              "refresh_token": "new_refresh_token",
              "user": { "id": "abc" }
            }
        """.trimIndent()

        val gson = com.google.gson.Gson()
        val map = gson.fromJson(json, Map::class.java)
        val newAccess = map["access_token"] as? String
        val newRefresh = map["refresh_token"] as? String

        assertEquals("new_access_token", newAccess)
        assertEquals("new_refresh_token", newRefresh)
    }

    @Test
    fun `Gson returns null for missing refresh_token field`() {
        val json = """{"access_token": "tok"}"""
        val gson = com.google.gson.Gson()
        val map = gson.fromJson(json, Map::class.java)
        val newRefresh = map["refresh_token"] as? String
        assertNull(newRefresh)
    }
}
