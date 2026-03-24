import SwiftUI

struct ClubNewsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var newsItems: [ClubNews] = []
    @State private var isLoading = true
    @State private var showError = false

    private let apiService = APIService.shared

    var body: some View {
        NavigationStack {
            ZStack {
                Color.oxfordBlue.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button { dismiss() } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.oxfordBlue)
                        }
                        Spacer()
                        Text("Club News")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.oxfordBlue)
                        Spacer()
                        Image(systemName: "chevron.left")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.clear)
                    }
                    .padding()
                    .background(Color.cardWhite)

                    if isLoading {
                        Spacer()
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                        Spacer()
                    } else if showError {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 48))
                                .foregroundColor(.white.opacity(0.7))
                            Text("Failed to load news")
                                .foregroundColor(.white)
                            Button("Retry") { loadNews() }
                                .padding()
                                .background(Color.cambridgeBlue)
                                .cornerRadius(10)
                                .foregroundColor(.white)
                        }
                        Spacer()
                    } else if newsItems.isEmpty {
                        Spacer()
                        Text("No news available")
                            .foregroundColor(.white.opacity(0.7))
                        Spacer()
                    } else {
                        ScrollView {
                            VStack(spacing: 16) {
                                ForEach(newsItems) { item in
                                    NavigationLink(destination: NewsDetailView(item: item)) {
                                        newsCard(item: item)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal)
                            .padding(.vertical, 20)
                            .padding(.bottom, 40)
                        }
                    }
                }
            }
        }
        .onAppear { loadNews() }
    }

    private func loadNews() {
        isLoading = true
        showError = false
        Task {
            do {
                let items = try await apiService.getNews()
                await MainActor.run {
                    self.newsItems = items
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.showError = true
                    self.isLoading = false
                }
            }
        }
    }

    private func newsCard(item: ClubNews) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(item.category)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(Color.cambridgeBlue))
                Spacer()
                Text(item.formattedDate)
                    .font(.system(size: 12))
                    .foregroundColor(.secondaryText)
            }

            Text(item.title)
                .font(.system(size: 17, weight: .semibold, design: .serif))
                .foregroundColor(.oxfordBlue)
                .lineSpacing(2)

            Text(item.content)
                .font(.system(size: 14))
                .foregroundColor(.darkText)
                .lineSpacing(3)
                .lineLimit(3)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
                .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 5)
        )
    }
}

struct ClubNewsView_Previews: PreviewProvider {
    static var previews: some View {
        ClubNewsView()
    }
}
