import SwiftUI

struct NewsDetailView: View {
    @Environment(\.dismiss) private var dismiss
    let item: ClubNews

    var body: some View {
        ZStack(alignment: .top) {
            Color.cardWhite.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Category + date
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
                        .font(.system(size: 22, weight: .semibold, design: .serif))
                        .foregroundColor(.oxfordBlue)
                        .lineSpacing(3)

                    Divider()

                    Text(item.content)
                        .font(.system(size: 15))
                        .foregroundColor(.darkText)
                        .lineSpacing(5)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, 20)
                .padding(.top, 80)
                .padding(.bottom, 40)
            }

            // Nav bar
            HStack {
                Button {
                    dismiss()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 15, weight: .semibold))
                        Text("Back")
                            .font(.system(size: 15, weight: .medium))
                    }
                    .foregroundColor(.oxfordBlue)
                }
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 56)
            .background(Color.cardWhite.opacity(0.95))
        }
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
    }
}
