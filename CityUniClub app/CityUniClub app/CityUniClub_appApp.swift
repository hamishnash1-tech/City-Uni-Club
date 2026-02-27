//
//  CityUniClub_appApp.swift
//  CityUniClub app
//
//  Created by Hamish Nash on 24/02/2026.
//

import SwiftUI

@main
struct CityUniClub_appApp: App {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isLoading {
                    // Show splash screen while checking auth
                    SplashView()
                } else if authManager.isAuthenticated {
                    MainTabView()
                } else {
                    LoginView()
                }
            }
            .environmentObject(authManager)
        }
    }
}
