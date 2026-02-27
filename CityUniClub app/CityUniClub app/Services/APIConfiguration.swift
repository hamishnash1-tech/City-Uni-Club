//
//  APIConfiguration.swift
//  CityUniClub app
//
//  Configuration for backend API
//

import Foundation

enum APIConfiguration {
    // For development (local server)
    // static let baseURL = "http://localhost:3000/api"
    // static let baseURL = "http://10.0.2.2:3000/api" // Android emulator
    
    // For development (iOS simulator on same network)
    // Replace with your Mac's local IP address
    // static let baseURL = "http://192.168.1.100:3000/api"
    
    // For production (deployed server)
    static let baseURL = "https://cityuniclub-backend-production.up.railway.app/api"
    
    static let timeout: TimeInterval = 30
}
