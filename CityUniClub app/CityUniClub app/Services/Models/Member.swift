//
//  Member.swift
//  CityUniClub app
//
//  Member model
//

import Foundation

struct Member: Codable, Identifiable {
    let id: String
    let email: String
    let fullName: String
    let firstName: String
    let phoneNumber: String?
    let membershipNumber: String
    let membershipType: String
    let memberSince: String?
    let memberUntil: String?
    let isActive: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case fullName = "full_name"
        case firstName = "first_name"
        case phoneNumber = "phone_number"
        case membershipNumber = "membership_number"
        case membershipType = "membership_type"
        case memberSince = "member_since"
        case memberUntil = "member_until"
        case isActive = "is_active"
    }
}

struct MemberProfile: Codable {
    let id: String
    let memberId: String
    let dietaryRequirements: String?
    let preferences: [String: Any]?
    let notificationEnabled: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case memberId = "member_id"
        case dietaryRequirements = "dietary_requirements"
        case preferences
        case notificationEnabled = "notification_enabled"
    }
}

struct AuthResponse: Codable {
    let member: Member
    let session: Session
}

struct Session: Codable {
    let token: String
    let expiresAt: String
    
    enum CodingKeys: String, CodingKey {
        case token
        case expiresAt = "expires_at"
    }
}
