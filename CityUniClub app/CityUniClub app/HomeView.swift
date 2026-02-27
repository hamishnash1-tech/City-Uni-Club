import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var member: Member? {
        authManager.currentMember
    }
    
    var formattedMemberUntil: String {
        guard let memberUntil = member?.memberUntil else {
            return "TBD"
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        if let date = dateFormatter.date(from: memberUntil) {
            let outputFormatter = DateFormatter()
            outputFormatter.dateFormat = "MMMM yyyy"
            return outputFormatter.string(from: date)
        }
        return memberUntil
    }
    
    var body: some View {
        ZStack {
            // Background Image
            Image("cuc-building")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .ignoresSafeArea()

            // Oxford Blue Overlay - Subtle & Translucent
            Color.oxfordBlue.opacity(0.35)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Top Section - Logo & Welcome
                VStack(spacing: 8) {
                    // CUC Logo
                    Image("cuc-logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 80, height: 80)

                    // Welcome Text
                    Text("Welcome")
                        .font(.system(size: 16, weight: .regular))
                        .foregroundColor(.cambridgeBlue)

                    // Member First Name
                    Text(member?.firstName ?? "Member")
                        .font(.system(size: 32, weight: .light))
                        .foregroundColor(.white)
                }
                .padding(.top, 50)
                .padding(.bottom, 20)

                Spacer()

                // Membership Card - Identical to Profile View
                membershipCard

                Spacer()
            }
        }
    }
    
    // MARK: - Membership Card (Identical to Profile View)
    private var membershipCard: some View {
        VStack(spacing: 0) {
            // Card Header
            HStack(alignment: .top, spacing: 12) {
                Image("cuc-monogram")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 58, height: 72)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("CITY UNIVERSITY CLUB")
                        .font(.system(size: 20, weight: .medium, design: .serif))
                        .foregroundColor(.oxfordBlue)
                    Text("42 CRUTCHED FRIARS, EC3N 2AP")
                        .font(.system(size: 11, weight: .regular))
                        .foregroundColor(.addressGray)
                }
                Spacer()
            }
            .padding(.leading, 20)
            .padding(.top, 20)
            .padding(.trailing, 20)
            
            // Member Name
            VStack(spacing: 8) {
                Text("This is to introduce")
                    .font(.system(size: 13, weight: .regular, design: .serif))
                    .foregroundColor(.secondaryText)
                    .italic()
                Text(member?.fullName ?? "[MEMBER'S NAME]")
                    .font(.system(size: 18, weight: .semibold, design: .serif))
                    .foregroundColor(.oxfordBlue)
                    .tracking(1.5)
            }
            .padding(.vertical, 30)

            // Card Footer
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Member Until")
                        .font(.system(size: 10, weight: .regular))
                        .foregroundColor(.secondaryText)
                    Text(formattedMemberUntil)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.oxfordBlue)
                }
                Spacer()
            }
            .padding(.leading, 20)
            .padding(.trailing, 20)
            .padding(.bottom, 20)
        }
        .frame(width: 400)
        .background(Color.cardWhite)
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.white,
                            Color(red: 0.88, green: 0.88, blue: 0.90)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
        )
        .shadow(color: Color(red: 0.2, green: 0.25, blue: 0.3).opacity(0.2), radius: 20, x: 0, y: 15)
        .shadow(color: Color.white.opacity(0.6), radius: 5, x: -2, y: -2)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 2, y: 2)
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
