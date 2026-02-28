import SwiftUI

struct EventsView: View {
    @State private var events: [Event] = []
    @State private var isLoading = true
    @State private var showError = false
    @State private var selectedEvent: Event?
    @State private var showBookingSheet = false
    @State private var selectedMeal: MealOption?
    @State private var guestCount = 1
    @State private var specialRequests = ""
    @State private var showConfirmation = false
    @State private var isBooking = false
    
    private let apiService = APIService.shared

    enum MealOption: String, CaseIterable, Identifiable {
        case lunch = "Lunch (12:30 PM)"
        case dinner = "Dinner (7:00 PM)"

        var id: String { self.rawValue }
    }
    
    var body: some View {
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
                                    }
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
        .onAppear {
            loadEvents()
        }
    }
    
    private func loadEvents() {
        isLoading = true
        showError = false

        Task {
            do {
                let loadedEvents = try await apiService.getEvents(upcoming: true)
                
                // Filter out past events
                let today = Date()
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                
                let upcomingEvents = loadedEvents.filter { event in
                    if let eventDate = dateFormatter.date(from: event.eventDate) {
                        return eventDate >= today
                    }
                    return false
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
            let mealOption: String? = selectedMeal?.rawValue == "Lunch (12:30 PM)" ? "lunch" : 
                                       selectedMeal?.rawValue == "Dinner (7:00 PM)" ? "dinner" : nil
            
            _ = try await apiService.bookEvent(
                eventId: event.id,
                mealOption: mealOption,
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
                            Text("Number of Guests")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.oxfordBlue)
                            
                            HStack {
                                Image(systemName: "person.2.fill")
                                    .foregroundColor(.cambridgeBlue)
                                    .font(.system(size: 20))
                                
                                HStack(spacing: 20) {
                                    Button {
                                        if guestCount > 1 { guestCount -= 1 }
                                    } label: {
                                        Image(systemName: "minus.circle.fill")
                                            .font(.system(size: 32))
                                            .foregroundColor(guestCount > 1 ? .oxfordBlue : .gray.opacity(0.3))
                                    }
                                    .disabled(guestCount <= 1)
                                    
                                    Text("\(guestCount)")
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.oxfordBlue)
                                        .frame(width: 60)
                                    
                                    Button {
                                        if guestCount < 10 { guestCount += 1 }
                                    } label: {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.system(size: 32))
                                            .foregroundColor(guestCount < 10 ? .oxfordBlue : .gray.opacity(0.3))
                                    }
                                    .disabled(guestCount >= 10)
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
                        
                        // Price Summary (example)
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Ticket Price:")
                                    .font(.system(size: 15))
                                Spacer()
                                Text("£45 per person")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(.oxfordBlue)
                            }
                            
                            HStack {
                                Text("Total:")
                                    .font(.system(size: 18, weight: .bold))
                                Spacer()
                                Text("£\(guestCount * 45)")
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

    @State private var isHovered = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top accent bar with event type
            HStack {
                Image(systemName: eventTypeIcon)
                    .foregroundColor(.white)
                    .font(.system(size: 14))
                Text(eventTypeString)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                Spacer()
                if event.isTba {
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
            .background(eventTypeColor)

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

                // Show time options indicator for lunch/dinner events
                if event.eventType == "lunch_dinner" {
                    HStack(spacing: 12) {
                        Label("Lunch 12:30", systemImage: "sun.max.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.orange)
                        Label("Dinner 19:00", systemImage: "moon.stars.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.indigo)
                    }
                    .padding(.top, 4)
                }

                Divider()
                    .background(Color.gray.opacity(0.2))

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
            .padding(16)
        }
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.cardWhite)
                .shadow(color: Color.black.opacity(0.1), radius: 15, x: 0, y: 5)
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
    
    private var eventTypeIcon: String {
        switch event.eventType {
        case "lunch": return "sun.max.fill"
        case "dinner": return "moon.stars.fill"
        case "lunch_dinner": return "sun.and.horizon.fill"
        case "meeting": return "person.2.fill"
        case "special": return "star.fill"
        default: return "calendar"
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
