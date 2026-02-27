//
//  EditProfileView.swift
//  CityUniClub app
//
//  Edit member profile information
//

import SwiftUI

struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthManager
    
    @State private var fullName: String
    @State private var firstName: String
    @State private var email: String
    @State private var phoneNumber: String
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showSuccess = false
    
    private let apiService = APIService.shared
    
    init(member: Member) {
        _fullName = State(initialValue: member.fullName)
        _firstName = State(initialValue: member.firstName)
        _email = State(initialValue: member.email)
        _phoneNumber = State(initialValue: member.phoneNumber ?? "")
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.oxfordBlue.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Profile Information Section
                        profileSection
                        
                        // Save Button
                        saveButton
                        
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .cambridgeBlue))
                                .scaleEffect(1.5)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 24)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.cambridgeBlue)
                }
            }
            .alert("Success", isPresented: $showSuccess) {
                Button("Done", role: .cancel) {
                    dismiss()
                }
            } message: {
                Text("Your profile has been updated successfully.")
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    // MARK: - Profile Section
    private var profileSection: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Full Name")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.cambridgeBlue)
                
                TextField("Full Name", text: $fullName)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                            )
                    )
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("First Name")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.cambridgeBlue)
                
                TextField("First Name", text: $firstName)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                            )
                    )
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Email Address")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.cambridgeBlue)
                
                TextField("Email", text: $email)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                            )
                    )
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Phone Number")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.cambridgeBlue)
                
                TextField("Phone Number", text: $phoneNumber)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .keyboardType(.phonePad)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                            )
                    )
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
        )
    }
    
    // MARK: - Save Button
    private var saveButton: some View {
        Button {
            Task {
                await saveProfile()
            }
        } label: {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 16))
                Text("Save Changes")
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
                                Color.cambridgeBlue,
                                Color.cambridgeBlue.opacity(0.8)
                            ]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .shadow(color: Color.cambridgeBlue.opacity(0.4), radius: 8, x: 0, y: 4)
            )
        }
        .disabled(isLoading)
        .opacity(isLoading ? 0.6 : 1)
    }
    
    // MARK: - Save Profile
    @MainActor
    private func saveProfile() async {
        isLoading = true
        showError = false
        
        do {
            let (updatedMember, _) = try await apiService.updateMemberProfile(
                fullName: fullName,
                firstName: firstName,
                phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber
            )
            
            // Update email separately (not in profile endpoint)
            // For now, we'll update local state
            UserDefaults.standard.set(updatedMember.email, forKey: "memberEmail")
            
            // Update auth manager's current member
            authManager.currentMember = updatedMember
            
            // Save updated member data
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            if let memberData = try? encoder.encode(updatedMember) {
                UserDefaults.standard.set(memberData, forKey: "currentMember")
            }
            
            isLoading = false
            showSuccess = true
        } catch let error as APIError {
            isLoading = false
            errorMessage = error.errorDescription ?? "Failed to save profile"
            showError = true
        } catch {
            isLoading = false
            errorMessage = "Failed to save profile. Please try again."
            showError = true
        }
    }
}

struct EditProfileView_Previews: PreviewProvider {
    static var previews: some View {
        EditProfileView(member: Member(
            id: "1",
            email: "test@example.com",
            fullName: "Test User",
            firstName: "Test",
            phoneNumber: "+44 7700 900123",
            membershipNumber: "CUC-2024-0001",
            membershipType: "Full Membership",
            memberSince: "2024-01-01",
            memberUntil: "2025-01-01",
            isActive: true
        ))
    }
}
