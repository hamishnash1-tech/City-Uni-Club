//
//  AuthManager.swift
//  CityUniClub app
//
//  Handles authentication state using Supabase Edge Functions
//

import Foundation
import SwiftUI
import Combine

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated = false
    @Published var currentMember: Member?
    @Published var isLoading = true
    @Published var hasCheckedAuth = false
    
    private let apiService = APIService.shared
    private let authTokenKey = "authToken"
    private let memberKey = "currentMember"
    
    init() {
        // Don't check auth in init - do it in a separate method
        // This ensures the view renders first
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.checkExistingSession()
        }
    }
    
    // MARK: - Session Management
    
    func checkExistingSession() {
        // Check if we have a saved token
        guard let token = UserDefaults.standard.string(forKey: authTokenKey) else {
            // No token, show login
            DispatchQueue.main.async {
                self.isLoading = false
                self.hasCheckedAuth = true
            }
            return
        }
        
        // Validate token with Edge Function
        Task {
            do {
                try await validateToken(token)
            } catch {
                // Token invalid, clear session
                await MainActor.run {
                    clearSession()
                }
            }
        }
    }
    
    func validateToken(_ token: String) async throws {
        let url = URL(string: "\(APIConfiguration.baseURL)/auth/validate")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        
        if httpResponse.statusCode == 200 {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            
            if let memberData = UserDefaults.standard.data(forKey: memberKey),
               let member = try? decoder.decode(Member.self, from: memberData) {
                await MainActor.run {
                    self.currentMember = member
                    self.isAuthenticated = true
                    self.isLoading = false
                    self.hasCheckedAuth = true
                }
            } else {
                // No member data, fetch it
                await MainActor.run {
                    self.isAuthenticated = true
                    self.isLoading = false
                    self.hasCheckedAuth = true
                }
            }
        } else {
            throw URLError(.badServerResponse)
        }
    }
    
    // MARK: - Login
    
    func login(email: String, password: String) async throws {
        isLoading = true
        
        do {
            let authResponse = try await apiService.login(email: email, password: password)
            
            // Save token
            UserDefaults.standard.set(authResponse.session.token, forKey: authTokenKey)
            
            // Save member data
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            if let memberData = try? encoder.encode(authResponse.member) {
                UserDefaults.standard.set(memberData, forKey: memberKey)
            }
            
            await MainActor.run {
                self.currentMember = authResponse.member
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
    
    // MARK: - Logout
    
    func logout() async {
        // Call logout endpoint
        try? await apiService.logout()
        
        // Clear local session
        clearSession()
    }
    
    func clearSession() {
        UserDefaults.standard.removeObject(forKey: authTokenKey)
        UserDefaults.standard.removeObject(forKey: memberKey)
        
        DispatchQueue.main.async {
            self.currentMember = nil
            self.isAuthenticated = false
            self.isLoading = false
            self.hasCheckedAuth = true
        }
    }
    
    // MARK: - Helper Methods
    
    func getAuthToken() -> String? {
        return UserDefaults.standard.string(forKey: authTokenKey)
    }
    
    func getCurrentMember() -> Member? {
        guard let memberData = UserDefaults.standard.data(forKey: memberKey) else {
            return nil
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try? decoder.decode(Member.self, from: memberData)
    }
}
