import SwiftUI

struct ClubNewsView: View {
    @Environment(\.dismiss) private var dismiss
    
    let newsItems = [
        NewsItem(title: "Dining Room open 23 February for Dinner", date: "February 2026", category: "Dining", content: "We are pleased to announce that the dining room will be open for dinner service starting 23 February."),
        NewsItem(title: "Free Gin Friday - every Friday at lunch", date: "Weekly", category: "Special Offer", content: "Join us every Friday for our complimentary Gin Friday promotion."),
        NewsItem(title: "Sri Lankan Lunch - 25 February", date: "February 2026", category: "Special Event", content: "Experience the flavors of Sri Lanka with our special lunch menu on 25 February."),
        NewsItem(title: "Wine Tasting Evening - 8 March", date: "March 2026", category: "Event", content: "Join our sommelier for an exclusive wine tasting featuring wines from the Loire Valley."),
        NewsItem(title: "Easter Sunday Roast", date: "April 2026", category: "Dining", content: "Book now for our special Easter Sunday Roast.")
    ]
    
    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header with Back Button
                HStack {
                    Button {
                        dismiss()
                    } label: {
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
                
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(newsItems) { item in
                            newsCard(item: item)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 20)
                    .padding(.bottom, 40)
                }
            }
        }
    }
    
    private func newsCard(item: NewsItem) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(item.category)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(Color.cambridgeBlue)
                    )
                
                Spacer()
                
                Text(item.date)
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
            
            Button {
                // Read more action
            } label: {
                HStack {
                    Text("Read More")
                        .font(.system(size: 13, weight: .semibold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 12))
                }
                .foregroundColor(.oxfordBlue)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.cardWhite)
                .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 5)
        )
    }
}

struct NewsItem: Identifiable {
    let id = UUID()
    let title: String
    let date: String
    let category: String
    let content: String
}

struct ClubNewsView_Previews: PreviewProvider {
    static var previews: some View {
        ClubNewsView()
    }
}
