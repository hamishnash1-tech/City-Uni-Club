import SwiftUI

extension Color {
    // Oxford Blue - Dark navy (#002147)
    static let oxfordBlue = Color(red: 0/255, green: 33/255, blue: 71/255)
    
    // Cambridge Blue - Soft blue/green from image (#8AB8D6)
    static let cambridgeBlue = Color(red: 138/255, green: 184/255, blue: 214/255)
    
    // ADD THIS LINE - Light Cambridge for backgrounds
    static let lightCambridge = Color(red: 230/255, green: 240/255, blue: 250/255)
    
    // Gold/Cream color for logo circle
    static let clubGold = Color(red: 212/255, green: 175/255, blue: 55/255)
    
    // Address text gray (#666666)
    static let addressGray = Color(red: 102/255, green: 102/255, blue: 102/255)
    // Dark text
        static let darkText = Color(red: 0.18, green: 0.28, blue: 0.32)
        
    // Secondary text gray (#444444)
    static let secondaryText = Color(red: 68/255, green: 68/255, blue: 68/255)
    
    // Card background white
    static let cardWhite = Color.white
    
    // Signature line color
        static let signatureLine = Color.oxfordBlue
        
        // Background overlay
        static let backgroundOverlay = Color.oxfordBlue.opacity(0.4)
        
        // Tab bar background
        static let tabBarBackground = Color.white.opacity(0.95)
        
        // Selected tab background
        static let selectedTabBackground = Color.oxfordBlue.opacity(0.1)
    
    
    // Hex initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
