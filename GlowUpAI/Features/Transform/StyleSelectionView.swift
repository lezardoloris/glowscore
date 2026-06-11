import SwiftUI

struct StyleSelectionView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    private let styles = StylePreset.defaults
    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Selected photo preview
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 120, height: 120)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, 16)

                    Text("Choose Your Glow Up")
                        .font(.title2.bold())
                        .foregroundStyle(.white)

                    // Style grid
                    LazyVGrid(columns: columns, spacing: 16) {
                        ForEach(styles) { style in
                            StyleCard(style: style) {
                                transformContext.selectedStyle = style
                                router.navigate(to: .processing(styleId: style.id))
                            }
                        }
                    }
                    .padding(.horizontal, 16)

                    // Free tier usage hint
                    if !subscriptionManager.isSubscribed {
                        HStack(spacing: 8) {
                            Image(systemName: "sparkles")
                            Text("\(UsageMeter.shared.remainingPreviews) free transforms left today. Go Premium for HD!")
                                .font(.caption)
                        }
                        .foregroundStyle(.white.opacity(0.5))
                        .padding(.bottom, 24)
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { AnalyticsService.shared.trackScreen("style_selection") }
    }
}

struct StyleCard: View {
    let style: StylePreset
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 56, height: 56)

                    Image(systemName: style.icon)
                        .font(.title2)
                        .foregroundStyle(
                            LinearGradient(colors: [.pink, .purple], startPoint: .topLeading, endPoint: .bottomTrailing)
                        )

                    if style.isNew {
                        Text("NEW")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.pink)
                            .clipShape(Capsule())
                            .offset(x: 18, y: -18)
                    }
                }

                Text(style.name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white)

                Text(style.presetDescription)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(.white.opacity(0.1), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}
