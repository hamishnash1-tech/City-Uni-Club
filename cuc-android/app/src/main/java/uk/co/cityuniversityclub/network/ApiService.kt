package uk.co.cityuniversityclub.network

import android.net.Uri
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI5NDAsImV4cCI6MjA4Nzc3ODk0MH0._OhoEKRYAZ0C7oon9e_WSj7p47pJlWQmqBgx2CtBtdg"
const val APP_VERSION = "0.1.7"
private const val SUPABASE_BASE = "https://myfoyoyjtkqthjjvabmn.supabase.co"
private const val API_BASE = "$SUPABASE_BASE/functions/v1"
private const val LOI_API_URL = "$API_BASE/loi-api"

// ——— Data models (matching web api.ts) ———

data class Member(
    val id: String = "",
    val email: String = "",
    @SerializedName("full_name") val fullName: String = "",
    @SerializedName("first_name") val firstName: String = "",
    @SerializedName("membership_number") val membershipNumber: String = "",
    @SerializedName("membership_type") val membershipType: String = ""
)

data class Session(
    val token: String = "",
    @SerializedName("refresh_token") val refreshToken: String = "",
    @SerializedName("expires_at") val expiresAt: String = ""
)

data class AuthResponse(
    val member: Member = Member(),
    val session: Session = Session()
)

data class ClubEvent(
    val id: String = "",
    val title: String = "",
    val description: String? = null,
    @SerializedName("event_type") val eventType: String = "",
    @SerializedName("event_date") val eventDate: String = "",
    @SerializedName("price_per_person") val pricePerPerson: Double = 0.0,
    @SerializedName("is_tba") val isTba: Boolean = false
)

data class ClubNews(
    val id: String = "",
    val title: String = "",
    val content: String = "",
    val category: String = "",
    @SerializedName("published_date") val publishedDate: String = "",
    @SerializedName("is_featured") val isFeatured: Boolean = false
)

data class ReciprocalClub(
    val id: String = "",
    val name: String = "",
    val location: String = "",
    val region: String = "",
    val country: String = "",
    val note: String? = null,
    @SerializedName("logo_path") val logoPath: String? = null
)

data class CountryCount(val country: String = "", val count: Int = 0)
data class CityCount(val city: String = "", val count: Int = 0)

// ——— API service (mirrors web api.ts exactly) ———

