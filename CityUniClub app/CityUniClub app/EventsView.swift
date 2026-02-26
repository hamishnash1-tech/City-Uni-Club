import SwiftUI

struct EventsView: View {
    // Using ClubEvent instead of Event to avoid conflict
    let events: [ClubEvent] = [
        ClubEvent(title: "Sri Lankan Lunch and Dinner", dateString: "Wednesday 25 February", type: .lunchDinner),
        ClubEvent(title: "Younger Member's Dinner", dateString: "Thursday 26 February", type: .dinner),
        ClubEvent(title: "New Member, Candidates Meeting", dateString: "TBA", type: .meeting),
        ClubEvent(title: "St Patrick's Day Lunch", dateString: "Tuesday 17 March", type: .lunch),
        ClubEvent(title: "Younger Members Dinner", dateString: "Thursday 26 March", type: .dinner),
        ClubEvent(title: "4 Course French Tasting Menu with Paired Wines", dateString: "March (TBA)", type: .special),
        ClubEvent(title: "Sea Food Lunch", dateString: "April (tba)", type: .lunch),
        ClubEvent(title: "Literary Lunch", dateString: "Friday 17 April", type: .lunch),
        ClubEvent(title: "St George's Day Lunch", dateString: "Thursday 23 April", type: .lunch),
        ClubEvent(title: "Younger Members Dinner", dateString: "Thursday 30 April", type: .dinner),
        ClubEvent(title: "Royal Ascot Tent", dateString: "Wednesday 17 June", type: .special)
    ]
    
    @State private var selectedEvent: ClubEvent?
    @State private var showBookingSheet = false
    @State private var selectedMeal: MealOption?
    @State private var guestCount = 1
    @State private var specialRequests = ""
    @State private var showConfirmation = false
    
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
        .sheet(isPresented: $showBookingSheet) {
            bookingSheet
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .alert("Booking Confirmed", isPresented: $showConfirmation) {
            Button("OK", role: .cancel) { }
        } message: {
            if let event = selectedEvent {
                if event.type == .lunchDinner, let meal = selectedMeal {
                    Text("You have booked \(guestCount) ticket\(guestCount > 1 ? "s" : "") for \(meal.rawValue) at \(event.title)")
                } else {
                    Text("You have booked \(guestCount) ticket\(guestCount > 1 ? "s" : "") for \(event.title)")
                }
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
                        if event.type == .lunchDinner {
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
                        // Validate meal selection for lunch/dinner events
                        if event.type == .lunchDinner && selectedMeal == nil {
                            // Show error - but for now just return
                            return
                        }
                        showBookingSheet = false
                        showConfirmation = true
                    }) {
                        Text("Confirm Booking")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(
                                        (event.type == .lunchDinner && selectedMeal == nil) ?
                                        Color.gray : Color.oxfordBlue
                                    )
                            )
                    }
                    .disabled(event.type == .lunchDinner && selectedMeal == nil)
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
    let event: ClubEvent
    let onBook: () -> Void
    
    @State private var isHovered = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top accent bar with event type
            HStack {
                Image(systemName: event.type.icon)
                    .foregroundColor(.white)
                    .font(.system(size: 14))
                Text(eventTypeString)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                Spacer()
                if event.isTBA {
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
            .background(event.type.color)
            
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
                    
                    Text(event.displayDateTime)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.secondaryText)
                    
                    Spacer()
                }
                
                // Show time options indicator for lunch/dinner events
                if event.type == .lunchDinner {
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
        switch event.type {
        case .lunch: return "LUNCH"
        case .dinner: return "DINNER"
        case .lunchDinner: return "LUNCH & DINNER"
        case .meeting: return "MEETING"
        case .special: return "SPECIAL EVENT"
        }
    }
}

struct EventsView_Previews: PreviewProvider {
    static var previews: some View {
        EventsView()
    }
}
