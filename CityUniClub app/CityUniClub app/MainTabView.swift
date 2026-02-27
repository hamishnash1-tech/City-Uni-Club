// MainTabView.swift
import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab = 0

    init() {
        // Custom tab bar appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.white

        // Set colors for tab bar items
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor.gray
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor.gray]
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color.oxfordBlue)
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor(Color.oxfordBlue)]

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            DiningView()
                .tabItem {
                    Label("Dining", systemImage: "fork.knife")
                }
                .tag(1)

            EventsView()
                .tabItem {
                    Label("Events", systemImage: "calendar")
                }
                .tag(2)

            MoreView()
                .tabItem {
                    Label("More", systemImage: "ellipsis.circle")
                }
                .tag(3)
        }
        .accentColor(Color.cambridgeBlue)
        .environmentObject(authManager)
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
    }
}
