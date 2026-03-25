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
        guard let url = URL(string: "\(APIConfiguration.baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = APIConfiguration.timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(APIConfiguration.appVersion, forHTTPHeaderField: "X-App-Version")

        if requiresAuth, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        print("[API] \(method) \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("[API] Error: no HTTP response for \(method) \(url.absoluteString)")
            throw APIError.noData
        }

        print("[API] \(httpResponse.statusCode) \(method) \(url.absoluteString)")

        switch httpResponse.statusCode {
        case 200...299:
            break
        case 401:
            clearAuthToken()
            throw APIError.unauthorized
        case 404:
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: "Not found")
        case 500...599:
            print("[API] Server error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.serverError
        default:
            let serverMsg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                .flatMap { $0["message"] as? String ?? $0["error"] as? String }
                ?? "Request failed (\(httpResponse.statusCode))"
            print("[API] Error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: serverMsg)
        }

        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            print("[API] Decode error for \(method) \(url.absoluteString): \(error)")
            print("[API] Response body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.decodingError
        }
    }
    
    // Request with no return value
    private func requestVoid(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil,
        requiresAuth: Bool = false
    ) async throws {
        guard let url = URL(string: "\(APIConfiguration.baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(APIConfiguration.appVersion, forHTTPHeaderField: "X-App-Version")

        if requiresAuth, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        print("[API] \(method) \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("[API] Error: no HTTP response for \(method) \(url.absoluteString)")
            throw APIError.noData
        }

        print("[API] \(httpResponse.statusCode) \(method) \(url.absoluteString)")

        switch httpResponse.statusCode {
        case 200...299:
            break
        case 401:
            clearAuthToken()
            throw APIError.unauthorized
        case 404:
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: "Not found")
        case 500...599:
            print("[API] Server error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.serverError
        default:
            print("[API] Error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: "Request failed")
        }
    }
    
    // MARK: - Auth Endpoints
    
    func login(email: String, password: String) async throws -> AuthResponse {
        struct LoginRequest: Encodable {
            let email: String
            let password: String
            let session_type: String
        }
        
        let response: AuthResponse = try await request(
            endpoint: "/login",
            method: "POST",
            body: LoginRequest(email: email, password: password, session_type: "supersession"),
            requiresAuth: false
        )
        
        setAuthToken(response.session.token)
        return response
    }
    
    func logout() async throws {
        guard isAuthenticated else { return }

        try await requestVoid(
            endpoint: "/logout",
            method: "POST",
            body: [String: String](),
            requiresAuth: true
        )

        clearAuthToken()
    }
    
    func validateToken(_ token: String) async throws -> Bool {
        let url = URL(string: "\(APIConfiguration.baseURL)/auth/validate")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
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
    
    func getEvents() async throws -> [Event] {
        struct EventsResponse: Decodable {
            let events: [Event]
        }

        guard let url = URL(string: "\(APIConfiguration.baseURL)/events") else {
            throw APIError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "GET"
        if let token = authToken {
            urlRequest.setValue(token, forHTTPHeaderField: "x-session-token")
        }

        print("[API] GET \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else { throw APIError.noData }
        print("[API] \(httpResponse.statusCode) GET \(url.absoluteString)")
        guard (200...299).contains(httpResponse.statusCode) else { throw APIError.serverError }

        do {
            return try JSONDecoder().decode(EventsResponse.self, from: data).events
        } catch {
            print("[API] Decode error: \(error)")
            print("[API] Response body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.decodingError
        }
    }
    
    func bookEvent(eventId: String, guestCount: Int, specialRequests: String? = nil) async throws -> EventBooking {
        struct BookingRequest: Encodable {
            let event_id: String
            let guest_count: Int
            let special_requests: String?
        }

        struct BookingResponse: Decodable {
            let booking: EventBooking
        }

        guard let url = URL(string: "\(APIConfiguration.baseURL)/event-bookings") else {
            throw APIError.invalidURL
        }
        guard let token = authToken else {
            throw APIError.unauthorized
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(token, forHTTPHeaderField: "x-session-token")
        urlRequest.httpBody = try JSONEncoder().encode(BookingRequest(
            event_id: eventId,
            guest_count: guestCount,
            special_requests: specialRequests
        ))

        print("[API] POST \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.noData
        }

        print("[API] \(httpResponse.statusCode) POST \(url.absoluteString)")

        guard (200...299).contains(httpResponse.statusCode) else {
            let serverMsg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                .flatMap { $0["error"] as? String } ?? "Booking failed"
            print("[API] Error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: serverMsg)
        }

        do {
            return try JSONDecoder().decode(BookingResponse.self, from: data).booking
        } catch {
            print("[API] Decode error: \(error)")
            print("[API] Response body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.decodingError
        }
    }
    
    func cancelEventBooking(bookingId: String) async throws {
        guard let url = URL(string: "\(APIConfiguration.baseURL)/event-bookings") else {
            throw APIError.invalidURL
        }
        guard let token = authToken else { throw APIError.unauthorized }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "PATCH"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(token, forHTTPHeaderField: "x-session-token")
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: ["booking_id": bookingId])

        print("[API] PATCH \(url.absoluteString) cancel booking \(bookingId)")
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else { throw APIError.noData }
        print("[API] \(http.statusCode) PATCH \(url.absoluteString)")
        guard (200...299).contains(http.statusCode) else {
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                .flatMap { $0["error"] as? String } ?? "Cancel failed"
            print("[API] Error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.httpError(statusCode: http.statusCode, message: msg)
        }
    }
    
    func updateEventNotes(bookingId: String, specialRequests: String?) async throws {
        guard let url = URL(string: "\(APIConfiguration.baseURL)/event-bookings") else {
            throw APIError.invalidURL
        }
        guard let token = authToken else { throw APIError.unauthorized }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "PATCH"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(token, forHTTPHeaderField: "x-session-token")
        var body: [String: Any] = ["booking_id": bookingId]
        body["special_requests"] = specialRequests as Any
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else { throw APIError.noData }
        guard (200...299).contains(http.statusCode) else {
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                .flatMap { $0["error"] as? String } ?? "Update failed"
            throw APIError.httpError(statusCode: http.statusCode, message: msg)
        }
    }

    func changeEventGuestCount(bookingId: String, guestCount: Int) async throws {
        guard let url = URL(string: "\(APIConfiguration.baseURL)/event-bookings") else {
            throw APIError.invalidURL
        }
        guard let token = authToken else { throw APIError.unauthorized }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "PATCH"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(token, forHTTPHeaderField: "x-session-token")
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: ["booking_id": bookingId, "guest_count": guestCount])

        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else { throw APIError.noData }
        guard (200...299).contains(http.statusCode) else {
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                .flatMap { $0["error"] as? String } ?? "Update failed"
            throw APIError.httpError(statusCode: http.statusCode, message: msg)
        }
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

    func getClubRegionCounts() async throws -> [String: Int] {
        struct Response: Decodable { let regions: [String: Int] }
        let r: Response = try await request(endpoint: "/clubs", method: "GET", requiresAuth: true)
        return r.regions
    }

    func getClubCountryCounts(regions: [String]) async throws -> [ClubCountryCount] {
        struct Response: Decodable { let countries: [ClubCountryCount] }
        let enc = encode(regions.joined(separator: ","))
        let r: Response = try await request(endpoint: "/clubs?regions=\(enc)", method: "GET", requiresAuth: true)
        return r.countries
    }

    func getClubCityCounts(regions: [String], country: String) async throws -> [ClubCityCount] {
        struct Response: Decodable { let cities: [ClubCityCount] }
        let rEnc = encode(regions.joined(separator: ","))
        let cEnc = encode(country)
        let r: Response = try await request(endpoint: "/clubs?regions=\(rEnc)&country=\(cEnc)", method: "GET", requiresAuth: true)
        return r.cities
    }

    func getClubsByCity(regions: [String], country: String, city: String) async throws -> [ReciprocalClub] {
        struct Response: Decodable { let clubs: [ReciprocalClub] }
        let rEnc = encode(regions.joined(separator: ","))
        let cEnc = encode(country)
        let cityEnc = encode(city)
        let r: Response = try await request(endpoint: "/clubs?regions=\(rEnc)&country=\(cEnc)&city=\(cityEnc)", method: "GET", requiresAuth: true)
        return r.clubs
    }

    func getClubsExcludingCity(regions: [String], country: String, excludeCity: String) async throws -> [ReciprocalClub] {
        struct Response: Decodable { let clubs: [ReciprocalClub] }
        let rEnc = encode(regions.joined(separator: ","))
        let cEnc = encode(country)
        let exEnc = encode(excludeCity)
        let r: Response = try await request(endpoint: "/clubs?regions=\(rEnc)&country=\(cEnc)&exclude_city=\(exEnc)", method: "GET", requiresAuth: true)
        return r.clubs
    }

    func getClubsByCountry(regions: [String], country: String) async throws -> [ReciprocalClub] {
        struct Response: Decodable { let clubs: [ReciprocalClub] }
        let rEnc = encode(regions.joined(separator: ","))
        let cEnc = encode(country)
        let r: Response = try await request(endpoint: "/clubs?regions=\(rEnc)&country=\(cEnc)&all_clubs=true", method: "GET", requiresAuth: true)
        return r.clubs
    }

    func searchClubs(query: String) async throws -> [ReciprocalClub] {
        struct Response: Decodable { let clubs: [ReciprocalClub] }
        let r: Response = try await request(endpoint: "/clubs?search=\(encode(query))", method: "GET", requiresAuth: true)
        return r.clubs
    }

    private func encode(_ s: String) -> String {
        s.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? s
    }
    
    func createLoiRequest(
        clubId: String,
        arrivalDate: String,
        departureDate: String,
        purpose: String,
        specialRequests: String? = nil
    ) async throws {
        struct LoiRequestBody: Encodable {
            let club_id: String
            let arrival_date: String
            let departure_date: String
            let purpose: String
            let special_requests: String?
        }

        guard let url = URL(string: "\(APIConfiguration.baseURL)/loi-api") else {
            throw APIError.invalidURL
        }
        guard let token = authToken else {
            throw APIError.unauthorized
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(token, forHTTPHeaderField: "x-session-token")
        urlRequest.httpBody = try JSONEncoder().encode(LoiRequestBody(
            club_id: clubId,
            arrival_date: arrivalDate,
            departure_date: departureDate,
            purpose: purpose,
            special_requests: specialRequests
        ))

        print("[API] POST \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else { throw APIError.serverError }
        print("[API] \(httpResponse.statusCode) POST \(url.absoluteString)")

        guard (200...299).contains(httpResponse.statusCode) else {
            print("[API] Error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
            throw APIError.serverError
        }
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
    
    func updateMemberEmail(email: String) async throws -> Member {
        struct UpdateRequest: Encodable {
            let email: String
        }
        
        struct MemberResponse: Decodable {
            let member: Member
        }
        
        let response: MemberResponse = try await request(
            endpoint: "/members/profile",
            method: "PUT",
            body: UpdateRequest(email: email),
            requiresAuth: true
        )
        
        return response.member
    }
    
    func changePassword(currentPassword: String, newPassword: String) async throws {
        struct ChangePasswordRequest: Encodable {
            let current_password: String
            let new_password: String
        }
        
        struct ChangePasswordResponse: Decodable {
            let message: String
        }
        
        let _: ChangePasswordResponse = try await request(
            endpoint: "/change-password",
            method: "POST",
            body: ChangePasswordRequest(
                current_password: currentPassword,
                new_password: newPassword
            ),
            requiresAuth: true
        )
    }
    
    func requestPasswordReset(email: String) async throws {
        struct ForgotPasswordRequest: Encodable {
            let email: String
        }
        
        struct ForgotPasswordResponse: Decodable {
            let message: String
        }
        
        let _: ForgotPasswordResponse = try await request(
            endpoint: "/auth/forgot-password",
            method: "POST",
            body: ForgotPasswordRequest(email: email),
            requiresAuth: false
        )
    }
}
