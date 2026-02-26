import SwiftUI

struct DiningView: View {
    @State private var selectedMealType = "Lunch"
    @State private var selectedDate = Date()
    @State private var selectedTime: String? = "12:30"
    @State private var guestCount = 2
    
    // Breakfast: 8:00-11:00, Lunch: 12:00-14:30
    let breakfastSlots = [ "09:00", "09:30", "10:00", "10:30", "11:00"]
    let lunchSlots = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]
    
    var timeSlots: [String] {
        selectedMealType == "Breakfast" ? breakfastSlots : lunchSlots
    }
    
    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                Text("Dining")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.top, 50)
                    .padding(.bottom, 20)
                
                // Meal Type Toggle - Cambridge Blue
                HStack(spacing: 0) {
                    mealTypeButton("Breakfast")
                    mealTypeButton("Lunch")
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Menu Card
                        menuCard
                        
                        // Reservation Section
                        reservationSection
                    }
                    .padding(.bottom, 100)
                }
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
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(0..<7) { day in
                            datePickerButton(day: day)
                        }
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
            
            // Confirm Button - Oxford Blue Gradient
            Button {
                // Reservation action
            } label: {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                    Text("Confirm Reservation")
                        .font(.system(size: 15, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.oxfordBlue)
                        .shadow(color: Color.oxfordBlue.opacity(0.4), radius: 8, x: 0, y: 4)
                )
            }
            
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
            } else {
                // LUNCH MENU - No Prices
                menuSection(title: "🍽️ STARTERS", items: [
                    "Homemade Soup of the Day",
                    "Chilli Garlic Pan Fried Tiger Prawns & Chorizo",
                    "Aged Cheddar Cheese & Caramelised Red Onion Tart",
                    "Devilled Kidneys",
                    "Crispy Ham Hock Croquettes",
                    "Smoked Salmon Plate"
                ])
                
                Divider().background(Color.gray.opacity(0.2))
                
                menuSection(title: "🥩 MAINS", items: [
                    "Roast Rump of Lamb",
                    "Pan Fried Delice of Salmon",
                    "Confit Belly of English Pork",
                    "Oven Roasted Free Range Chicken",
                    "Homemade Truffle Mushroom Tortellinis",
                    "Whole Dover Sole"
                ])
                
                Divider().background(Color.gray.opacity(0.2))
                
                menuSection(title: "🧀 DESSERTS & SAVOURIES", items: [
                    "Apricot and Pistachio Tart",
                    "Selection of Cheeses",
                    "Ice Creams",
                    "Sticky Toffee Pudding"
                ])
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.cardWhite)
                .shadow(color: Color.black.opacity(0.08), radius: 15, x: 0, y: 8)
        )
        .padding(.horizontal, 20)
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
            }
        }
    }
    
    // MARK: - Formatted Date
    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM yyyy"
        return formatter.string(from: selectedDate)
    }
}

struct DiningView_Previews: PreviewProvider {
    static var previews: some View {
        DiningView()
    }
}
