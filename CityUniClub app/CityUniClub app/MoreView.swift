import SwiftUI

struct MoreView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showReciprocalClubs = false
    @State private var showClubNews = false
    @State private var showMembershipProfile = false
    
    var member: Member? {
        authManager.currentMember
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.oxfordBlue.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // CONTACT SECTION
                        contactSection
                        
                        // MEMBERSHIP PROFILE - Button to Page
                        Button {
                            showMembershipProfile = true
                        } label: {
                            membershipProfileButton
                        }
                        .buttonStyle(PlainButtonStyle())
                        .navigationDestination(isPresented: $showMembershipProfile) {
                            MembershipProfileView()
                        }
                        
                        // RECIPROCAL CLUBS - Button to Page
                        VStack(alignment: .leading, spacing: 8) {
                            Text("RECIPROCAL CLUBS")
                                .font(.system(size: 16, weight: .semibold, design: .serif))
                                .foregroundColor(.oxfordBlue)
                            
                            Button {
                                showReciprocalClubs = true
                            } label: {
                                reciprocalClubsButton
                            }
                            .buttonStyle(PlainButtonStyle())
                            .navigationDestination(isPresented: $showReciprocalClubs) {
                                ReciprocalClubsView()
                            }
                        }

                        // CLUB NEWS - Button to Page
                        VStack(alignment: .leading, spacing: 8) {
                            Text("NEWS")
                                .font(.system(size: 16, weight: .semibold, design: .serif))
                                .foregroundColor(.oxfordBlue)
                            
                            Button {
                                showClubNews = true
                            } label: {
                                clubNewsButton
                            }
                            .buttonStyle(PlainButtonStyle())
                            .navigationDestination(isPresented: $showClubNews) {
                                ClubNewsView()
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 50)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
    }
    
    // MARK: - Contact Section
    private var contactSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("CONTACT")
                .font(.system(size: 20, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
            
            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .top, spacing: 16) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.oxfordBlue)
                        .frame(width: 24)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("42 Crutched Friars")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.oxfordBlue)
                        Text("London EC3N 2AP")
                            .font(.system(size: 14))
                            .foregroundColor(.darkText)
                    }
                }
                
                HStack(alignment: .top, spacing: 16) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.oxfordBlue)
                        .frame(width: 24)
                    
                    Text("Tuesday-Friday, 9am-5pm")
                        .font(.system(size: 14))
                        .foregroundColor(.darkText)
                }
                
                HStack(alignment: .top, spacing: 16) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.oxfordBlue)
                        .frame(width: 24)
                    
                    Text("020 7488 1770")
                        .font(.system(size: 14))
                        .foregroundColor(.darkText)
                }
                
                HStack(alignment: .top, spacing: 16) {
                    Image(systemName: "envelope.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.oxfordBlue)
                        .frame(width: 24)
                    
                    Text("secretary@cityuniversityclub.co.uk")
                        .font(.system(size: 14))
                        .foregroundColor(.darkText)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.cardWhite)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                    )
            )
        }
    }
    
    // MARK: - Membership Profile Button
    private var membershipProfileButton: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("MEMBERSHIP PROFILE")
                .font(.system(size: 20, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)

            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.cambridgeBlue)

                        Text(member?.fullName ?? "[MEMBER'S NAME]")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.oxfordBlue)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cambridgeBlue)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.05))
            )
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Reciprocal Clubs Button
    private var reciprocalClubsButton: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("We enjoy reciprocity with over 450 clubs worldwide")
                .font(.system(size: 14))
                .foregroundColor(.secondaryText)

            HStack {
                Text("Request Letter of Introduction")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.oxfordBlue)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cambridgeBlue)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.05))
            )
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Club News Button
    private var clubNewsButton: some View {
        VStack(spacing: 12) {
            newsItemPreview(title: "Dining Room open 23 February for Dinner", date: "February 2026")
            newsItemPreview(title: "Free Gin Friday - every Friday at lunch", date: "Weekly")
            newsItemPreview(title: "Sri Lankan Lunch - 25 February", date: "February 2026")
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    private func newsItemPreview(title: String, date: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.oxfordBlue)
                    .lineLimit(2)
                
                Text(date)
                    .font(.system(size: 12))
                    .foregroundColor(.secondaryText)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(.cambridgeBlue)
        }
        .padding(.vertical, 4)
    }
}

struct MoreView_Previews: PreviewProvider {
    static var previews: some View {
        MoreView()
    }
}
