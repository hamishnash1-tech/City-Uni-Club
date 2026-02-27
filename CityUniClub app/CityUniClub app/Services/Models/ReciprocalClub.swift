//
//  ReciprocalClub.swift
//  CityUniClub app
//
//  Reciprocal Club models
//

import Foundation

struct ReciprocalClub: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let location: String
    let region: String
    let country: String
    let note: String?
    let contactEmail: String?
    let contactPhone: String?
    let isActive: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case location
        case region
        case country
        case note
        case contactEmail = "contact_email"
        case contactPhone = "contact_phone"
        case isActive = "is_active"
    }
}

struct LoiRequest: Codable, Identifiable {
    let id: String
    let memberId: String
    let clubId: String
    let arrivalDate: String
    let departureDate: String
    let purpose: String
    let specialRequests: String?
    let status: String
    let secretaryNotes: String?
    let requestedAt: String
    let club: ReciprocalClub?
    
    enum CodingKeys: String, CodingKey {
        case id
        case memberId = "member_id"
        case clubId = "club_id"
        case arrivalDate = "arrival_date"
        case departureDate = "departure_date"
        case purpose
        case specialRequests = "special_requests"
        case status
        case secretaryNotes = "secretary_notes"
        case requestedAt = "requested_at"
        case club
    }
}
