package com.cityuniclub.model

data class Member(
    val id: String,
    val email: String,
    val full_name: String,
    val first_name: String,
    val membership_number: String,
    val membership_type: String
)

data class Session(
    val token: String,
    val expires_at: String
)

data class AuthResponse(
    val member: Member,
    val session: Session
)

data class Event(
    val id: String,
    val title: String,
    val description: String?,
    val event_type: String,
    val event_date: String,
    val price_per_person: Double,
    val is_tba: Boolean
)

data class ClubNews(
    val id: String,
    val title: String,
    val content: String,
    val category: String,
    val published_date: String,
    val is_featured: Boolean
)

data class ReciprocalClub(
    val id: String,
    val name: String,
    val location: String,
    val region: String,
    val country: String,
    val note: String?
)

data class LoiRequest(
    val club_id: String,
    val arrival_date: String,
    val departure_date: String,
    val purpose: String,
    val special_requests: String?
)
