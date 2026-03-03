package com.cityuniclub.api

import com.cityuniclub.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    @POST(ApiConstants.LOGIN)
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>
    
    @POST(ApiConstants.LOGOUT)
    suspend fun logout(
        @Header("Authorization") token: String
    ): Response<Unit>
    
    @GET(ApiConstants.EVENTS)
    suspend fun getEvents(
        @Query("upcoming") upcoming: Boolean = true
    ): Response<List<Event>>
    
    @GET(ApiConstants.NEWS)
    suspend fun getNews(): Response<List<ClubNews>>
    
    @GET(ApiConstants.CLUBS)
    suspend fun getClubs(
        @Query("region") region: String? = null
    ): Response<List<ReciprocalClub>>
    
    @POST(ApiConstants.LOI_REQUESTS)
    suspend fun createLoiRequest(
        @Header("Authorization") token: String,
        @Body request: LoiRequest
    ): Response<LoiRequestResponse>
}

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoiRequestResponse(
    val request: ReciprocalClub,
    val message: String
)
