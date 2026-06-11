import SwiftUI

struct FeatureItem: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let description: String
    let route: Route
    let isPremium: Bool

    static let allFeatures: [FeatureItem] = [
        FeatureItem(name: "Glow Up", icon: "sparkles", description: "AI-powered transformation", route: .styleSelection(), isPremium: false),
        FeatureItem(name: "Face Swap", icon: "arrow.triangle.2.circlepath", description: "Swap into any scene", route: .faceSwap, isPremium: false),
        FeatureItem(name: "Art Style", icon: "paintpalette.fill", description: "Anime, oil painting & more", route: .instantStyle, isPremium: false),
        FeatureItem(name: "AI Headshot", icon: "briefcase.fill", description: "Professional photos", route: .headshot, isPremium: true),
        FeatureItem(name: "Hair Change", icon: "scissors", description: "Try any hairstyle", route: .hairChange, isPremium: false),
        FeatureItem(name: "Relight Photo", icon: "lightbulb.fill", description: "Change lighting mood", route: .relight, isPremium: false),
        FeatureItem(name: "Age Machine", icon: "hourglass", description: "See yourself at any age", route: .ageTransform, isPremium: false),
        FeatureItem(name: "Try On Clothes", icon: "tshirt.fill", description: "Virtual fitting room", route: .tryOn, isPremium: true),
        FeatureItem(name: "Couple Glow Up", icon: "heart.fill", description: "Transform together", route: .coupleGlowUp, isPremium: false),
        FeatureItem(name: "Beauty Filter", icon: "wand.and.stars", description: "On-device enhancement", route: .beautyFilter, isPremium: false),
        FeatureItem(name: "Virtual Makeup", icon: "mouth.fill", description: "Try on makeup looks", route: .virtualMakeup, isPremium: false),
        FeatureItem(name: "Animate Portrait", icon: "play.circle.fill", description: "Bring your photo to life", route: .animatePortrait, isPremium: false),
        FeatureItem(name: "Talking Photo", icon: "waveform.circle.fill", description: "Make your photo talk", route: .talkingPhoto, isPremium: true),
        FeatureItem(name: "Remove Background", icon: "person.crop.rectangle", description: "Instant background removal", route: .backgroundRemoval, isPremium: false),
        FeatureItem(name: "AI Caricature", icon: "face.smiling", description: "Cartoon portrait of you", route: .caricature, isPremium: false),
        FeatureItem(name: "Photo Restore", icon: "clock.arrow.circlepath", description: "Fix old or damaged photos", route: .photoRestore, isPremium: false),
        FeatureItem(name: "Pet Portrait", icon: "pawprint.fill", description: "Style your pet as a hero", route: .petPortrait, isPremium: false),
        FeatureItem(name: "Fitness Transform", icon: "figure.run", description: "Visualize your fit self", route: .fitnessTransform, isPremium: false),
        FeatureItem(name: "4K Upscale", icon: "arrow.up.forward.square", description: "Enhance to crisp 4K", route: .upscale, isPremium: false),
    ]
}

struct FeatureHubView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    private let columns = [
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.md),
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.md)
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User photo thumbnail
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Choose a Feature")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    // Feature grid
                    LazyVGrid(columns: columns, spacing: GlowUpDesign.Spacing.md) {
                        ForEach(FeatureItem.allFeatures) { feature in
                            FeatureCard(feature: feature, isSubscribed: subscriptionManager.isSubscribed) {
                                router.navigate(to: feature.route)
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Free tier hint
                    if !subscriptionManager.isSubscribed {
                        HStack(spacing: GlowUpDesign.Spacing.sm) {
                            Image(systemName: "crown.fill")
                                .foregroundStyle(.yellow)
                            Text("Unlock all features with Premium")
                                .font(GlowUpDesign.Typography.caption)
                        }
                        .foregroundStyle(.white.opacity(0.5))
                        .padding(.bottom, GlowUpDesign.Spacing.lg)
                        .onTapGesture {
                            router.presentPaywall()
                        }
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Choose a Feature")
                    .font(GlowUpDesign.Typography.headline)
                    .foregroundStyle(.white)
            }
        }
        .onAppear { AnalyticsService.shared.trackScreen("feature_hub") }
    }
}

struct FeatureCard: View {
    let feature: FeatureItem
    let isSubscribed: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: GlowUpDesign.Spacing.sm) {
                ZStack {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 56, height: 56)

                    Image(systemName: feature.icon)
                        .font(.title2)
                        .foregroundStyle(GlowUpDesign.Colors.gradient)

                    // Premium crown badge
                    if feature.isPremium && !isSubscribed {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(.yellow)
                            .padding(4)
                            .background(.black.opacity(0.7))
                            .clipShape(Circle())
                            .offset(x: 20, y: -20)
                    }
                }

                Text(feature.name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white)

                Text(feature.description)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
            .overlay(
                RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                    .stroke(.white.opacity(0.1), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}
