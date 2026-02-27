//
//  APIError.swift
//  CityUniClub app
//
//  Error handling for API calls
//

import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case networkError(Error)
    case httpError(statusCode: Int, message: String)
    case unauthorized
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError:
            return "Failed to parse response"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .httpError(_, let message):
            return message
        case .unauthorized:
            return "Please login to continue"
        case .serverError:
            return "Server error. Please try again later"
        }
    }
}
