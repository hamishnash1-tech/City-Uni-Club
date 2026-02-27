import SwiftUI

struct MembershipProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthManager
    @State private var showingLogoutAlert = false
    @State private var showingEditProfile = false

    var member: Member? {
        authManager.currentMember
    }

    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Membership Card at Top
                    membershipCard

                    // Profile Information
                    profileSection

                    // Account Settings
                    accountSettingsSection

                    // Logout Button
                    logoutButton
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 24)
                .padding(.bottom, 40)
            }
        }
        .navigationTitle("")
        .navigationBarHidden(true)
        .sheet(isPresented: $showingEditProfile) {
            if let member = member {
                EditProfileView(member: member)
                    .environmentObject(authManager)
            }
        }
        .alert("Logout", isPresented: $showingLogoutAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Logout", role: .destructive) {
                Task {
                    await authManager.logout()
                }
            }
        } message: {
            Text("Are you sure you want to logout of your account?")
        }
    }
    
    // MARK: - Membership Card
    private var membershipCard: some View {
        VStack(spacing: 0) {
            // Card Header
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

            // Member Name
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

            // Card Footer
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Member Until")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundColor(.secondaryText)
                    if let memberUntil = member?.memberUntil {
                        // Format: "March 2026"
                        let dateFormatter = DateFormatter()
                        dateFormatter.dateFormat = "yyyy-MM-dd"
                        if let date = dateFormatter.date(from: memberUntil) {
                            let outputFormatter = DateFormatter()
                            outputFormatter.dateFormat = "MMMM yyyy"
                            Text(outputFormatter.string(from: date))
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.oxfordBlue)
                        } else {
                            Text(memberUntil)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.oxfordBlue)
                        }
                    } else {
                        Text("TBD")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.oxfordBlue)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(member?.membershipType ?? "Membership")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.cambridgeBlue)
                    Text(member?.membershipNumber ?? "N/A")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundColor(.secondaryText)
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

    // MARK: - Profile Section
    private var profileSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Profile Information")
                    .font(.system(size: 18, weight: .semibold, design: .serif))
                    .foregroundColor(.oxfordBlue)

                Spacer()

                Button {
                    showingEditProfile = true
                } label: {
                    Text("Edit")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.cambridgeBlue)
                }
            }

            VStack(spacing: 0) {
                profileRow(icon: "person.fill", label: "Full Name", value: member?.fullName ?? "")
                Divider().background(Color.gray.opacity(0.2))

                profileRow(icon: "envelope.fill", label: "Email Address", value: member?.email ?? "")
                Divider().background(Color.gray.opacity(0.2))

                profileRow(icon: "phone.fill", label: "Phone Number", value: member?.phoneNumber ?? "")
                Divider().background(Color.gray.opacity(0.2))

                profileRow(icon: "calendar", label: "Member Since", value: String(member?.memberSince?.prefix(4) ?? ""))
                Divider().background(Color.gray.opacity(0.2))

                profileRow(icon: "star.fill", label: "Membership Type", value: member?.membershipType ?? "")
                Divider().background(Color.gray.opacity(0.2))

                profileRow(icon: "number", label: "Membership Number", value: member?.membershipNumber ?? "")
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.cardWhite)
            )
        }
    }
    
    // MARK: - Account Settings Section
    private var accountSettingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Account Settings")
                .font(.system(size: 18, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
            
            VStack(spacing: 0) {
                settingsRow(icon: "lock.fill", label: "Change Password", value: "••••••••")
                Divider().background(Color.gray.opacity(0.2))
                
                settingsRow(icon: "bell.fill", label: "Notifications", value: "Enabled")
                Divider().background(Color.gray.opacity(0.2))
                
                settingsRow(icon: "doc.text.fill", label: "Terms & Conditions", value: "")
                Divider().background(Color.gray.opacity(0.2))
                
                settingsRow(icon: "shield.fill", label: "Privacy Policy", value: "")
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.cardWhite)
            )
        }
    }
    
    // MARK: - Logout Button
    private var logoutButton: some View {
        Button {
            showingLogoutAlert = true
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 16))
                Text("Logout")
                    .font(.system(size: 15, weight: .semibold))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.red.opacity(0.8),
                                Color.red
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .shadow(color: Color.red.opacity(0.4), radius: 8, x: 0, y: 4)
            )
        }
        .padding(.top, 8)
    }
    
    // MARK: - Helper Views
    private func profileRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(.cambridgeBlue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 11, weight: .regular))
                    .foregroundColor(.secondaryText)
                Text(value)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.oxfordBlue)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(.secondaryText)
        }
        .padding(.vertical, 12)
    }
    
    private func settingsRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(.oxfordBlue)
                .frame(width: 24)
            
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.oxfordBlue)
            
            Spacer()
            
            if !value.isEmpty {
                Text(value)
                    .font(.system(size: 13))
                    .foregroundColor(.secondaryText)
            }
            
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(.secondaryText)
        }
        .padding(.vertical, 12)
    }
}

struct MembershipProfileView_Previews: PreviewProvider {
    static var previews: some View {
        MembershipProfileView()
    }
}
