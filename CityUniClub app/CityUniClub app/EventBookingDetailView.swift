import SwiftUI

struct EventBookingDetailView: View {
    let event: Event
    let onUpdated: () -> Void

    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss

    @State private var pendingGuestCount: Int
    @State private var pendingNotes: String
    @State private var isUpdating = false
    @State private var isSavingNotes = false
    @State private var isCancelling = false
    @State private var showCancelAlert = false
    @State private var errorMessage: String? = nil
    @State private var successMessage: String? = nil

    private let apiService = APIService.shared

    private static let maxNotesLength = 256

    init(event: Event, onUpdated: @escaping () -> Void) {
        self.event = event
        self.onUpdated = onUpdated
        self._pendingGuestCount = State(initialValue: event.myBooking?.guestCount ?? 1)
        self._pendingNotes = State(initialValue: event.myBooking?.specialRequests ?? "")
    }

    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {

                    // Summary card
                    VStack(spacing: 0) {
                        detailRow(label: "Event", value: event.title)
                        rowDivider
                        detailRow(label: "Date", value: event.displayDate)
                        rowDivider
                        HStack {
                            Text("Status")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                            Spacer()
                            statusBadge(event.myBooking?.status ?? "pending")
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    .background(Color.white.opacity(0.06))
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.1), lineWidth: 1))

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

                            if pendingGuestCount != event.myBooking?.guestCount ?? 1 {
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
                                    .onChange(of: pendingNotes) {
                                        if pendingNotes.count > Self.maxNotesLength {
                                            pendingNotes = String(pendingNotes.prefix(Self.maxNotesLength))
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
                        Text("BOOKING")
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
                                    Text("Cancel Booking")
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
        .navigationTitle("Booking")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .alert("Cancel Booking", isPresented: $showCancelAlert) {
            Button("Cancel Booking", role: .destructive) {
                Task { await cancelBooking() }
            }
            Button("Keep Booking", role: .cancel) {}
        } message: {
            Text("Cancel your booking for \(event.title)?")
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
                .multilineTextAlignment(.trailing)
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

    private func saveNotes() async {
        guard let booking = event.myBooking else { return }
        isSavingNotes = true
        errorMessage = nil
        defer { isSavingNotes = false }
        let notesValue = pendingNotes.trimmingCharacters(in: .whitespacesAndNewlines)
        do {
            try await apiService.updateEventNotes(bookingId: booking.id, specialRequests: notesValue.isEmpty ? nil : notesValue)
            await MainActor.run {
                successMessage = "Notes saved."
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { successMessage = nil }
        } catch {
            await MainActor.run { errorMessage = "Failed to save notes. Please try again." }
        }
    }

    private func requestGuestCountChange() async {
        guard let booking = event.myBooking else { return }
        isUpdating = true
        errorMessage = nil
        defer { isUpdating = false }
        do {
            try await apiService.changeEventGuestCount(bookingId: booking.id, guestCount: pendingGuestCount)
            await MainActor.run {
                successMessage = "Change requested — pending confirmation."
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { successMessage = nil }
            onUpdated()
        } catch {
            await MainActor.run { errorMessage = "Failed to update. Please try again." }
        }
    }

    private func cancelBooking() async {
        guard let booking = event.myBooking else { return }
        isCancelling = true
        errorMessage = nil
        defer { isCancelling = false }
        do {
            try await apiService.cancelEventBooking(bookingId: booking.id)
            onUpdated()
            dismiss()
        } catch {
            await MainActor.run { errorMessage = "Failed to cancel. Please try again." }
        }
    }
}