object ApiService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val JSON_TYPE = "application/json; charset=utf-8".toMediaType()

    private fun get(url: String, token: String? = null): String {
        val req = Request.Builder().url(url)
            .addHeader("apikey", SUPABASE_ANON_KEY)
            .addHeader("X-App-Version", APP_VERSION)
            .apply { if (token != null) addHeader("Authorization", "Bearer $token") }
            .build()
        val resp = client.newCall(req).execute()
        val body = resp.body?.string() ?: ""
        if (!resp.isSuccessful) throw Exception(body)
        return body
    }

    private fun post(url: String, payload: Any, extraHeaders: Map<String, String> = emptyMap()): String {
        val body = gson.toJson(payload).toRequestBody(JSON_TYPE)
        val req = Request.Builder().url(url).post(body)
            .addHeader("Content-Type", "application/json")
            .addHeader("apikey", SUPABASE_ANON_KEY)
            .addHeader("X-App-Version", APP_VERSION)
            .apply { extraHeaders.forEach { (k, v) -> addHeader(k, v) } }
            .build()
        val resp = client.newCall(req).execute()
        val respBody = resp.body?.string() ?: ""
        if (!resp.isSuccessful) {
            val errMsg = try { gson.fromJson(respBody, HashHashMap::class.java)["error"] as? String } catch (_: Exception) { null }
            throw Exception(errMsg ?: respBody)
        }
        return respBody
    }

    private fun <T> parseList(json: String, key: String, cls: Class<T>): List<T> {
        val map = gson.fromJson(json, HashHashMap::class.java)
        val list = map[key] as? List<*> ?: return emptyList()
        return list.map { gson.fromJson(gson.toJson(it), cls) }
    }

    // — Auth —

    fun checkStatus(token: String): Member {
        val req = Request.Builder().url("$API_BASE/status")
            .addHeader("apikey", SUPABASE_ANON_KEY)
            .addHeader("x-session-token", token)
            .addHeader("X-App-Version", APP_VERSION)
            .build()
        val resp = client.newCall(req).execute()
        val body = resp.body?.string() ?: ""
        if (!resp.isSuccessful) throw Exception("Session expired")
        val map = gson.fromJson(body, HashMap::class.java)
        val memberMap = map["member"] ?: throw Exception("No member data")
        return gson.fromJson(gson.toJson(memberMap), Member::class.java)
    }

    fun login(email: String, password: String): AuthResponse =
        gson.fromJson(
            post("$API_BASE/login", mapOf("email" to email, "password" to password, "session_type" to "supersession")),
            AuthResponse::class.java
        )

    fun logout(token: String) {
        try { post("$API_BASE/logout", emptyMap<String, String>(), mapOf("Authorization" to "Bearer $token")) }
        catch (_: Exception) {}
    }

    // — Events —

    fun getEvents(): List<ClubEvent> =
        parseList(get("$API_BASE/events"), "events", ClubEvent::class.java)

    fun bookEvent(token: String, eventId: String, memberEmail: String, guestCount: Int, mealOption: String?, specialRequests: String?): Map<*, *> {
        val payload = mutableMapOf<String, Any?>(
            "event_id" to eventId,
            "member_email" to memberEmail,
            "guest_count" to guestCount
        )
        if (mealOption != null) payload["meal_option"] = mealOption
        if (!specialRequests.isNullOrBlank()) payload["special_requests"] = specialRequests
        val headers = mapOf("x-session-token" to token)
        return gson.fromJson(post("$API_BASE/events/book", payload, headers), HashHashMap::class.java)
    }

    // — News —

    fun getNews(): List<ClubNews> =
        parseList(get("$API_BASE/news"), "news", ClubNews::class.java)

    // — Clubs —

    fun getClubRegionCounts(token: String): Map<String, Int> {
        val map = gson.fromJson(get("$API_BASE/clubs", token), HashMap::class.java)
        @Suppress("UNCHECKED_CAST")
        return (map["regions"] as? Map<String, Double>)?.mapValues { it.value.toInt() } ?: emptyMap()
    }

    fun getClubCountryCounts(token: String, regions: List<String>): List<CountryCount> {
        val enc = Uri.encode(regions.joinToString(","))
        return parseList(get("$API_BASE/clubs?regions=$enc", token), "countries", CountryCount::class.java)
    }

    fun getClubsByCountry(token: String, regions: List<String>, country: String): List<ReciprocalClub> {
        val enc = Uri.encode(regions.joinToString(","))
        val c = Uri.encode(country)
        return parseList(get("$API_BASE/clubs?regions=$enc&country=$c&all_clubs=true", token), "clubs", ReciprocalClub::class.java)
    }

    fun getClubCityCounts(token: String, regions: List<String>, country: String): List<CityCount> {
        val enc = Uri.encode(regions.joinToString(","))
        val c = Uri.encode(country)
        return parseList(get("$API_BASE/clubs?regions=$enc&country=$c", token), "cities", CityCount::class.java)
    }

    fun getClubsByCity(token: String, regions: List<String>, country: String, city: String): List<ReciprocalClub> {
        val enc = Uri.encode(regions.joinToString(","))
        val c = Uri.encode(country)
        val ct = Uri.encode(city)
        return parseList(get("$API_BASE/clubs?regions=$enc&country=$c&city=$ct", token), "clubs", ReciprocalClub::class.java)
    }

    fun getClubsExcludingCity(token: String, regions: List<String>, country: String, excludeCity: String): List<ReciprocalClub> {
        val enc = Uri.encode(regions.joinToString(","))
        val c = Uri.encode(country)
        val ex = Uri.encode(excludeCity)
        return parseList(get("$API_BASE/clubs?regions=$enc&country=$c&exclude_city=$ex", token), "clubs", ReciprocalClub::class.java)
    }

    fun searchClubs(token: String, query: String): List<ReciprocalClub> {
        val q = Uri.encode(query)
        return parseList(get("$API_BASE/clubs?search=$q", token), "clubs", ReciprocalClub::class.java)
    }

    // — Dining —

    fun createDiningReservation(token: String?, reservation: Map<String, Any?>): Map<*, *> {
        val headers = mutableMapOf("Authorization" to "Bearer $SUPABASE_ANON_KEY")
        if (token != null) headers["x-session-token"] = token
        return gson.fromJson(post("$API_BASE/dining", reservation, headers), HashMap::class.java)
    }

    // — LOI —

    fun createLoiRequest(token: String, request: Map<String, Any?>): Map<*, *> {
        val headers = mapOf(
            "Authorization" to "Bearer $SUPABASE_ANON_KEY",
            "x-session-token" to token
        )
        return gson.fromJson(post(LOI_API_URL, request, headers), HashMap::class.java)
    }
}
