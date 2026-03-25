import SwiftUI

struct EventReservationItem: Identifiable {
    let id: String // booking id
    let title: String
    let eventType: String
    let eventDate: String?
    let isTba: Bool
    var guestCount: Int
    var status: String
    var specialRequests: String?

    func toEvent() -> Event {
        Event(
            id: id,
            title: title,
            description: nil,
            eventType: eventType,
            eventDate: eventDate,
            lunchTime: nil,
            dinnerTime: nil,
            pricePerPerson: nil,
            maxCapacity: nil,
            isTba: isTba,
            isActive: true,
            myBooking: EventMyBooking(id: id, status: status, guestCount: guestCount, specialRequests: specialRequests)
        )
    }
}

struct EventReservationsView: View {
    @EnvironmentObject var authManager: AuthManager

    @State private var upcoming: [EventReservationItem] = []
    @State private var past: [EventReservationItem] = []
    @State private var isLoading = true
    @State private var errorMessage: String? = nil

    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

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
                        Text("No event bookings found.")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.7))
                            .padding(.top, 60)
                    } else {
                        reservationSection(title: "Upcoming", items: $upcoming, emptyMessage: "No upcoming bookings.")
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
                print("[EventBookings] Pull-to-refresh triggered")
                await loadReservations(trigger: "pull_to_refresh")
            }
        }
        .navigationTitle("My Bookings")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task { await loadReservations(trigger: "initial_load") }
    }

    private func reservationSection(title: String, items: Binding<[EventReservationItem]>, emptyMessage: String?) -> some View {
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
                        let item = items[idx].wrappedValue
                        if item.status == "cancelled" {
                            reservationRow(item)
                        } else {
                            NavigationLink(destination: EventBookingDetailView(event: item.toEvent(), onUpdated: {
                                Task { await loadReservations() }
                            })) {
                                reservationRow(item)
                            }
                            .buttonStyle(.plain)
                        }

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

    private func reservationRow(_ r: EventReservationItem) -> some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(r.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                Text(r.isTba ? "Date TBA" : formatDate(r.eventDate))
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
                .opacity(r.status == "cancelled" ? 0 : 1)
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

    private func formatDate(_ dateStr: String?) -> String {
        guard let dateStr else { return "Date TBA" }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: dateStr) else { return dateStr }
        f.dateFormat = "EEE d MMM"
        return f.string(from: date)
    }

    private func loadReservations(trigger: String = "unknown") async {
        print("[EventBookings] load start (\(trigger))")
        guard let token = authManager.getAuthToken(),
              let url = URL(string: "\(APIConfiguration.baseURL)/member-bookings") else {
            print("[EventBookings] load aborted (\(trigger)): missing token or URL")
            await MainActor.run { errorMessage = "Unable to load bookings."; isLoading = false }
            return
        }

        var request = URLRequest(url: url)
        request.setValue(token, forHTTPHeaderField: "x-session-token")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  (200...299).contains(http.statusCode) else { throw URLError(.badServerResponse) }

            struct RawItem: Decodable {
                let id: String
                let type: String
                let title: String?
                let event_type: String?
                let event_date: String?
                let is_tba: Bool?
                let guest_count: Int
                let status: String
                let special_requests: String?
            }
            struct RawResponse: Decodable { let upcoming: [RawItem]; let past: [RawItem] }

            let decoded = try JSONDecoder().decode(RawResponse.self, from: data)

            func toEventItem(_ item: RawItem) -> EventReservationItem? {
                guard item.type == "event" else { return nil }
                return EventReservationItem(
                    id: item.id,
                    title: item.title ?? "Event Booking",
                    eventType: item.event_type ?? "special",
                    eventDate: item.event_date,
                    isTba: item.is_tba ?? (item.event_date == nil),
                    guestCount: item.guest_count,
                    status: item.status,
                    specialRequests: item.special_requests
                )
            }

            await MainActor.run {
                upcoming = decoded.upcoming.compactMap(toEventItem)
                past = decoded.past.compactMap(toEventItem)
                isLoading = false
            }
            let upcomingEventCount = decoded.upcoming.filter { $0.type == "event" }.count
            let pastEventCount = decoded.past.filter { $0.type == "event" }.count
            print("[EventBookings] load success (\(trigger)): upcoming=\(upcomingEventCount) past=\(pastEventCount)")
        } catch {
            print("[EventBookings] load failed (\(trigger)): \(error.localizedDescription)")
            await MainActor.run {
                errorMessage = "Failed to load bookings."
                isLoading = false
            }
        }
    }
}
