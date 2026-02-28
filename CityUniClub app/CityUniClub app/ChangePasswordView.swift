//
//  ChangePasswordView.swift
//  CityUniClub app
//
//  Change password functionality
//

import SwiftUI

struct ChangePasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthManager
    
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var showCurrentPassword = false
    @State private var showNewPassword = false
    @State private var showConfirmPassword = false
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showSuccess = false
    
    private let apiService = APIService.shared
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.oxfordBlue.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Instructions
                        instructionsCard
                        
                        // Password Fields
                        passwordFieldsSection
                        
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
            .navigationTitle("Change Password")
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
                Text("Your password has been changed successfully.")
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    // MARK: - Instructions Card
    private var instructionsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "lock.shield")
                    .font(.system(size: 20))
                    .foregroundColor(.cambridgeBlue)
                
                Text("Password Requirements")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.oxfordBlue)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                requirementRow(icon: "checkmark.circle", text: "At least 6 characters")
                requirementRow(icon: "checkmark.circle", text: "Different from current password")
            }
            .font(.system(size: 13))
            .foregroundColor(.secondaryText)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
        )
    }
    
    private func requirementRow(icon: String, text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(.cambridgeBlue)
            Text(text)
        }
    }
    
    // MARK: - Password Fields Section
    private var passwordFieldsSection: some View {
        VStack(spacing: 16) {
            // Current Password
            VStack(alignment: .leading, spacing: 8) {
                Text("Current Password")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.oxfordBlue)
                
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.secondaryText)
                        .font(.system(size: 16))
                    
                    if showCurrentPassword {
                        TextField("Enter current password", text: $currentPassword)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    } else {
                        SecureField("Enter current password", text: $currentPassword)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    }
                    
                    Spacer()
                    
                    Button {
                        showCurrentPassword.toggle()
                    } label: {
                        Image(systemName: showCurrentPassword ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.secondaryText)
                            .font(.system(size: 14))
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                        )
                )
                .accentColor(.oxfordBlue)
            }
            
            // New Password
            VStack(alignment: .leading, spacing: 8) {
                Text("New Password")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.oxfordBlue)
                
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.secondaryText)
                        .font(.system(size: 16))
                    
                    if showNewPassword {
                        TextField("Enter new password", text: $newPassword)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    } else {
                        SecureField("Enter new password", text: $newPassword)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    }
                    
                    Spacer()
                    
                    Button {
                        showNewPassword.toggle()
                    } label: {
                        Image(systemName: showNewPassword ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.secondaryText)
                            .font(.system(size: 14))
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                        )
                )
                .accentColor(.oxfordBlue)
            }
            
            // Confirm Password
            VStack(alignment: .leading, spacing: 8) {
                Text("Confirm New Password")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.oxfordBlue)
                
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.secondaryText)
                        .font(.system(size: 16))
                    
                    if showConfirmPassword {
                        TextField("Confirm new password", text: $confirmPassword)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    } else {
                        SecureField("Confirm new password", text: $confirmPassword)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    }
                    
                    Spacer()
                    
                    Button {
                        showConfirmPassword.toggle()
                    } label: {
                        Image(systemName: showConfirmPassword ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.secondaryText)
                            .font(.system(size: 14))
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.cambridgeBlue.opacity(0.3), lineWidth: 1)
                        )
                )
                .accentColor(.oxfordBlue)
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
                await changePassword()
            }
        } label: {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                    Text("Change Password")
                        .font(.system(size: 15, weight: .semibold))
                }
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
        .disabled(isLoading || !isFormValid)
        .opacity(isLoading || !isFormValid ? 0.6 : 1)
    }
    
    // MARK: - Validation
    private var isFormValid: Bool {
        !currentPassword.isEmpty &&
        !newPassword.isEmpty &&
        newPassword.count >= 6 &&
        newPassword == confirmPassword
    }
    
    // MARK: - Change Password
    @MainActor
    private func changePassword() async {
        // Validate
        if newPassword != confirmPassword {
            errorMessage = "New passwords do not match"
            showError = true
            return
        }
        
        if newPassword.count < 6 {
            errorMessage = "Password must be at least 6 characters"
            showError = true
            return
        }
        
        isLoading = true
        showError = false
        
        do {
            try await apiService.changePassword(
                currentPassword: currentPassword,
                newPassword: newPassword
            )
            
            isLoading = false
            showSuccess = true
        } catch let error as APIError {
            isLoading = false
            errorMessage = error.errorDescription ?? "Failed to change password"
            showError = true
        } catch {
            isLoading = false
            errorMessage = "Failed to change password. Please check your current password."
            showError = true
        }
    }
}

struct ChangePasswordView_Previews: PreviewProvider {
    static var previews: some View {
        ChangePasswordView()
    }
}
