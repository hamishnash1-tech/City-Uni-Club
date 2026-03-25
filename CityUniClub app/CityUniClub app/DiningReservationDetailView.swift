import SwiftUI

struct DiningReservationDetailView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss

    @Binding var item: DiningBookingItem

    @State private var pendingGuestCount: Int = 0
    @State private var pendingNotes: String = ""
    @State private var isUpdating = false
    @State private var isSavingNotes = false
    @State private var isCancelling = false
    @State private var showCancelAlert = false
    @State private var errorMessage: String? = nil
    @State private var successMessage: String? = nil

    private var isEditable: Bool {
        item.status != "cancelled" && reservationDate >= yesterdayStart
    }

    private var reservationDate: Date {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.date(from: item.reservationDate) ?? .distantPast
    }

    private var yesterdayStart: Date {
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        return Calendar.current.startOfDay(for: yesterday)
    }

    private var cancellationWarning: String? {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd HH:mm"
        guard let dt = f.date(from: "\(item.reservationDate) \(String(item.reservationTime.prefix(5)))") else { return nil }
        let hoursUntil = dt.timeIntervalSince(Date()) / 3600
        let threshold: Double = pendingGuestCount >= 5 ? 48 : 24
        guard hoursUntil < threshold && hoursUntil > 0 else { return nil }
        return "Less than \(Int(threshold)) hours notice — cancellation may not be possible and you may still be charged."
    }

    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {

                    // Summary card
                    VStack(spacing: 0) {
                        detailRow(label: "Meal", value: item.mealType)
                        rowDivider
                        detailRow(label: "Date", value: formatDate(item.reservationDate))
                        rowDivider
                        detailRow(label: "Time", value: formatTime(item.reservationTime))
                        rowDivider
                        HStack {
                            Text("Status")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                            Spacer()
                            statusBadge(item.status)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    .background(Color.white.opacity(0.06))
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.1), lineWidth: 1))

                    if isEditable {
                        // Guest count section
                        VStack(alignment: .leading, spacing: 10) {
                            Text("NUMBER OF GUESTS")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))
                                .kerning(1)

                            VStack(spacing: 14) {
                                HStack(spacing: 0) {
                                    Button {
                                        if pendingGuestCount > 1 { pendingGuestCount -= 1 }
                                    } label: {
                                        Image(systemName: "minus.circle.fill")
                                            .font(.system(size: 30))
                                            .foregroundColor(pendingGuestCount > 1 ? .cambridgeBlue : .white.opacity(0.2))
                                    }
                                    .disabled(pendingGuestCount <= 1)

                                    Text("\(pendingGuestCount)")
                                        .font(.system(size: 30, weight: .semibold, design: .serif))
                                        .foregroundColor(.white)
                                        .frame(width: 64, alignment: .center)

                                    Button {
                                        if pendingGuestCount < 20 { pendingGuestCount += 1 }
                                    } label: {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.system(size: 30))
                                            .foregroundColor(pendingGuestCount < 20 ? .cambridgeBlue : .white.opacity(0.2))
                                    }
                                    .disabled(pendingGuestCount >= 20)

                                    Spacer()
                                }

                                if pendingGuestCount != item.guestCount {
                                    Button {
                                        Task { await requestGuestCountChange() }
                                    } label: {
                                        HStack {
                                            Spacer()
                                            if isUpdating {
                                                ProgressView().tint(.oxfordBlue).scaleEffect(0.85)
                                            } else {
                                                Text("Request Change")
                                                    .font(.system(size: 14, weight: .semibold))
                                                    .foregroundColor(.oxfordBlue)
                                            }
                                            Spacer()
                                        }
                                        .padding(.vertical, 12)
                                        .background(Color.cambridgeBlue)
                                        .cornerRadius(10)
                                    }
                                    .disabled(isUpdating)
                                }
                            }
                            .padding(16)
                            .background(Color.white.opacity(0.06))
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.1), lineWidth: 1))
                        }

                        // Notes section
                        VStack(alignment: .leading, spacing: 10) {
                            Text("NOTES")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))
                                .kerning(1)

                            VStack(spacing: 10) {
                                ZStack(alignment: .topLeading) {
                                    if pendingNotes.isEmpty {
                                        Text("Dietary requirements, seating preferences, etc.")
                                            .font(.system(size: 14))
                                            .foregroundColor(.white.opacity(0.3))
                                            .padding(.top, 8)
                                            .padding(.leading, 4)
                                    }
                                    TextEditor(text: $pendingNotes)
                                        .font(.system(size: 14))
                                        .foregroundColor(.white)
                                        .scrollContentBackground(.hidden)
                                        .frame(minHeight: 80)
                                        .onChange(of: pendingNotes) { newValue in
                                            if newValue.count > DiningBookingItem.maxNotesLength {
                                                pendingNotes = String(newValue.prefix(DiningBookingItem.maxNotesLength))
                                            }
                                        }
                                }

                                Button {
                                    Task { await saveNotes() }
                                } label: {
                                    HStack {
                                        Spacer()
                                        if isSavingNotes {
                                            ProgressView().tint(.oxfordBlue).scaleEffect(0.85)
                                        } else {
                                            Text("Save Notes")
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(.oxfordBlue)
                                        }
                                        Spacer()
                                    }
                                    .padding(.vertical, 12)
                                    .background(Color.cambridgeBlue)
                                    .cornerRadius(10)
                                }
                                .disabled(isSavingNotes)
                            }
                            .padding(16)
                            .background(Color.white.opacity(0.06))
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.1), lineWidth: 1))
                        }

                        // Cancel section
                        VStack(alignment: .leading, spacing: 10) {
                            Text("RESERVATION")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white.opacity(0.5))
                                .kerning(1)

                            Button {
                                showCancelAlert = true
                            } label: {
                                HStack {
                                    Spacer()
                                    if isCancelling {
                                        ProgressView().tint(.red)
                                    } else {
                                        Text("Cancel Reservation")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.red.opacity(0.85))
                                    }
                                    Spacer()
                                }
                                .padding(.vertical, 14)
                                .background(Color.red.opacity(0.08))
                                .cornerRadius(14)
                                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.red.opacity(0.2), lineWidth: 1))
                            }
                            .disabled(isCancelling)
                        }
                    }

                    if let err = errorMessage {
                        Text(err)
                            .font(.system(size: 13))
                            .foregroundColor(.red.opacity(0.85))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 4)
                    }
                    if let msg = successMessage {
                        Text(msg)
                            .font(.system(size: 13))
                            .foregroundColor(.cambridgeBlue)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 40)
            }
        }
        .navigationTitle("Reservation")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .onAppear {
            pendingGuestCount = item.guestCount
            pendingNotes = item.specialRequests ?? ""
        }
        .alert("Cancel Reservation", isPresented: $showCancelAlert) {
            Button("Cancel Reservation", role: .destructive) {
                Task { await cancelReservation() }
            }
            Button("Keep Reservation", role: .cancel) {}
        } message: {
            if let warning = cancellationWarning {
                Text("Cancel your \(item.mealType) on \(formatDate(item.reservationDate))?\n\n⚠️ \(warning)")
            } else {
                Text("Cancel your \(item.mealType) on \(formatDate(item.reservationDate))?")
            }
        }
    }

    private var rowDivider: some View {
        Divider().background(Color.white.opacity(0.08)).padding(.leading, 16)
    }

    private func detailRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.6))
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func statusBadge(_ status: String) -> some View {
        let (bg, fg): (Color, Color) = {
            switch status {
            case "confirmed": return (Color.cambridgeBlue.opacity(0.25), Color.cambridgeBlue)
            case "cancelled": return (Color.red.opacity(0.2), Color.red.opacity(0.9))
            case "pending":   return (Color.orange.opacity(0.2), Color.orange)
            default:          return (Color.white.opacity(0.1), Color.white.opacity(0.6))
            }
        }()
        return Text(status.capitalized)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(fg)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(bg)
            .cornerRadius(6)
    }

    private func formatDate(_ dateStr: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: dateStr) else { return dateStr }
        f.dateFormat = "EEEE d MMMM yyyy"
        return f.string(from: date)
    }

    private func formatTime(_ timeStr: String) -> String {
        let parts = timeStr.prefix(5).split(separator: ":")
        guard parts.count == 2, let h = Int(parts[0]), let m = Int(parts[1]) else { return timeStr }
        let ampm = h < 12 ? "AM" : "PM"
        let hour = h % 12 == 0 ? 12 : h % 12
        return String(format: "%d:%02d %@", hour, m, ampm)
    }

    private func saveNotes() async {
        guard let token = authManager.getAuthToken(),
              let url = URL(string: "\(APIConfiguration.baseURL)/dining") else { return }
        isSavingNotes = true
        errorMessage = nil
        defer { isSavingNotes = false }
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "x-session-token")
        let notesValue = pendingNotes.trimmingCharacters(in: .whitespacesAndNewlines)
        var body: [String: Any] = ["reservation_id": item.id]
        body["special_requests"] = notesValue.isEmpty ? NSNull() : notesValue
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { return }
            if (200...299).contains(http.statusCode) {
                await MainActor.run {
                    item.specialRequests = notesValue.isEmpty ? nil : notesValue
                    successMessage = "Notes saved."
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) { successMessage = nil }
            } else {
                let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                    .flatMap { $0["error"] as? String } ?? "Failed to save notes."
                await MainActor.run { errorMessage = msg }
            }
        } catch {
            await MainActor.run { errorMessage = "Network error. Please try again." }
        }
    }

    private func requestGuestCountChange() async {
        guard let token = authManager.getAuthToken(),
              let url = URL(string: "\(APIConfiguration.baseURL)/dining") else { return }
        isUpdating = true
        errorMessage = nil
        defer { isUpdating = false }
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "x-session-token")
        request.httpBody = try? JSONSerialization.data(withJSONObject: [
            "reservation_id": item.id, "guest_count": pendingGuestCount
        ])
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { return }
            if (200...299).contains(http.statusCode) {
                await MainActor.run {
                    item.guestCount = pendingGuestCount
                    item.status = "pending"
                    successMessage = "Change requested — pending confirmation."
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) { successMessage = nil }
            } else {
                let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                    .flatMap { $0["error"] as? String } ?? "Failed to update."
                await MainActor.run { errorMessage = msg }
            }
        } catch {
            await MainActor.run { errorMessage = "Network error. Please try again." }
        }
    }

    private func cancelReservation() async {
        guard let token = authManager.getAuthToken(),
              let url = URL(string: "\(APIConfiguration.baseURL)/dining") else { return }
        isCancelling = true
        errorMessage = nil
        defer { isCancelling = false }
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "x-session-token")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["reservation_id": item.id])
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { return }
            if (200...299).contains(http.statusCode) {
                await MainActor.run { item.status = "cancelled" }
                dismiss()
            } else {
                let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                    .flatMap { $0["error"] as? String } ?? "Failed to cancel."
                await MainActor.run { errorMessage = msg }
            }
        } catch {
            await MainActor.run { errorMessage = "Network error. Please try again." }
        }
    }
}
