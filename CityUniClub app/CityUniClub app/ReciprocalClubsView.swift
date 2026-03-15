import SwiftUI

// MARK: - Navigation State

private enum ClubNavState: Equatable {
    case regions
    case countries([String])
    case cities([String], String)
    case clubs([String], String, String?, String?) // regions, country, city, excludeCity
}

// MARK: - Region Groups

private let regionGroups: [(label: String, keys: [String])] = [
    ("UK & Ireland",         ["United Kingdom", "Ireland"]),
    ("Europe",               ["Europe"]),
    ("Americas",             ["USA", "Canada", "Americas", "South America"]),
    ("Asia Pacific",         ["Asia", "Australia", "Oceania"]),
    ("Middle East & Africa", ["Middle East", "Africa"])
]

// MARK: - Main View

struct ReciprocalClubsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var navState: ClubNavState = .regions
    @State private var searchQuery = ""
    @State private var totalCount: Int?
    @State private var selectedClub: ReciprocalClub?
    @State private var showLOISheet = false

    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            VStack(spacing: 0) {
                header
                searchBar

                if searchQuery.count >= 2 {
                    ClubSearchResultsView(query: searchQuery) { club in
                        selectedClub = club
                        showLOISheet = true
                    }
                } else {
                    switch navState {
                    case .regions:
                        ClubRegionsView(
                            onSelect: { navState = .countries($0) },
                            onTotalLoaded: { totalCount = $0 }
                        )
                    case .countries(let regions):
                        ClubCountriesView(regions: regions) { country in
                            navState = .cities(regions, country)
                        }
                    case .cities(let regions, let country):
                        ClubCitiesView(
                            regions: regions, country: country,
                            onCity: { city in navState = .clubs(regions, country, city, nil) },
                            onRestOfEngland: { navState = .clubs(regions, country, nil, "London") }
                        )
                    case .clubs(let regions, let country, let city, let excludeCity):
                        ClubListView(
                            regions: regions, country: country,
                            city: city, excludeCity: excludeCity
                        ) { club in
                            selectedClub = club
                            showLOISheet = true
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showLOISheet) {
            if let club = selectedClub {
                LOIRequestView(club: club)
            }
        }
    }

    private var header: some View {
        HStack {
            Button {
                if navState == .regions { dismiss() } else { navigateBack() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }

            Spacer()

            Text(navTitle)
                .font(.system(size: 18, weight: .light))
                .foregroundColor(.white)
                .lineLimit(1)

            Spacer()

            Image(systemName: "chevron.left").foregroundColor(.clear)
        }
        .padding(.horizontal, 20)
        .padding(.top, 16)
        .padding(.bottom, 12)
    }

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondaryText)
            TextField("Search clubs...", text: $searchQuery)
                .font(.system(size: 14))
                .foregroundColor(.white)
            if !searchQuery.isEmpty {
                Button { searchQuery = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondaryText)
                }
            }
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.1)))
        .padding(.horizontal, 20)
        .padding(.bottom, 12)
    }

    private var navTitle: String {
        switch navState {
        case .regions:
            return totalCount.map { "Reciprocal Clubs (\($0))" } ?? "Reciprocal Clubs"
        case .countries(let regions):
            return regionGroups.first(where: { $0.keys == regions })?.label ?? regions.joined(separator: " & ")
        case .cities(_, let country):
            return country
        case .clubs(_, let country, let city, let excludeCity):
            if excludeCity != nil { return "Rest of \(country)" }
            return city ?? country
        }
    }

    private func navigateBack() {
        switch navState {
        case .regions:
            break
        case .countries:
            navState = .regions
        case .cities(let regions, _):
            navState = .countries(regions)
        case .clubs(let regions, let country, let city, let excludeCity):
            navState = (city != nil || excludeCity != nil)
                ? .cities(regions, country)
                : .countries(regions)
        }
    }
}

// MARK: - Drill-Down Card

private struct DrillDownCard: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(title)
                    .font(.system(size: 15))
                    .foregroundColor(.white)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13))
                    .foregroundColor(.secondaryText)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.white.opacity(0.06)))
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Club Card

private struct ClubCardView: View {
    let club: ReciprocalClub
    let onLOI: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(club.name)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.oxfordBlue)
            Text(club.location)
                .font(.system(size: 12))
                .foregroundColor(.secondaryText)
            if let note = club.note, !note.isEmpty {
                Text(note)
                    .font(.system(size: 12))
                    .foregroundColor(Color(red: 0.29, green: 0.29, blue: 0.29))
                    .lineSpacing(3)
            }
            Button(action: onLOI) {
                HStack(spacing: 6) {
                    Image(systemName: "envelope")
                        .font(.system(size: 13))
                    Text("Request Letter of Introduction")
                        .font(.system(size: 13))
                }
                .foregroundColor(.oxfordBlue)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.oxfordBlue.opacity(0.4), lineWidth: 1))
            }
            .buttonStyle(PlainButtonStyle())
            .padding(.top, 4)
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.cardWhite))
    }
}

