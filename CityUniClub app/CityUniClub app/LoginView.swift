import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    @State private var isLoggedIn = false
    @State private var isCheckingAuth = true
    
    private let apiService = APIService.shared
    
    var body: some View {
        ZStack {
            // Oxford Blue Background
            Color.oxfordBlue.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Section - Logo & Welcome
                VStack(spacing: 16) {
                    // CUC Logo
                    Image("cuc-logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 100, height: 100)
                    
                    Text("Welcome")
                        .font(.system(size: 28, weight: .light))
                        .foregroundColor(.white)
                    
                    Text("City University Club")
                        .font(.system(size: 16, weight: .medium, design: .serif))
                        .foregroundColor(.cambridgeBlue)
                }
                .padding(.top, 80)
                .padding(.bottom, 50)
                
                // Login Form
                VStack(spacing: 20) {
                    // Email Field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Membership Email")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.cambridgeBlue)
                        
                        HStack {
                            Image(systemName: "envelope.fill")
                                .foregroundColor(.secondaryText)
                                .font(.system(size: 16))
                            
                            TextField("email@example.com", text: $email)
                                .font(.system(size: 16))
                                .foregroundColor(.white)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                        }
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
                    
                    // Password Field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Password")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.cambridgeBlue)
                        
                        HStack {
                            Image(systemName: "lock.fill")
                                .foregroundColor(.secondaryText)
                                .font(.system(size: 16))
                            
                            if showPassword {
                                TextField("Password", text: $password)
                                    .font(.system(size: 16))
                                    .foregroundColor(.white)
                            } else {
                                SecureField("Password", text: $password)
                                    .font(.system(size: 16))
                                    .foregroundColor(.white)
                            }
                            
                            Button {
                                showPassword.toggle()
                            } label: {
                                Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                                    .foregroundColor(.secondaryText)
                                    .font(.system(size: 14))
                            }
                        }
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
                    
                    // Error Message
                    if showError {
                        HStack {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.red)
                            Text(errorMessage)
                                .font(.system(size: 13))
                                .foregroundColor(.red)
                        }
                        .padding(.horizontal, 4)
                        .transition(.opacity)
                    }
                    
                    // Login Button
                    Button {
                        handleLogin()
                    } label: {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            } else {
                                Image(systemName: "arrow.right.circle.fill")
                                    .font(.system(size: 16))
                                Text("Login")
                                    .font(.system(size: 16, weight: .semibold))
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
                    .disabled(isLoading || email.isEmpty || password.isEmpty)
                    .opacity(isLoading || email.isEmpty || password.isEmpty ? 0.6 : 1)
                    
                    // Forgot Password
                    Button {
                        // Handle forgot password
                    } label: {
                        Text("Forgot Password?")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.cambridgeBlue)
                            .underline()
                    }
                    .padding(.top, 8)
                    
                    // Help Text
                    Text("Contact the secretary for login assistance")
                        .font(.system(size: 11))
                        .foregroundColor(.secondaryText)
                        .padding(.top, 20)
                    
                    Text("secretary@cityuniversityclub.co.uk")
                        .font(.system(size: 11))
                        .foregroundColor(.cambridgeBlue)
                }
                .padding(.horizontal, 30)
                
                Spacer()
                
                // Footer
                Text("© 2026 City University Club")
                    .font(.system(size: 10))
                    .foregroundColor(.secondaryText)
                    .padding(.bottom, 20)
            }
        }
        // ✅ .fullScreenCover goes HERE - attached to the root ZStack
        .fullScreenCover(isPresented: $isLoggedIn) {
            MainTabView()
        }
        .onAppear {
            checkExistingAuth()
        }
    }
    
    // MARK: - Auth Check
    private func checkExistingAuth() {
        guard !isCheckingAuth else { return }
        
        if apiService.isAuthenticated {
            isLoggedIn = true
        }
    }
    
    // MARK: - Login Handler
    private func handleLogin() {
        isLoading = true
        showError = false
        
        Task {
            do {
                _ = try await apiService.login(email: email, password: password)
                await MainActor.run {
                    isLoading = false
                    isLoggedIn = true
                }
            } catch let error as APIError {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.errorDescription ?? "Login failed"
                    showError = true
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Invalid membership email or password"
                    showError = true
                }
            }
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
