//
//  APIService.swift
//  CityUniClub app
//
//  Main API service for backend communication
//

import Foundation

class APIService {
    static let shared = APIService()
    
    private var authToken: String?
    
    private init() {
        // Load saved token from UserDefaults
        self.authToken = UserDefaults.standard.string(forKey: "authToken")
    }
    
    // MARK: - Token Management
    
    func setAuthToken(_ token: String) {
        self.authToken = token
        UserDefaults.standard.set(token, forKey: "authToken")
    }
    
    func clearAuthToken() {
        self.authToken = nil
        UserDefaults.standard.removeObject(forKey: "authToken")
    }
    
    var isAuthenticated: Bool {
        authToken != nil
    }
    
    // MARK: - Generic Request Methods
    
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil,
        requiresAuth: Bool = false
    ) async throws -> T {
        guard var url = URL(string: "\(APIConfiguration.baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if requiresAuth, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.noData
        }
        
        switch httpResponse.statusCode {
        case 200...299:
            break
        case 401:
            clearAuthToken()
            throw APIError.unauthorized
        case 404:
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: "Not found")
        case 500...599:
            throw APIError.serverError
        default:
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: "Request failed")
        }
        
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decodingError
        }
    }
    
    // MARK: - Auth Endpoints
    
    func login(email: String, password: String) async throws -> AuthResponse {
        struct LoginRequest: Encodable {
            let email: String
            let password: String
        }
        
        let response: AuthResponse = try await request(
            endpoint: "/login",
            method: "POST",
            body: LoginRequest(email: email, password: password),
            requiresAuth: false
        )
        
        setAuthToken(response.session.token)
        return response
    }
    
    func logout() async throws {
        guard isAuthenticated else { return }
        
        try await request(
            endpoint: "/logout",
            method: "POST",
            requiresAuth: true
        )
        
        clearAuthToken()
    }
    
    func validateToken(_ token: String) async throws -> Bool {
        let url = URL(string: "\(APIConfiguration.baseURL)/auth/validate")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            return false
        }
        
        return httpResponse.statusCode == 200
    }
    
    func getCurrentMember() async throws -> Member {
        struct MemberResponse: Decodable {
            let member: Member
        }
        
        let response: MemberResponse = try await request(
            endpoint: "/me",
            method: "GET",
            requiresAuth: true
        )
        
        return response.member
    }
    
    // MARK: - Events Endpoints
    
    func getEvents(upcoming: Bool = true) async throws -> [Event] {
        struct EventsResponse: Decodable {
            let events: [Event]
        }
        
        let response: EventsResponse = try await request(
            endpoint: "/events",
            method: "GET",
            requiresAuth: false
        )
        
        return response.events
    }
    
    func bookEvent(eventId: String, mealOption: String? = nil, guestCount: Int, specialRequests: String? = nil) async throws -> EventBooking {
        struct BookingRequest: Encodable {
            let event_id: String
            let meal_option: String?
            let guest_count: Int
            let special_requests: String?
        }
        
        struct BookingResponse: Decodable {
            let booking: EventBooking
        }
        
        let response: BookingResponse = try await request(
            endpoint: "/events/book",
            method: "POST",
            body: BookingRequest(
                event_id: eventId,
                meal_option: mealOption,
                guest_count: guestCount,
                special_requests: specialRequests
            ),
            requiresAuth: true
        )
        
        return response.booking
    }
    
    func cancelBooking(bookingId: String) async throws {
        try await request(
            endpoint: "/events/bookings/\(bookingId)/cancel",
            method: "PUT",
            requiresAuth: true
        )
    }
    
    // MARK: - Dining Endpoints
    
    func getReservations() async throws -> [DiningReservation] {
        struct ReservationsResponse: Decodable {
            let reservations: [DiningReservation]
        }
        
        let response: ReservationsResponse = try await request(
            endpoint: "/dining/reservations",
            method: "GET",
            requiresAuth: true
        )
        
        return response.reservations
    }
    
    func createReservation(
        date: String,
        time: String,
        mealType: String,
        guestCount: Int,
        tablePreference: String? = nil,
        specialRequests: String? = nil
    ) async throws -> DiningReservation {
        struct ReservationRequest: Encodable {
            let reservation_date: String
            let reservation_time: String
            let meal_type: String
            let guest_count: Int
            let table_preference: String?
            let special_requests: String?
        }
        
        struct ReservationResponse: Decodable {
            let reservation: DiningReservation
        }
        
        let response: ReservationResponse = try await request(
            endpoint: "/dining/reservations",
            method: "POST",
            body: ReservationRequest(
                reservation_date: date,
                reservation_time: time,
                meal_type: mealType,
                guest_count: guestCount,
                table_preference: tablePreference,
                special_requests: specialRequests
            ),
            requiresAuth: true
        )
        
        return response.reservation
    }
    
    func cancelReservation(reservationId: String) async throws {
        try await request(
            endpoint: "/dining/reservations/\(reservationId)",
            method: "DELETE",
            requiresAuth: true
        )
    }
    
    // MARK: - News Endpoints
    
    func getNews() async throws -> [ClubNews] {
        struct NewsResponse: Decodable {
            let news: [ClubNews]
        }
        
        let response: NewsResponse = try await request(
            endpoint: "/news",
            method: "GET",
            requiresAuth: false
        )
        
        return response.news
    }
    
    // MARK: - Reciprocal Clubs Endpoints
    
    func getReciprocalClubs(region: String? = nil) async throws -> [ReciprocalClub] {
        struct ClubsResponse: Decodable {
            let clubs: [ReciprocalClub]
        }
        
        var endpoint = "/clubs"
        if let region = region, region != "All" {
            endpoint += "?region=\(region)"
        }
        
        let response: ClubsResponse = try await request(
            endpoint: endpoint,
            method: "GET",
            requiresAuth: false
        )
        
        return response.clubs
    }
    
    func createLoiRequest(
        clubId: String,
        arrivalDate: String,
        departureDate: String,
        purpose: String,
        specialRequests: String? = nil
    ) async throws -> LoiRequest {
        struct LoiRequestBody: Encodable {
            let club_id: String
            let arrival_date: String
            let departure_date: String
            let purpose: String
            let special_requests: String?
        }

        struct LoiResponse: Decodable {
            let request: LoiRequest
        }

        let response: LoiResponse = try await request(
            endpoint: "/loi-requests",
            method: "POST",
            body: LoiRequestBody(
                club_id: clubId,
                arrival_date: arrivalDate,
                departure_date: departureDate,
                purpose: purpose,
                special_requests: specialRequests
            ),
            requiresAuth: true
        )

        return response.request
    }
    
    func getLoiRequests() async throws -> [LoiRequest] {
        struct LoiRequestsResponse: Decodable {
            let requests: [LoiRequest]
        }
        
        let response: LoiRequestsResponse = try await request(
            endpoint: "/reciprocal/loi-requests",
            method: "GET",
            requiresAuth: true
        )
        
        return response.requests
    }
    
    // MARK: - Member Profile Endpoints

    func getMemberProfile() async throws -> (member: Member, profile: MemberProfile?) {
        struct MemberResponse: Decodable {
            let member: Member
        }

        let memberResp: MemberResponse = try await request(
            endpoint: "/members/profile",
            method: "GET",
            requiresAuth: true
        )

        return (memberResp.member, nil)
    }

    func updateMemberProfile(
        fullName: String? = nil,
        firstName: String? = nil,
        phoneNumber: String? = nil,
        dietaryRequirements: String? = nil,
        notificationEnabled: Bool? = nil
    ) async throws -> (member: Member, profile: MemberProfile?) {
        struct ProfileUpdateRequest: Encodable {
            let full_name: String?
            let first_name: String?
            let phone_number: String?
            let dietary_requirements: String?
            let notification_enabled: Bool?
        }

        struct MemberResponse: Decodable {
            let member: Member
        }

        let response: MemberResponse = try await request(
            endpoint: "/members/profile",
            method: "PUT",
            body: ProfileUpdateRequest(
                full_name: fullName,
                first_name: firstName,
                phone_number: phoneNumber,
                dietary_requirements: dietaryRequirements,
                notification_enabled: notificationEnabled
            ),
            requiresAuth: true
        )

        return (response.member, nil)
    }
        
        return (response.member, response.profile)
    }
}
