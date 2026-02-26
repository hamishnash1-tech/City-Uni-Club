//
//  MainAppView.swift
//  CityUniClub app
//
//  Created by Hamish Nash on 26/02/2026.
//

import SwiftUI

struct MainAppView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
            
            DiningView()
                .tabItem {
                    Image(systemName: "fork.knife")
                    Text("Dining")
                }
            
            EventsView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("Events")
                }
            
            MoreView()
                .tabItem {
                    Image(systemName: "ellipsis")
                    Text("More")
                }
        }
        .accentColor(.oxfordBlue)
    }
}
