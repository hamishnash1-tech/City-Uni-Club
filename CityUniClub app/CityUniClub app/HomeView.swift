import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var newsItems: [ClubNews] = []
    @State private var isLoadingNews = true
    @State private var showMembershipCard = false

    var member: Member? { authManager.currentMember }

    private let apiService = APIService.shared

    var body: some View {
        NavigationStack {
            ScrollView {
                    VStack(spacing: 0) {
                        // Header
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
                        .padding(.bottom, 28)

                        // Membership Card Button
                        Button {
                            showMembershipCard = true
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: "creditcard.fill")
                                    .font(.system(size: 15))
                                Text("View Membership Card")
                                    .font(.system(size: 15, weight: .semibold))
                            }
                            .foregroundColor(.oxfordBlue)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.cardWhite.opacity(0.92))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .strokeBorder(Color.white.opacity(0.4), lineWidth: 1)
                            )
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 20)

                        // News Section card
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Club News")
                                .font(.system(size: 17, weight: .semibold, design: .serif))
                                .foregroundColor(.oxfordBlue)
                                .padding(.horizontal, 16)
                                .padding(.top, 16)
                                .padding(.bottom, 12)

                            Divider()

                            if isLoadingNews {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .cambridgeBlue))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 24)
                            } else if newsItems.isEmpty {
                                Text("No news available")
                                    .foregroundColor(.secondaryText)
                                    .font(.system(size: 14))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 24)
                            } else {
                                VStack(spacing: 0) {
                                    ForEach(Array(newsItems.enumerated()), id: \.element.id) { index, item in
                                        NavigationLink(destination: NewsDetailView(item: item)) {
                                            newsRow(item: item)
                                        }
                                        .buttonStyle(.plain)
                                        if index < newsItems.count - 1 {
                                            Divider()
                                                .padding(.leading, 16)
                                        }
                                    }
                                }
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .background(Color.cardWhite)
                        .cornerRadius(16)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 100)
                    }
                    .frame(maxWidth: .infinity)
            }
            .background(
                ZStack {
                    Image("cuc-building")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                    Color.oxfordBlue.opacity(0.35)
                }
                .ignoresSafeArea()
            )
            .fullScreenCover(isPresented: $showMembershipCard) {
                MembershipCardView()
                    .environmentObject(authManager)
            }
            .onAppear { loadNews() }
        }
    }

    private func loadNews() {
        Task {
            do {
                let items = try await apiService.getNews()
                await MainActor.run {
                    self.newsItems = items
                    self.isLoadingNews = false
                }
            } catch {
                await MainActor.run { self.isLoadingNews = false }
            }
        }
    }

    private func newsRow(item: ClubNews) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(item.category)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.cambridgeBlue))
                Spacer()
                Text(item.formattedDate)
                    .font(.system(size: 11))
                    .foregroundColor(.secondaryText)
            }
            Text(item.title)
                .font(.system(size: 15, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
                .fixedSize(horizontal: false, vertical: true)
            Text(item.content)
                .font(.system(size: 13))
                .foregroundColor(.darkText)
                .lineSpacing(2)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
