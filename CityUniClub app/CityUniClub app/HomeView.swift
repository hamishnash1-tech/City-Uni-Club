import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager

    var member: Member? { authManager.currentMember }

    var formattedMemberUntil: String {
        let nextYear = Calendar.current.component(.year, from: Date()) + 1
        return "March \(nextYear)"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Image("cuc-building")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .ignoresSafeArea()

                Color.oxfordBlue.opacity(0.35)
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Logo & Welcome
                    VStack(spacing: 8) {
                        Image("cuc-logo")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 80, height: 80)

                        Text("Welcome")
                            .font(.system(size: 16, weight: .regular))
                            .foregroundColor(.cambridgeBlue)

                        Text(member?.firstName ?? "Member")
                            .font(.system(size: 32, weight: .light))
                            .foregroundColor(.white)
                    }
                    .padding(.top, 50)
                    .padding(.bottom, 20)

                    Spacer()

                    membershipCard
                        .padding(.horizontal, 20)

                    Spacer()
                }
            }
        }
    }

    // MARK: - Membership Card
    private var membershipCard: some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                Image("cuc-monogram")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 50, height: 65)

                VStack(alignment: .leading, spacing: 4) {
                    Text("CITY UNIVERSITY CLUB")
                        .font(.system(size: 16, weight: .medium, design: .serif))
                        .foregroundColor(.oxfordBlue)
                    Text("42 CRUTCHED FRIARS, EC3N 2AP")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundColor(.addressGray)
                }
                Spacer()
            }
            .padding(.leading, 16)
            .padding(.top, 16)
            .padding(.trailing, 16)

            VStack(spacing: 6) {
                Text("This is to introduce")
                    .font(.system(size: 11, weight: .regular, design: .serif))
                    .foregroundColor(.secondaryText)
                    .italic()
                Text(member?.fullName ?? "Member Name")
                    .font(.system(size: 15, weight: .semibold, design: .serif))
                    .foregroundColor(.oxfordBlue)
                    .tracking(1)
                    .multilineTextAlignment(.center)
            }
            .padding(.vertical, 20)

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Member Until")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundColor(.secondaryText)
                    Text(formattedMemberUntil)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.oxfordBlue)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Secretary")
                        .font(.system(size: 8, weight: .regular))
                        .foregroundColor(.secondaryText)
                    Text("H. Senanayake")
                        .font(.system(size: 10, weight: .regular, design: .serif))
                        .foregroundColor(.oxfordBlue)
                        .italic()
                }
            }
            .padding(.leading, 16)
            .padding(.trailing, 16)
            .padding(.bottom, 16)
        }
        .frame(maxWidth: 380)
        .background(Color.cardWhite)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(
                    LinearGradient(
                        gradient: Gradient(colors: [Color.white, Color(red: 0.88, green: 0.88, blue: 0.90)]),
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
