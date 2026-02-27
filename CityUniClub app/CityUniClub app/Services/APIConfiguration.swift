//
//  APIConfiguration.swift
//  CityUniClub app
//
//  Configuration for backend API
//

import Foundation

enum APIConfiguration {
    // For development (local Supabase)
    // static let baseURL = "http://localhost:54321/functions/v1"
    
    // For production (Supabase Edge Functions)
    static let baseURL = "https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1"
    
    static let timeout: TimeInterval = 30
}
