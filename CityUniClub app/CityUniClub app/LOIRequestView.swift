//
//  LOIRequestView.swift
//  CityUniClub app
//
//  Created by Hamish Nash on 24/02/2026.
//

import SwiftUI

struct LOIRequestView: View {
    @Environment(\.dismiss) private var dismiss
    let club: ReciprocalClub
    
    @State private var arrivalDate = Date()
    @State private var departureDate = Date().addingTimeInterval(86400 * 7)
    @State private var purpose = "Business"
    @State private var specialRequests = ""
    @State private var showingConfirmation = false
    
    let purposes = ["Business", "Leisure", "Both"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.oxfordBlue.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        clubHeader
                        dateSelectionSection
                        purposeSection
                        specialRequestsSection
                        importantNotice
                        submitButton
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 24)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
    }
    
    private var clubHeader: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.cambridgeBlue.opacity(0.4),
                                Color.oxfordBlue.opacity(0.4)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 80, height: 80)
                
                Image(systemName: "globe.europe.africa.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.oxfordBlue)
            }
            
            Text(club.name)
                .font(.system(size: 22, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
                .multilineTextAlignment(.center)
            
            VStack(spacing: 4) {
                Label(club.location, systemImage: "location.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.secondaryText)
                
                Text(club.country)
                    .font(.system(size: 13))
                    .foregroundColor(.cambridgeBlue)
            }
            
            if let note = club.note {
                Text("Note: \(note)")
                    .font(.system(size: 12))
                    .foregroundColor(.cambridgeBlue)
                    .italic()
                    .padding(.top, 4)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
        )
    }
    
    private var dateSelectionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Visit Dates")
                .font(.system(size: 18, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "arrow.down.circle.fill")
                        .foregroundColor(.cambridgeBlue)
                    Text("Arrival Date")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.oxfordBlue)
                }
                
                DatePicker(
                    "",
                    selection: $arrivalDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .accentColor(.oxfordBlue)
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.05))
                )
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "arrow.up.circle.fill")
                        .foregroundColor(.cambridgeBlue)
                    Text("Departure Date")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.oxfordBlue)
                }
                
                DatePicker(
                    "",
                    selection: $departureDate,
                    in: arrivalDate...,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .accentColor(.oxfordBlue)
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.05))
                )
            }
            
            HStack {
                Image(systemName: "calendar.badge.clock")
                    .foregroundColor(.cambridgeBlue)
                Text("Duration: \(durationDays) day\(durationDays > 1 ? "s" : "")")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.oxfordBlue)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.cambridgeBlue.opacity(0.1))
            )
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
        )
    }
    
    private var purposeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Purpose of Visit")
                .font(.system(size: 16, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
            
            HStack(spacing: 12) {
                ForEach(purposes, id: \.self) { purpose in
                    Button {
                        self.purpose = purpose
                    } label: {
                        Text(purpose)
                            .font(.system(size: 14, weight: purpose == self.purpose ? .semibold : .regular))
                            .foregroundColor(purpose == self.purpose ? .white : .oxfordBlue)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(
                                Capsule()
                                    .fill(purpose == self.purpose ? Color.oxfordBlue : Color.gray.opacity(0.1))
                            )
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
        )
    }
    
    private var specialRequestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Special Requests (Optional)")
                .font(.system(size: 16, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
            
            TextEditor(text: $specialRequests)
                .font(.system(size: 14))
                .foregroundColor(.darkText)
                .frame(minHeight: 100)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.05))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
            
            Text("e.g., dietary requirements, accommodation preferences, etc.")
                .font(.system(size: 11))
                .foregroundColor(.secondaryText)
                .italic()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
        )
    }
    
    private var importantNotice: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 24))
                .foregroundColor(.cambridgeBlue)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Important Notice")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.oxfordBlue)
                
                Text("Please submit your request at least 7 days before your arrival date. The secretary will prepare your Letter of Introduction within 3-5 business days.")
                    .font(.system(size: 12))
                    .foregroundColor(.secondaryText)
                    .lineSpacing(3)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.cambridgeBlue.opacity(0.1))
        )
    }
    
    private var submitButton: some View {
        Button {
            showingConfirmation = true
        } label: {
            HStack {
                Image(systemName: "envelope.fill")
                    .font(.system(size: 16))
                Text("Request Letter of Introduction")
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
                                Color.oxfordBlue,
                                Color(red: 0.05, green: 0.2, blue: 0.35)
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .shadow(color: Color.oxfordBlue.opacity(0.4), radius: 8, x: 0, y: 4)
            )
        }
        .alert("Request Submitted", isPresented: $showingConfirmation) {
            Button("Done", role: .cancel) {
                dismiss()
            }
        } message: {
            Text("Your Letter of Introduction request for \(club.name) has been submitted. You will receive confirmation within 3-5 business days.")
        }
    }
    
    private var durationDays: Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: arrivalDate, to: departureDate)
        return (components.day ?? 1) + 1
    }
}

struct LOIRequestView_Previews: PreviewProvider {
    static var previews: some View {
        LOIRequestView(
            club: ReciprocalClub(
                name: "The Hong Kong Club",
                location: "Hong Kong",
                region: "Asia",
                country: "Hong Kong"
            )
        )
    }
}
