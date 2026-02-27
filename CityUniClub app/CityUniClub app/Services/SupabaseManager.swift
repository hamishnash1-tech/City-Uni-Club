//
//  SupabaseManager.swift
//  CityUniClub app
//
//  Direct Supabase integration for iOS app
//

import Foundation
import SwiftUI

// Note: You'll need to add the Supabase Swift package to your project
// Package URL: https://github.com/supabase/supabase-swift
//
// In Xcode:
// 1. File → Add Package Dependencies
// 2. Enter: https://github.com/supabase/supabase-swift
// 3. Select your target

class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()
    
    private let supabase: SupabaseClient?
    
    @Published var currentMember: Member?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    
    init() {
        // Initialize Supabase client
        let supabaseURL = "https://myfoyoyjtkqthjjvabmn.supabase.co"
        let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI5NDAsImV4cCI6MjA4Nzc3ODk0MH0._OhoEKRYAZ0C7oon9e_WSj7p47pJlWQmqBgx2CtBtdg"
        
        self.supabase = SupabaseClient(supabaseURL: supabaseURL, supabaseKey: supabaseKey)
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws {
        isLoading = true
        
        guard let supabase = supabase else {
            throw SupabaseError.notConfigured
        }
        
        do {
            // Use Supabase Auth
            let result = try await supabase.auth.signIn(email: email, password: password)
            
            // Fetch member data
            if let user = result.user {
                try await fetchMember(userId: user.id)
            }
            
            await MainActor.run {
                self.isAuthenticated = true
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.isLoading = false
            }
            throw error
        }
    }
    
    func signup(email: String, password: String, fullName: String, membershipNumber: String) async throws {
        isLoading = true
        
        guard let supabase = supabase else {
            throw SupabaseError.notConfigured
        }
        
        do {
            let result = try await supabase.auth.signUp(
                email: email,
                password: password,
                data: [
                    "full_name": fullName,
                    "membership_number": membershipNumber
                ]
            )
            
            if let user = result.user {
                try await fetchMember(userId: user.id)
            }
            
            await MainActor.run {
                self.isAuthenticated = true
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.isLoading = false
            }
            throw error
        }
    }
    
    func logout() async throws {
        guard let supabase = supabase else { return }
        
        try await supabase.auth.signOut()
        
        await MainActor.run {
            self.currentMember = nil
            self.isAuthenticated = false
        }
    }
    
    // MARK: - Data Fetching
    
    private func fetchMember(userId: String) async throws {
        guard let supabase = supabase else { return }
        
        let member: Member = try await supabase
            .from("members")
            .select()
            .eq("id", value: userId)
            .single()
            .execute()
            .value
        
        await MainActor.run {
            self.currentMember = member
        }
    }
    
    // MARK: - Events
    
    func getEvents() async throws -> [Event] {
        guard let supabase = supabase else { return [] }
        
        let events: [Event] = try await supabase
            .from("events")
            .select()
            .eq("is_active", value: true)
            .order("event_date", ascending: true)
            .execute()
            .value
        
        return events
    }
    
    func bookEvent(eventId: String, mealOption: String?, guestCount: Int, specialRequests: String?) async throws -> EventBooking {
        guard let supabase = supabase else {
            throw SupabaseError.notConfigured
        }
        
        guard let member = currentMember else {
            throw SupabaseError.notAuthenticated
        }
        
        // Get event price
        let event: Event = try await supabase
            .from("events")
            .select()
            .eq("id", value: eventId)
            .single()
            .execute()
            .value
        
        let totalPrice = event.pricePerPerson * Double(guestCount)
        
        // Create booking
        let booking: EventBooking = try await supabase
            .from("event_bookings")
            .insert([
                "event_id": eventId,
                "member_id": member.id,
                "meal_option": mealOption,
                "guest_count": guestCount,
                "special_requests": specialRequests,
                "total_price": totalPrice,
                "status": "pending"
            ])
            .select()
            .single()
            .execute()
            .value
        
        return booking
    }
    
    // MARK: - News
    
    func getNews() async throws -> [ClubNews] {
        guard let supabase = supabase else { return [] }
        
        let news: [ClubNews] = try await supabase
            .from("club_news")
            .select()
            .eq("is_active", value: true)
            .order("published_date", ascending: false)
            .execute()
            .value
        
        return news
    }
    
    // MARK: - Reciprocal Clubs
    
    func getReciprocalClubs(region: String? = nil) async throws -> [ReciprocalClub] {
        guard let supabase = supabase else { return [] }
        
        var query = supabase
            .from("reciprocal_clubs")
            .select()
            .eq("is_active", value: true)
        
        if let region = region, region != "All" {
            query = query.eq("region", value: region)
        }
        
        let clubs: [ReciprocalClub] = try await query
            .execute()
            .value
        
        return clubs
    }
    
    func createLoiRequest(
        clubId: String,
        arrivalDate: String,
        departureDate: String,
        purpose: String,
        specialRequests: String?
    ) async throws -> LoiRequest {
        guard let supabase = supabase else {
            throw SupabaseError.notConfigured
        }
        
        guard let member = currentMember else {
            throw SupabaseError.notAuthenticated
        }
        
        let request: LoiRequest = try await supabase
            .from("loi_requests")
            .insert([
                "club_id": clubId,
                "member_id": member.id,
                "arrival_date": arrivalDate,
                "departure_date": departureDate,
                "purpose": purpose,
                "special_requests": specialRequests,
                "status": "pending"
            ])
            .select()
            .single()
            .execute()
            .value
        
        return request
    }
}

// MARK: - Errors

enum SupabaseError: LocalizedError {
    case notConfigured
    case notAuthenticated
    case networkError
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "Supabase is not configured. Please add your credentials."
        case .notAuthenticated:
            return "Please login to continue"
        case .networkError:
            return "Network error. Please check your connection"
        case .serverError:
            return "Server error. Please try again later"
        }
    }
}
