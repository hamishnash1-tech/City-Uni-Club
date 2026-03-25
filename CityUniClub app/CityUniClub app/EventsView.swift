import SwiftUI

struct EventsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var events: [Event] = []
    @State private var isLoading = true
    @State private var showError = false
    @State private var selectedEvent: Event?
    @State private var showBookingSheet = false
    @State private var selectedMeal: MealOption?
    @State private var guestCount = 0
    @State private var specialRequests = ""
    @State private var showConfirmation = false
    @State private var isBooking = false
    @State private var cancelTarget: Event? = nil
    @State private var isCancelling = false

    private let apiService = APIService.shared

    enum MealOption: String, CaseIterable, Identifiable {
        case lunch = "Lunch (12:30 PM)"
        case dinner = "Dinner (7:00 PM)"

        var id: String { self.rawValue }
    }
    
    var body: some View {
        NavigationStack {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                Text("Club Events")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.top, 50)
                    .padding(.bottom, 20)

                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.5)
                } else if showError {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.white.opacity(0.7))
                        Text("Failed to load events")
                            .foregroundColor(.white)
                        Button("Retry") {
                            loadEvents()
                        }
                        .padding()
                        .background(Color.cambridgeBlue)
                        .cornerRadius(10)
                    }
                } else if events.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 48))
                            .foregroundColor(.white.opacity(0.7))
                        Text("No upcoming events")
                            .foregroundColor(.white)
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(events) { event in
                                EventCard(
                                    event: event,
                                    onBook: {
                                        selectedEvent = event
                                        selectedMeal = nil
                                        guestCount = 1
                                        specialRequests = ""
                                        showBookingSheet = true
                                    },
                                    onCancel: { cancelTarget = event },
                                    onUpdated: { loadEvents() }
                                )
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 30)
                    }
                }
            }
        }
        .sheet(isPresented: $showBookingSheet) {
            bookingSheet
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .alert("Booking Confirmed", isPresented: $showConfirmation) {
            Button("OK", role: .cancel) { }
        } message: {
            if let event = selectedEvent {
                if event.eventType == "lunch_dinner", let meal = selectedMeal {
                    Text("You have booked \(guestCount) ticket\(guestCount > 1 ? "s" : "") for \(meal.rawValue) at \(event.title)")
                } else {
                    Text("You have booked \(guestCount) ticket\(guestCount > 1 ? "s" : "") for \(event.title)")
                }
            }
        }
        .alert("Cancel Booking", isPresented: Binding(
            get: { cancelTarget != nil },
            set: { if !$0 { cancelTarget = nil } }
        )) {
            Button("Cancel Booking", role: .destructive) {
                if let target = cancelTarget {
                    Task { await doCancelEventBooking(target) }
                }
            }
            Button("Keep Booking", role: .cancel) { cancelTarget = nil }
        } message: {
            if let event = cancelTarget {
                let warning = cancelNoticeWarning(event)
                if let w = warning {
                    Text(w)
                } else {
                    Text("Cancel your booking for \(event.title)?")
                }
            }
        }
        .onAppear {
            loadEvents()
        }
        } // NavigationStack
    }

    private func cancelNoticeWarning(_ event: Event) -> String? {
        guard let booking = event.myBooking,
              let dateStr = event.eventDate else { return nil }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let eventDate = f.date(from: dateStr) else { return nil }
        let hoursUntil = eventDate.timeIntervalSinceNow / 3600
        let threshold: Double = booking.guestCount >= 5 ? 48 : 24
        guard hoursUntil < threshold else { return nil }
        let thresholdStr = booking.guestCount >= 5 ? "48 hours" : "24 hours"
        return "This event is within \(thresholdStr). Cancellation may not be possible — please contact the club if you need assistance. Cancel anyway?"
    }

    private func doCancelEventBooking(_ event: Event) async {
        guard let booking = event.myBooking else { return }
        isCancelling = true
        cancelTarget = nil
        defer { isCancelling = false }
        do {
            try await apiService.cancelEventBooking(bookingId: booking.id)
            loadEvents()
        } catch {
            print("[Cancel] Error: \(error)")
        }
    }

    private func loadEvents() {
        isLoading = true
        showError = false

        Task {
            do {
                let loadedEvents = try await apiService.getEvents()
                
                // Filter out past events
                let today = Date()
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                
                let upcomingEvents = loadedEvents
                    .sorted { a, b in
                        // TBA events always go to the end
                        let aIsTba = a.isTba || a.eventDate == nil
                        let bIsTba = b.isTba || b.eventDate == nil
                        if aIsTba && bIsTba { return false }
                        if aIsTba { return false }
                        if bIsTba { return true }
                        guard let aDate = dateFormatter.date(from: a.eventDate!),
                              let bDate = dateFormatter.date(from: b.eventDate!) else { return false }
                        return aDate < bDate
                    }
                
                await MainActor.run {
                    self.events = upcomingEvents
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.showError = true
                    self.isLoading = false
                }
            }
        }
    }
    
    private func confirmBooking() async {
        guard let event = selectedEvent else { return }
        
        isBooking = true
        
        do {
            _ = try await apiService.bookEvent(
                eventId: event.id,
                guestCount: guestCount,
                specialRequests: specialRequests.isEmpty ? nil : specialRequests
            )
            
            await MainActor.run {
                isBooking = false
                showBookingSheet = false
                showConfirmation = true
            }
        } catch {
            await MainActor.run {
                isBooking = false
                showBookingSheet = false
                showError = true
            }
        }
    }
    
    // MARK: - Booking Sheet
    private var bookingSheet: some View {
        VStack(alignment: .leading, spacing: 24) {
            if let event = selectedEvent {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Book Tickets")
                        .font(.system(size: 28, weight: .bold, design: .serif))
                        .foregroundColor(.oxfordBlue)
                    
                    Text(event.title)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.secondaryText)
                    
                    HStack {
                        Image(systemName: "calendar")
                            .font(.system(size: 14))
                            .foregroundColor(.cambridgeBlue)
                        Text(event.displayDate)
                            .font(.system(size: 15))
                            .foregroundColor(.secondaryText)
                    }
                    .padding(.top, 4)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                
                Divider()
                    .padding(.horizontal, 24)
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Meal Selection for Lunch/Dinner Events
                        if event.eventType == "lunch_dinner" {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Select Sitting")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.oxfordBlue)

                                HStack(spacing: 16) {
                                    ForEach(MealOption.allCases) { meal in
                                        mealSelectionButton(meal)
                                    }
                                }
                            }
                        }
                        
                        // Guest Count
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Additional Guests")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.oxfordBlue)

                            HStack {
                                Image(systemName: "person.2.fill")
                                    .foregroundColor(.cambridgeBlue)
                                    .font(.system(size: 20))

                                HStack(spacing: 20) {
                                    Button {
                                        if guestCount > 0 { guestCount -= 1 }
                                    } label: {
                                        Image(systemName: "minus.circle.fill")
                                            .font(.system(size: 32))
                                            .foregroundColor(guestCount > 0 ? .oxfordBlue : .gray.opacity(0.3))
                                    }
                                    .disabled(guestCount <= 0)

                                    Text(guestCount == 0 ? "Just me" : "+\(guestCount)")
                                        .font(.system(size: guestCount == 0 ? 18 : 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.oxfordBlue)
                                        .frame(width: 80)

                                    Button {
                                        if guestCount < 5 { guestCount += 1 }
                                    } label: {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.system(size: 32))
                                            .foregroundColor(guestCount < 5 ? .oxfordBlue : .gray.opacity(0.3))
                                    }
                                    .disabled(guestCount >= 5)
                                }

                                Spacer()
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.gray.opacity(0.05))
                            )
                        }
                        
                        // Special Requests
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Special Requests")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.oxfordBlue)
                            
                            TextField("Dietary requirements, seating preferences...", text: $specialRequests)
                                .font(.system(size: 15))
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Price Summary
                        if let event = selectedEvent, let price = event.pricePerPerson, price > 0 {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("Ticket Price:")
                                        .font(.system(size: 15))
                                    Spacer()
                                    Text("£\(Int(price)) per person")
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(.oxfordBlue)
                                }

                                HStack {
                                    Text("Total:")
                                        .font(.system(size: 18, weight: .bold))
                                    Spacer()
                                    Text("£\(Int(price * Double(1 + guestCount)))")
                                        .font(.system(size: 22, weight: .bold))
                                        .foregroundColor(.oxfordBlue)
                                }
                                .padding(.top, 8)
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.gray.opacity(0.05))
                            )
                        }
                    }
                    .padding(.horizontal, 24)
                }
                
                Divider()
                    .padding(.horizontal, 24)
                
                // Confirm Button
                HStack {
                    Button(action: {
                        showBookingSheet = false
                    }) {
                        Text("Cancel")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.secondaryText)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                            )
                    }
                    
                    Button(action: {
                        Task {
                            await confirmBooking()
                        }
                    }) {
                        HStack {
                            if isBooking {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            } else {
                                Text("Confirm Booking")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(
                                    (event.eventType == "lunch_dinner" && selectedMeal == nil) || isBooking ?
                                    Color.gray : Color.oxfordBlue
                                )
                        )
                    }
                    .disabled((event.eventType == "lunch_dinner" && selectedMeal == nil) || isBooking)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 30)
            }
        }
        .background(Color.cardWhite)
    }
    
    private func mealSelectionButton(_ meal: MealOption) -> some View {
        let isSelected = selectedMeal == meal
        
        return Button {
            selectedMeal = meal
        } label: {
            VStack(spacing: 8) {
                Image(systemName: meal == .lunch ? "sun.max.fill" : "moon.stars.fill")
                    .font(.system(size: 24))
                Text(meal == .lunch ? "Lunch" : "Dinner")
                    .font(.system(size: 14, weight: .semibold))
                Text(meal == .lunch ? "12:30 PM" : "7:00 PM")
                    .font(.system(size: 12))
            }
            .foregroundColor(isSelected ? .white : .oxfordBlue)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.oxfordBlue : Color.gray.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.clear : Color.oxfordBlue.opacity(0.3), lineWidth: 1)
            )
        }
    }
}

