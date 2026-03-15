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
                    profileSection
                    accountSettingsSection
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
                settingsRow(icon: "bell.fill", label: "Notifications", value: "Enabled")
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
        VStack(spacing: 16) {
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
                        .fill(Color.red.opacity(0.85))
                        .shadow(color: Color.red.opacity(0.4), radius: 8, x: 0, y: 4)
                )
            }

            Text(APIConfiguration.appVersion)
                .font(.system(size: 12, weight: .regular))
                .foregroundColor(Color.white.opacity(0.4))
                .frame(maxWidth: .infinity, alignment: .center)
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
        }
        .padding(.vertical, 12)
    }
}

struct MembershipProfileView_Previews: PreviewProvider {
    static var previews: some View {
        MembershipProfileView()
    }
}
