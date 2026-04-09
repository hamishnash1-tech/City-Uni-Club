import SwiftUI

struct DiningView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedMealType = "Lunch"
    @State private var selectedDate = Date()
    @State private var selectedTime: String? = "12:30"
    @State private var guestCount = 2
    @State private var isSubmitting = false
    @State private var errorMessage: String? = nil
    @State private var showReservations = false

    // Breakfast: 8:00-11:00, Lunch: 12:00-14:30
    let breakfastSlots = [ "09:00", "09:30", "10:00", "10:30", "11:00"]
    let lunchSlots = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]
    
    var timeSlots: [String] {
        selectedMealType == "Breakfast" ? breakfastSlots : lunchSlots
    }
    
    var body: some View {
        NavigationStack {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Spacer()
                    Text("Dining")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding(.top, 50)
                .padding(.bottom, 12)

                Button { showReservations = true } label: {
                    HStack {
                        Image(systemName: "calendar.badge.clock")
                            .font(.system(size: 16))
                        Text("My Reservations")
                            .font(.system(size: 14, weight: .semibold))
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .semibold))
                            .opacity(0.7)
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.white.opacity(0.15))
                    .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
                
                // Meal Type Toggle - Cambridge Blue
                HStack(spacing: 10) {
                    mealTypeButton("Breakfast")
                    mealTypeButton("Lunch")
                    mealTypeButton("Canapés")
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Menu Card
                        menuCard

                        // Reservation Section (not shown for Canapés)
                        if selectedMealType != "Canapés" {
                            reservationSection
                        }
                    }
                    .padding(.bottom, 100)
                }
            }
        }
        .navigationDestination(isPresented: $showReservations) {
            DiningReservationsView()
        }
        }
    }

    // MARK: - Reservation Section
    private var reservationSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Reserve a Table")
                .font(.system(size: 22, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
            
            // Date Picker - Oxford Blue
            VStack(alignment: .leading, spacing: 10) {
                Text("Select Date")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondaryText)
                
                ScrollViewReader { proxy in
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(-1..<15) { day in
                                datePickerButton(day: day)
                                    .id(day)
                            }
                        }
                    }
                    .onAppear {
                        proxy.scrollTo(0, anchor: .leading)
                    }
                }
            }
            
            // Time Selection - Oxford Blue
            VStack(alignment: .leading, spacing: 10) {
                Text("Select Time")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondaryText)
                
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible())
                ], spacing: 10) {
                    ForEach(timeSlots, id: \.self) { time in
                        timeSlotButton(time: time)
                    }
                }
            }
            
            // Guest Counter
            VStack(alignment: .leading, spacing: 10) {
                Text("Number of Guests")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondaryText)
                
                HStack {
                    Image(systemName: "person.2.fill")
                        .foregroundColor(.cambridgeBlue)
                        .font(.system(size: 18))
                    
                    HStack(spacing: 16) {
                        Button {
                            if guestCount > 1 { guestCount -= 1 }
                        } label: {
                            Image(systemName: "minus.circle.fill")
                                .font(.system(size: 28))
                                .foregroundColor(.oxfordBlue.opacity(0.3))
                        }
                        
                        Text("\(guestCount)")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(.oxfordBlue)
                            .frame(width: 50)
                        
                        Button {
                            if guestCount < 10 { guestCount += 1 }
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 28))
                                .foregroundColor(.oxfordBlue)
                        }
                    }
                    Spacer()
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.05))
                )
            }
            
            if let error = errorMessage {
                Text(error)
                    .font(.system(size: 13))
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
            }


            // Confirm Button
            Button {
                Task { await submitReservation() }
            } label: {
                HStack {
                    if isSubmitting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 16))
                        Text("Request Reservation")
                            .font(.system(size: 15, weight: .semibold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(selectedTime == nil || isSubmitting ? Color.gray : Color.oxfordBlue)
                        .shadow(color: Color.oxfordBlue.opacity(0.4), radius: 8, x: 0, y: 4)
                )
            }
            .disabled(selectedTime == nil || isSubmitting)

            // Summary
            Text("Reserving for \(guestCount) guest\(guestCount > 1 ? "s" : "") on \(formattedDate) at \(selectedTime ?? "—")")
                .font(.system(size: 12))
                .foregroundColor(.secondaryText)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.cardWhite)
                .shadow(color: Color.black.opacity(0.08), radius: 15, x: 0, y: 8)
        )
        .padding(.horizontal, 20)
    }
    
    // MARK: - Date Picker Button - Oxford Blue
    private func datePickerButton(day: Int) -> some View {
        let date = Calendar.current.date(byAdding: .day, value: day, to: Date())!
        
        let dayFormatter = DateFormatter()
        dayFormatter.dateFormat = "EEE"
        let dayName = dayFormatter.string(from: date)
        
        let numberFormatter = DateFormatter()
        numberFormatter.dateFormat = "d"
        let dayNumber = numberFormatter.string(from: date)
        
        let monthFormatter = DateFormatter()
        monthFormatter.dateFormat = "MMM"
        let monthName = monthFormatter.string(from: date)
        
        let isSelected = Calendar.current.isDate(date, inSameDayAs: selectedDate)
        
        return Button {
            selectedDate = date
        } label: {
            VStack(spacing: 4) {
                Text(dayName)
                    .font(.system(size: 11, weight: .medium))
                Text(dayNumber)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                Text(monthName)
                    .font(.system(size: 11, weight: .medium))
            }
            .frame(width: 60, height: 65)
            .foregroundColor(isSelected ? .white : .secondaryText)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.oxfordBlue : Color.gray.opacity(0.1))
                    .shadow(color: isSelected ? Color.oxfordBlue.opacity(0.4) : Color.clear, radius: 5, x: 0, y: 3)
            )
        }
    }
    
    // MARK: - Time Slot Button - Oxford Blue
    private func timeSlotButton(time: String) -> some View {
        let isSelected = selectedTime == time
        
        return Button {
            selectedTime = time
        } label: {
            Text(time)
                .font(.system(size: 14, weight: isSelected ? .semibold : .regular))
                .foregroundColor(isSelected ? .white : .oxfordBlue)
                .frame(minWidth: 70, maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(isSelected ? Color.oxfordBlue : Color.gray.opacity(0.1))
                        .shadow(color: isSelected ? Color.oxfordBlue.opacity(0.4) : Color.clear, radius: 5, x: 0, y: 3)
                )
        }
    }
    
    // MARK: - Meal Type Button - Cambridge Blue
    private func mealTypeButton(_ type: String) -> some View {
        let isSelected = selectedMealType == type
        
        return Button {
            selectedMealType = type
        } label: {
            Text(type)
                .font(.system(size: 14, weight: isSelected ? .semibold : .regular))
                .foregroundColor(isSelected ? .white : .secondaryText)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(isSelected ? Color.cambridgeBlue : Color.gray.opacity(0.15))
                        .shadow(color: isSelected ? Color.cambridgeBlue.opacity(0.4) : Color.clear, radius: 4, x: 0, y: 2)
                )
        }
    }
    
    // MARK: - Menu Card
    private var menuCard: some View {
        VStack(alignment: .leading, spacing: 18) {
            if selectedMealType == "Breakfast" {
                // BREAKFAST MENU - No Prices
                menuSection(title: "🍳 BREAKFAST", items: [
                    "Full English",
                    "Continental Breakfast",
                    "Vegan/Vegetarian Full English",
                    "Smoked Salmon & Scrambled Eggs",
                    "Bacon or Sausage Sandwich"
                ])
            } else if selectedMealType == "Canapés" {
                menuSection(title: "CANAPÉS", items: [
                    "Rare Roast Beef mini-Yorkshire puddings horseradish cream",
                    "Truffled mushroom and brie de Meaux",
                    "Soy glazed belly of pork served on Chinese spoons",
                    "Spinach and goats cheese frittata",
                    "Honey glazed cocktail sausages",
                    "Smoked Salmon Blinis",
                    "Bloody Mary Prawn cocktail croustades",
                    "Goats cheese and spinach tartlets",
                    "Chicken yakatori skewers",
                    "Mini cod's of fish and chips",
                    "Rosary ash goats cheese tartlets",
                    "Mini vegetable and meat spring rolls and samosas",
                    "Chicken liver parfait on toasted rye bread"
                ])
            } else {
                // LUNCH MENU - No Prices
                menuSection(title: "🍽️ STARTERS", items: [
                    "Homemade Soup of the Day",
                    "CUC Prawn Cocktail",
                    "Devilled Kidneys, With Toasted Sourdough",
                    "Goats Cheese, Tomato and Spinach Tart, Dressed Salad",
                    "Smoked Salmon Plate, Capers, Shallots, Lemon Oil, Brown Bread and Butter"
                ])

                Divider().background(Color.gray.opacity(0.2))

                menuSection(title: "🥩 MAINS", items: [
                    "Oven Roasted Breast of Free-Range Chicken, Colcannon Potatoes, Braised Carrots, Bourguignon Sauce",
                    "Pan Fried Fillet of Sea Bream, Herb Butter, New Potatoes, Carrot Puree, Braised Fennel, Watercress and Pernod Cream Sauce",
                    "\"CUC\" Confit Belly of Pork, Bacon and Apple Mash, Buttered Sweetheart Cabbage, Seasonal Vegetables, Crackling, Apple Sauce and Cider Jus",
                    "Roast Rump and Braised Lamb Shoulder Rissole, Tomato and Basil Fondue, Herb Broad Beans and Peas, Red Currant Jus",
                    "Whole Dover Sole \"on or off the bone\", Spinach, Parsley Steamed New Potatoes, Tomato and Caper Butter Sauce",
                    "Homemade Pasta, Wilted Spinach, Porcini Cream, Freshly Grated Parmesan Truffle Oil"
                ])

                Divider().background(Color.gray.opacity(0.2))

                menuSection(title: "🧀 DESSERTS & CHEESE", items: [
                    "\"CUC\" Sticky Toffee Pudding, Vanilla Custard",
                    "Chocolate Fondant, Vanilla Ice Cream and Chocolate Sauce",
                    "Selection of Cheeses, Celery, Grapes and Crackers",
                    "Selection of Ice Cream and Sorbets"
                ])

                Divider().background(Color.gray.opacity(0.2))

                beverageSection(title: "🍷 DESSERT WINE", items: [
                    ("Sauterne – Château Les Mingets 2019", "Bottle · Glass"),
                    ("Alison Botrytis Riesling 2020", "Half Bottle"),
                ])

                Divider().background(Color.gray.opacity(0.2))

                beverageSection(title: "🍷 PORT", items: [
                    ("Quinta Da Roenda – Croft 2004", "Glass"),
                    ("Fonseca Reserve Bin 27", "Glass"),
                ])
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.cardWhite)
                .shadow(color: Color.black.opacity(0.08), radius: 15, x: 0, y: 8)
        )
        .padding(.horizontal, 20)
    }

    // MARK: - Beverage Section (with format label)
    private func beverageSection(title: String, items: [(String, String)]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.system(size: 16, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)

            ForEach(items, id: \.0) { (name, format) in
                HStack(alignment: .top) {
                    Text(name)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.darkText)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(format)
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.trailing)
                }
                .padding(.vertical, 2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Menu Section (No Prices)
    private func menuSection(title: String, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.system(size: 16, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)

            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.darkText)
                    .padding(.vertical, 2)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Formatted Date (display)
    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM yyyy"
        return formatter.string(from: selectedDate)
    }

    // MARK: - API Date (YYYY-MM-DD)
    private var apiDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: selectedDate)
    }

    // MARK: - Submit Reservation
    private func submitReservation() async {
        guard let time = selectedTime else { return }
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }

        guard let url = URL(string: "\(APIConfiguration.baseURL)/dining") else { return }
        guard let token = authManager.getAuthToken() else {
            errorMessage = "You must be logged in to make a reservation."
            return
        }

        struct Body: Encodable {
            let reservation_date: String
            let reservation_time: String
            let meal_type: String
            let guest_count: Int
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "x-session-token")
        request.httpBody = try? JSONEncoder().encode(Body(
            reservation_date: apiDate,
            reservation_time: time,
            meal_type: selectedMealType,
            guest_count: guestCount
        ))

        print("[API] POST \(url.absoluteString)")
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else {
                errorMessage = "Unexpected error. Please try again."
                return
            }
            print("[API] \(http.statusCode) POST \(url.absoluteString)")
            if (200...299).contains(http.statusCode) {
                selectedTime = selectedMealType == "Breakfast" ? "09:00" : "12:30"
                showReservations = true
            } else {
                let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                    .flatMap { $0["error"] as? String } ?? "Failed to submit reservation."
                print("[API] Error body: \(String(data: data, encoding: .utf8) ?? "<non-utf8>")")
                errorMessage = msg
            }
        } catch {
            errorMessage = "Network error. Please try again."
        }
    }
}

struct DiningView_Previews: PreviewProvider {
    static var previews: some View {
        DiningView()
    }
}
