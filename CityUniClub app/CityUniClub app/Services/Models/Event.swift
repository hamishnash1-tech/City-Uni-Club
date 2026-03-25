//
//  Event.swift
//  CityUniClub app
//
//  Event models
//

import Foundation

struct EventMyBooking: Codable {
    let id: String
    let status: String
    let guestCount: Int
    let specialRequests: String?

    enum CodingKeys: String, CodingKey {
        case id
        case status
        case guestCount = "guest_count"
        case specialRequests = "special_requests"
    }
}

struct Event: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let eventType: String
    let eventDate: String?
    let lunchTime: String?
    let dinnerTime: String?
    let pricePerPerson: Double?
    let maxCapacity: Int?
    let isTba: Bool
    let isActive: Bool
    let myBooking: EventMyBooking?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case eventType = "event_type"
        case eventDate = "event_date"
        case lunchTime = "lunch_time"
        case dinnerTime = "dinner_time"
        case pricePerPerson = "price_per_person"
        case maxCapacity = "max_capacity"
        case isTba = "is_tba"
        case isActive = "is_active"
        case myBooking = "my_booking"
    }
    
    var displayDate: String {
        guard let eventDate = eventDate, !isTba else { return "To Be Announced" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        if let date = formatter.date(from: eventDate) {
            let outputFormatter = DateFormatter()
            outputFormatter.dateFormat = "EEEE d MMMM"
            return outputFormatter.string(from: date)
        }
        return eventDate
    }
    
    var isPast: Bool {
        guard let dateString = eventDate, !isTba else { return false }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: dateString) else { return false }
        return date < Calendar.current.startOfDay(for: Date())
    }

    var displayDateTime: String {
        switch eventType {
        case "lunch":       return "\(displayDate) · 12:30 PM"
        case "dinner":      return "\(displayDate) · 7:00 PM"
        case "lunch_dinner": return "\(displayDate) · 12:30 PM & 7:00 PM"
        default:            return displayDate
        }
    }
}

struct EventBooking: Codable, Identifiable {
    let id: String
    let eventId: String
    let memberId: String?
    let mealOption: String?
    let guestCount: Int
    let specialRequests: String?
    let totalPrice: Double
    let status: String
    let bookedAt: String
    let event: Event?
    
    enum CodingKeys: String, CodingKey {
        case id
        case eventId = "event_id"
        case memberId = "member_id"
        case mealOption = "meal_option"
        case guestCount = "guest_count"
        case specialRequests = "special_requests"
        case totalPrice = "total_price"
        case status
        case bookedAt = "booked_at"
        case event
    }
}