// MARK: - Event Model
struct ClubEvent: Identifiable {
    let id = UUID()
    let title: String
    let dateString: String
    let type: EventType
    
    var displayDate: String {
        if dateString.lowercased() == "tba" || dateString.contains("TBA") || dateString.contains("tba") {
            return "To Be Announced"
        }
        return dateString
    }
    
    var displayDateTime: String {
        switch type {
        case .lunch:
            return "\(dateString) · 12:30 PM"
        case .dinner:
            return "\(dateString) · 7:00 PM"
        case .lunchDinner:
            return "\(dateString) · 12:30 PM & 7:00 PM"
        default:
            return dateString
        }
    }
    
    var isTBA: Bool {
        dateString.lowercased().contains("tba")
    }
}

enum EventType {
    case lunch, dinner, lunchDinner, meeting, special
    
    var icon: String {
        switch self {
        case .lunch: return "sun.max.fill"
        case .dinner: return "moon.stars.fill"
        case .lunchDinner: return "sun.and.horizon.fill"
        case .meeting: return "person.2.fill"
        case .special: return "star.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .lunch: return .orange
        case .dinner: return .indigo
        case .lunchDinner: return .cambridgeBlue
        case .meeting: return .clubGold
        case .special: return .pink
        }
    }
}

// MARK: - Event Card Component
struct EventCard: View {
    let event: Event
    let onBook: () -> Void
    let onCancel: (() -> Void)?
    let onUpdated: (() -> Void)?

