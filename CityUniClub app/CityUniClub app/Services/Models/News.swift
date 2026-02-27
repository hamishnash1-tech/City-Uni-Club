//
//  News.swift
//  CityUniClub app
//
//  News models
//

import Foundation

struct ClubNews: Codable, Identifiable {
    let id: String
    let title: String
    let content: String
    let category: String
    let publishedDate: String
    let isFeatured: Bool
    let isActive: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case content
        case category
        case publishedDate = "published_date"
        case isFeatured = "is_featured"
        case isActive = "is_active"
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        if let date = formatter.date(from: publishedDate) {
            let outputFormatter = DateFormatter()
            outputFormatter.dateFormat = "MMMM yyyy"
            return outputFormatter.string(from: date)
        }
        return publishedDate
    }
}
