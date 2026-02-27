//
//  Dining.swift
//  CityUniClub app
//
//  Dining models
//

import Foundation

struct DiningReservation: Codable, Identifiable {
    let id: String
    let memberId: String
    let reservationDate: String
    let reservationTime: String
    let mealType: String
    let guestCount: Int
    let tablePreference: String?
    let specialRequests: String?
    let status: String
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case memberId = "member_id"
        case reservationDate = "reservation_date"
        case reservationTime = "reservation_time"
        case mealType = "meal_type"
        case guestCount = "guest_count"
        case tablePreference = "table_preference"
        case specialRequests = "special_requests"
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