    @State private var isHovered = false

    private var bookingStatus: String? { event.myBooking?.status }
    private var isActiveBooking: Bool {
        guard let status = bookingStatus else { return false }
        return status != "cancelled"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top accent bar with event type
            HStack {
                Text(eventTypeString)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(bookingStatus != nil ? .oxfordBlue : .white)
                Spacer()
                if let status = bookingStatus {
                    HStack(spacing: 4) {
                        Image(systemName: status == "confirmed" ? "checkmark.circle.fill" : "clock.fill")
                            .font(.system(size: 10))
                        Text(status == "confirmed" ? "Booked" : status == "pending" ? "Pending" : status.capitalized)
                            .font(.system(size: 10, weight: .bold))
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.oxfordBlue.opacity(0.15))
                    .cornerRadius(4)
                    .foregroundColor(.oxfordBlue)
                } else if event.isTba {
                    Text("TBA")
                        .font(.system(size: 10, weight: .bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.white.opacity(0.3))
                        .cornerRadius(4)
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(
                event.isPast ? eventTypeColor.opacity(0.3)
                : bookingStatus != nil ? Color.cambridgeBlue.opacity(0.35)
                : eventTypeColor
            )

            // Main content
            VStack(alignment: .leading, spacing: 12) {
                Text(event.title)
                    .font(.system(size: 18, weight: .semibold, design: .serif))
                    .foregroundColor(.oxfordBlue)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 8)

                HStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.system(size: 14))
                        .foregroundColor(.cambridgeBlue)

                    Text(event.displayDate)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.secondaryText)

                    Spacer()
                }

                HStack(spacing: 8) {
                    Image(systemName: "sterlingsign.circle")
                        .font(.system(size: 14))
                        .foregroundColor(.cambridgeBlue)
                    if let price = event.pricePerPerson, price > 0 {
                        Text("£\(Int(price)) per person")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.secondaryText)
                    } else {
                        Text("£TBA")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.secondaryText)
                    }
                    Spacer()
                }

                Divider()
                    .background(Color.gray.opacity(0.2))

                if event.isPast && isActiveBooking {
                    NavigationLink(destination: EventBookingDetailView(event: event, onUpdated: onUpdated ?? {})) {
                        manageBookingRow
                    }
                    .buttonStyle(.plain)
                } else if event.isPast {
                    HStack {
                        Spacer()
                        Text("This event has passed")
                            .font(.system(size: 13))
                            .foregroundColor(.secondaryText.opacity(0.7))
                            .multilineTextAlignment(.center)
                        Spacer()
                    }
                    .padding(.vertical, 10)
                } else if event.isTba {
                    HStack {
                        Spacer()
                        Text("Bookings open when date is confirmed")
                            .font(.system(size: 13))
                            .foregroundColor(.secondaryText)
                            .multilineTextAlignment(.center)
                        Spacer()
                    }
                    .padding(.vertical, 10)
                } else if isActiveBooking {
                    NavigationLink(destination: EventBookingDetailView(event: event, onUpdated: onUpdated ?? {})) {
                        manageBookingRow
                    }
                    .buttonStyle(.plain)
                } else {
                    // Book Tickets Button
                    Button(action: onBook) {
                        HStack {
                            Spacer()
                            Image(systemName: "ticket.fill")
                                .font(.system(size: 16))
                            Text("Book Tickets")
                                .font(.system(size: 16, weight: .semibold))
                            Spacer()
                        }
                        .foregroundColor(.white)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.oxfordBlue)
                        )
                    }
                    .scaleEffect(isHovered ? 0.98 : 1.0)
                    .animation(.spring(response: 0.3), value: isHovered)
                    .onLongPressGesture(minimumDuration: .infinity, maximumDistance: .infinity, pressing: { pressing in
                        isHovered = pressing
                    }, perform: { })
                }
            }
            .padding(16)
        }
        .background(Color.cardWhite)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: Color.black.opacity(0.1), radius: 15, x: 0, y: 5)
    }

    private var manageBookingRow: some View {
        HStack {
            Spacer()
            Image(systemName: "ticket")
                .font(.system(size: 15))
            Text("Manage Booking")
                .font(.system(size: 15, weight: .medium))
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.oxfordBlue.opacity(0.4))
        }
        .foregroundColor(.oxfordBlue)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.oxfordBlue.opacity(0.3), lineWidth: 1)
        )
    }

    private var eventTypeString: String {
        switch event.eventType {
        case "lunch": return "LUNCH"
        case "dinner": return "DINNER"
        case "lunch_dinner": return "LUNCH & DINNER"
        case "meeting": return "MEETING"
        case "special": return "SPECIAL EVENT"
        default: return "EVENT"
        }
    }
    
    private var eventTypeColor: Color {
        switch event.eventType {
        case "lunch": return .orange
        case "dinner": return .indigo
        case "lunch_dinner": return .cambridgeBlue
        case "meeting": return .clubGold
        case "special": return .pink
        default: return .gray
        }
    }
}

struct EventsView_Previews: PreviewProvider {
    static var previews: some View {
        EventsView()
    }
}
