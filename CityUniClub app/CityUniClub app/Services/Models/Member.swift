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
    let firstName: String?
    let middleName: String?
    let lastName: String?
    let phoneNumber: String?
    let membershipType: String?
    let memberSince: String?
    let memberUntil: String?
    let isActive: Bool?

    var fullName: String {
        [firstName, middleName, lastName].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " ")
    }

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case firstName = "first_name"
        case middleName = "middle_name"
        case lastName = "last_name"
        case phoneNumber = "phone_number"
        case membershipType = "membership_type"
        case memberSince = "member_since"
        case memberUntil = "member_until"
        case isActive = "is_active"
    }
}

struct MemberProfile {
    let id: String
    let memberId: String
    let dietaryRequirements: String?
    let notificationEnabled: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case memberId = "member_id"
        case dietaryRequirements = "dietary_requirements"
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
