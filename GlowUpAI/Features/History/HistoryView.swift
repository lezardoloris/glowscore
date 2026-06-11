import SwiftUI

struct HistoryView: View {
    // H4 FIX: Use singleton, not local instance
    @ObservedObject private var history = TransformationHistory.shared
    private let columns = [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)]

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            if history.transformations.isEmpty {
                emptyStateView
            } else {
                gridView
            }
        }
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.large)
        .onAppear { AnalyticsService.shared.trackScreen("history") }
    }

    // MARK: - Empty State

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 64))
                .foregroundStyle(.white.opacity(0.25))
                .padding(.bottom, 8)

            Text("No transformations yet")
                .font(.title3.bold())
                .foregroundStyle(.white.opacity(0.7))

            Text("Your glow ups will appear here")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.4))
                .multilineTextAlignment(.center)

            Button {
                // Navigate to camera tab (index 0)
                NotificationCenter.default.post(name: .init("switchToTab"), object: nil, userInfo: ["tab": 0])
            } label: {
                Text("Start Your First Glow Up")
                    .font(.callout.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 28)
                    .padding(.vertical, 14)
                    .background(
                        LinearGradient(
                            colors: [Color(red: 0.93, green: 0.27, blue: 0.60), Color(red: 0.66, green: 0.33, blue: 0.97)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(Capsule())
            }
            .padding(.top, 8)
        }
        .padding(32)
    }

    // MARK: - Grid

    private var gridView: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(history.transformations) { item in
                    VStack(spacing: 4) {
                        if let image = UIImage(contentsOfFile: item.transformedImagePath) {
                            Image(uiImage: image)
                                .resizable()
                                .scaledToFill()
                                .frame(height: 140)
                                .clipped()
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        } else {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(.gray.opacity(0.2))
                                .frame(height: 140)
                                .overlay(Image(systemName: "photo").foregroundStyle(.white.opacity(0.3)))
                        }
                        HStack {
                            Text(item.stylePresetId.replacingOccurrences(of: "_", with: " ").capitalized)
                                .font(.caption2)
                                .foregroundStyle(.white.opacity(0.7))
                            Spacer()
                            if item.isHD {
                                Text("HD")
                                    .font(.system(size: 8, weight: .bold))
                                    .foregroundStyle(.green)
                            }
                        }
                    }
                    .contextMenu {
                        Button(role: .destructive) {
                            withAnimation {
                                history.delete(item)
                            }
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }
            }
            .padding(10)
        }
    }
}
