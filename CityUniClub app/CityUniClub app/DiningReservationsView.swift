import SwiftUI

struct DiningBookingItem: Identifiable {
    let id: String
    let mealType: String
    let reservationDate: String
    let reservationTime: String
    var guestCount: Int
    var status: String
    var specialRequests: String?

    static let maxNotesLength = 256
}

struct DiningReservationsView: View {
    @EnvironmentObject var authManager: AuthManager

    @State private var upcoming: [DiningBookingItem] = []
    @State private var past: [DiningBookingItem] = []
    @State private var isLoading = true
    @State private var errorMessage: String? = nil

    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 24) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .padding(.top, 60)
                        } else if let error = errorMessage {
                            Text(error)
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.7))
                                .padding(.top, 60)
                        } else if upcoming.isEmpty && past.isEmpty {
                            Text("No reservations found.")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.7))
                                .padding(.top, 60)
                        } else {
                            reservationSection(title: "Upcoming", items: $upcoming, emptyMessage: "No upcoming reservations.")
                            if !past.isEmpty {
                                reservationSection(title: "Recent", items: $past, emptyMessage: nil)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 40)
                }
                .scrollBounceBehavior(.always, axes: .vertical)
                .refreshable {
                    print("[DiningReservations] Pull-to-refresh triggered")
                    await loadReservations(trigger: "pull_to_refresh")
                }
            }
        }
        .navigationTitle("My Reservations")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task { await loadReservations(trigger: "initial_load") }
    }

    private func reservationSection(title: String, items: Binding<[DiningBookingItem]>, emptyMessage: String?) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.white.opacity(0.5))
                .kerning(1)

            if items.wrappedValue.isEmpty, let msg = emptyMessage {
                Text(msg)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.vertical, 8)
            } else {
                VStack(spacing: 0) {
                    ForEach(items.indices, id: \.self) { idx in
                        NavigationLink(destination: DiningReservationDetailView(item: items[idx])) {
                            reservationRow(items[idx].wrappedValue)
                        }
                        .buttonStyle(.plain)
                        if idx < items.wrappedValue.count - 1 {
                            Divider()
                                .background(Color.white.opacity(0.08))
                                .padding(.leading, 16)
                        }
                    }
                }
                .background(Color.white.opacity(0.06))
                .cornerRadius(14)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
            }
        }
    }

    private func reservationRow(_ r: DiningBookingItem) -> some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(r.mealType)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                Text("\(formatDate(r.reservationDate)) · \(formatTime(r.reservationTime))")
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.6))
                Text("\(r.guestCount) guest\(r.guestCount == 1 ? "" : "s")")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.5))
            }
            Spacer()
            statusBadge(r.status)
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white.opacity(0.3))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private func statusBadge(_ status: String) -> some View {
        let (bg, fg): (Color, Color) = {
            switch status {
            case "confirmed": return (Color.cambridgeBlue.opacity(0.25), Color.cambridgeBlue)
            case "cancelled": return (Color.red.opacity(0.2), Color.red.opacity(0.9))
            case "pending":   return (Color.orange.opacity(0.2), Color.orange)
            default:          return (Color.white.opacity(0.1), Color.white.opacity(0.6))
            }
        }()
        return Text(status.capitalized)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(fg)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(bg)
            .cornerRadius(6)
    }

    private func formatDate(_ dateStr: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: dateStr) else { return dateStr }
        f.dateFormat = "EEE d MMM"
        return f.string(from: date)
    }

    private func formatTime(_ timeStr: String) -> String {
        let parts = timeStr.prefix(5).split(separator: ":")
        guard parts.count == 2, let h = Int(parts[0]), let m = Int(parts[1]) else { return timeStr }
        let ampm = h < 12 ? "AM" : "PM"
        let hour = h % 12 == 0 ? 12 : h % 12
        return String(format: "%d:%02d %@", hour, m, ampm)
    }

    private func loadReservations(trigger: String = "unknown") async {
        print("[DiningReservations] load start (\(trigger))")
        guard let token = authManager.getAuthToken(),
              let url = URL(string: "\(APIConfiguration.baseURL)/member-bookings") else {
            print("[DiningReservations] load aborted (\(trigger)): missing token or URL")
            await MainActor.run { errorMessage = "Unable to load reservations."; isLoading = false }
            return
        }
        var request = URLRequest(url: url)
        request.setValue(token, forHTTPHeaderField: "x-session-token")
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  (200...299).contains(http.statusCode) else { throw URLError(.badServerResponse) }
            struct RawItem: Decodable {
                let id: String; let type: String
                let reservation_date: String?; let reservation_time: String?
                let meal_type: String?; let guest_count: Int; let status: String
                let special_requests: String?
            }
            struct RawResponse: Decodable { let upcoming: [RawItem]; let past: [RawItem] }
            let decoded = try JSONDecoder().decode(RawResponse.self, from: data)
            func toDiningItem(_ item: RawItem) -> DiningBookingItem? {
                guard item.type == "dining",
                      let date = item.reservation_date,
                      let time = item.reservation_time,
                      let meal = item.meal_type else { return nil }
                return DiningBookingItem(id: item.id, mealType: meal, reservationDate: date,
                                         reservationTime: time, guestCount: item.guest_count,
                                         status: item.status, specialRequests: item.special_requests)
            }
            await MainActor.run {
                upcoming = decoded.upcoming.compactMap(toDiningItem)
                past = decoded.past.compactMap(toDiningItem)
                isLoading = false
            }
            let upcomingDiningCount = decoded.upcoming.filter { $0.type == "dining" }.count
            let pastDiningCount = decoded.past.filter { $0.type == "dining" }.count
            print("[DiningReservations] load success (\(trigger)): upcoming=\(upcomingDiningCount) past=\(pastDiningCount)")
        } catch {
            print("[DiningReservations] load failed (\(trigger)): \(error.localizedDescription)")
            await MainActor.run { errorMessage = "Failed to load reservations."; isLoading = false }
        }
    }
}