// MARK: - Loading / Error Wrapper

private struct LoadingOrErrorView<Content: View>: View {
    let isLoading: Bool
    let error: String?
    @ViewBuilder let content: () -> Content

    var body: some View {
        if isLoading {
            VStack {
                Spacer()
                ProgressView().tint(.cambridgeBlue).scaleEffect(1.5)
                Spacer()
            }
        } else if let error {
            VStack(spacing: 12) {
                Spacer()
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 36))
                    .foregroundColor(.secondaryText)
                Text(error)
                    .font(.system(size: 14))
                    .foregroundColor(.secondaryText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                Spacer()
            }
        } else {
            content()
        }
    }
}

// MARK: - Regions Panel

private struct ClubRegionsView: View {
    let onSelect: ([String]) -> Void
    let onTotalLoaded: (Int) -> Void

    @State private var regionCounts: [String: Int] = [:]
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        LoadingOrErrorView(isLoading: isLoading, error: error) {
            ScrollView {
                VStack(spacing: 10) {
                    ForEach(regionGroups, id: \.label) { group in
                        let count = group.keys.reduce(0) { $0 + (regionCounts[$1] ?? 0) }
                        DrillDownCard(
                            title: count > 0 ? "\(group.label) (\(count))" : group.label
                        ) { onSelect(group.keys) }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
        }
        .task {
            do {
                regionCounts = try await APIService.shared.getClubRegionCounts()
                onTotalLoaded(regionCounts.values.reduce(0, +))
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Countries Panel

private struct ClubCountriesView: View {
    let regions: [String]
    let onSelect: (String) -> Void

    @State private var countries: [ClubCountryCount] = []
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        LoadingOrErrorView(isLoading: isLoading, error: error) {
            ScrollView {
                VStack(spacing: 10) {
                    ForEach(countries, id: \.country) { c in
                        DrillDownCard(
                            title: c.count > 0 ? "\(c.country) (\(c.count))" : c.country
                        ) { onSelect(c.country) }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
        }
        .task(id: regions.joined()) {
            do {
                countries = try await APIService.shared.getClubCountryCounts(regions: regions)
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Cities Panel

private struct ClubCitiesView: View {
    let regions: [String]
    let country: String
    let onCity: (String) -> Void
    let onRestOfEngland: () -> Void

    @State private var cities: [ClubCityCount] = []
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        LoadingOrErrorView(isLoading: isLoading, error: error) {
            ScrollView {
                VStack(spacing: 10) {
                    if country == "England" {
                        let londonCount = cities.first(where: { $0.city == "London" })?.count ?? 0
                        let restCount = cities.filter { $0.city != "London" }.reduce(0) { $0 + $1.count }
                        if londonCount > 0 {
                            DrillDownCard(title: "London (\(londonCount))") { onCity("London") }
                        }
                        if restCount > 0 {
                            DrillDownCard(title: "Rest of England (\(restCount))") { onRestOfEngland() }
                        }
                    } else {
                        ForEach(cities, id: \.city) { c in
                            DrillDownCard(
                                title: c.count > 0 ? "\(c.city) (\(c.count))" : c.city
                            ) { onCity(c.city) }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
        }
        .task(id: country) {
            do {
                let loaded = try await APIService.shared.getClubCityCounts(regions: regions, country: country)
                if loaded.count == 1 {
                    onCity(loaded[0].city)
                    return
                }
                cities = loaded
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Club List Panel

private struct ClubListView: View {
    let regions: [String]
    let country: String
    let city: String?
    let excludeCity: String?
    let onLOI: (ReciprocalClub) -> Void

    @State private var clubs: [ReciprocalClub] = []
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        LoadingOrErrorView(isLoading: isLoading, error: error) {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(clubs) { club in
                        ClubCardView(club: club) { onLOI(club) }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
        }
        .task(id: "\(city ?? "")||\(excludeCity ?? "")") {
            do {
                if let city {
                    clubs = try await APIService.shared.getClubsByCity(regions: regions, country: country, city: city)
                } else if let excludeCity {
                    clubs = try await APIService.shared.getClubsExcludingCity(regions: regions, country: country, excludeCity: excludeCity)
                } else {
                    clubs = try await APIService.shared.getClubsByCountry(regions: regions, country: country)
                }
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Search Results Panel

private struct ClubSearchResultsView: View {
    let query: String
    let onLOI: (ReciprocalClub) -> Void

    @State private var clubs: [ReciprocalClub] = []
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        LoadingOrErrorView(isLoading: isLoading, error: error) {
            if clubs.isEmpty {
                VStack {
                    Spacer()
                    Text("No clubs found")
                        .foregroundColor(.secondaryText)
                    Spacer()
                }
            } else {
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(clubs) { club in
                            ClubCardView(club: club) { onLOI(club) }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
        }
        .task(id: query) {
            isLoading = true
            error = nil
            do {
                clubs = try await APIService.shared.searchClubs(query: query)
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}

struct ReciprocalClubsView_Previews: PreviewProvider {
    static var previews: some View {
        ReciprocalClubsView()
    }
}
