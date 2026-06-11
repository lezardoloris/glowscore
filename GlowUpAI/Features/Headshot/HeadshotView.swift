import SwiftUI

struct HeadshotView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedBackground = "neutral_gray"
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let backgrounds: [(key: String, name: String, icon: String)] = [
        ("office", "Office", "building.2.fill"),
        ("neutral_gray", "Neutral Gray", "circle.fill"),
        ("outdoor", "Outdoor", "leaf.fill"),
        ("studio", "Studio", "camera.aperture"),
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User selfie
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 120, height: 120)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("AI Headshot")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    // Premium badge
                    HStack(spacing: GlowUpDesign.Spacing.xs) {
                        Image(systemName: "crown.fill")
                            .foregroundStyle(.yellow)
                        Text("Premium Feature")
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(.yellow)
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)
                    .padding(.vertical, GlowUpDesign.Spacing.xs)
                    .background(.yellow.opacity(0.15))
                    .clipShape(Capsule())

                    // Background picker
                    VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                        Text("Background")
                            .font(GlowUpDesign.Typography.headline)
                            .foregroundStyle(.white)

                        HStack(spacing: GlowUpDesign.Spacing.sm) {
                            ForEach(backgrounds, id: \.key) { bg in
                                Button {
                                    withAnimation(GlowUpDesign.Animation.quick) {
                                        selectedBackground = bg.key
                                    }
                                } label: {
                                    VStack(spacing: GlowUpDesign.Spacing.xs) {
                                        Image(systemName: bg.icon)
                                            .font(.title3)
                                        Text(bg.name)
                                            .font(.caption2)
                                    }
                                    .foregroundStyle(selectedBackground == bg.key ? .pink : .white.opacity(0.7))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, GlowUpDesign.Spacing.md)
                                    .background(.ultraThinMaterial)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                            .stroke(selectedBackground == bg.key ? Color.pink : .white.opacity(0.1), lineWidth: selectedBackground == bg.key ? 2 : 1)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate CTA
                    Button {
                        if !subscriptionManager.isSubscribed {
                            router.presentPaywall()
                        } else {
                            Task { await generateHeadshot() }
                        }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "briefcase.fill")
                                Text("Generate Professional Headshot")
                            }
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(GlowUpDesign.Colors.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .disabled(isProcessing)
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    if !subscriptionManager.isSubscribed {
                        Text("Subscribe to unlock AI Headshots")
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(.white.opacity(0.5))
                    }

                    Text("AI-generated artistic visualization for entertainment purposes only.")
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.35))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, GlowUpDesign.Spacing.lg)

                    Spacer(minLength: GlowUpDesign.Spacing.xxl)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: $showError) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
        .onAppear { AnalyticsService.shared.trackScreen("headshot") }
    }

    private func generateHeadshot() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let result = try await featureService.headshot(image: selectedImage, background: selectedBackground, quality: "hd")

            transformContext.transformedImage = result
            transformContext.featureType = "headshot"
            router.navigate(to: .featureResult(featureType: "headshot"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
