import SwiftUI

struct ArtStyleOption: Identifiable {
    let id = UUID()
    let name: String
    let subtitle: String
    let icon: String
    let styleKey: String
    let isPremium: Bool
}

struct InstantStyleView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedStyle: ArtStyleOption?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let styles: [ArtStyleOption] = [
        ArtStyleOption(name: "Anime", subtitle: "Studio Ghibli", icon: "sparkle", styleKey: "anime_ghibli", isPremium: false),
        ArtStyleOption(name: "Oil Painting", subtitle: "Renaissance", icon: "paintbrush.fill", styleKey: "oil_painting", isPremium: false),
        ArtStyleOption(name: "3D Render", subtitle: "Pixar / Disney", icon: "cube.fill", styleKey: "3d_render", isPremium: false),
        ArtStyleOption(name: "Watercolor", subtitle: "Soft washes", icon: "drop.fill", styleKey: "watercolor", isPremium: false),
        ArtStyleOption(name: "Comic Book", subtitle: "Marvel style", icon: "book.fill", styleKey: "comic_book", isPremium: true),
        ArtStyleOption(name: "Pop Art", subtitle: "Warhol", icon: "circle.grid.3x3.fill", styleKey: "pop_art", isPremium: true),
        ArtStyleOption(name: "Cyberpunk", subtitle: "Neon future", icon: "bolt.fill", styleKey: "cyberpunk", isPremium: true),
        ArtStyleOption(name: "Fantasy", subtitle: "Lord of the Rings", icon: "wand.and.stars", styleKey: "fantasy", isPremium: false),
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
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Art Style Transfer")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    // Horizontal scrollable styles
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: GlowUpDesign.Spacing.md) {
                            ForEach(styles) { style in
                                Button {
                                    withAnimation(GlowUpDesign.Animation.quick) {
                                        selectedStyle = style
                                    }
                                } label: {
                                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                                        ZStack {
                                            Circle()
                                                .fill(.ultraThinMaterial)
                                                .frame(width: 64, height: 64)

                                            Image(systemName: style.icon)
                                                .font(.title2)
                                                .foregroundStyle(GlowUpDesign.Colors.gradient)

                                            if style.isPremium && !subscriptionManager.isSubscribed {
                                                Image(systemName: "crown.fill")
                                                    .font(.system(size: 10))
                                                    .foregroundStyle(.yellow)
                                                    .padding(4)
                                                    .background(.black.opacity(0.7))
                                                    .clipShape(Circle())
                                                    .offset(x: 24, y: -24)
                                            }
                                        }

                                        Text(style.name)
                                            .font(.caption.weight(.medium))
                                            .foregroundStyle(.white)

                                        Text(style.subtitle)
                                            .font(.caption2)
                                            .foregroundStyle(.white.opacity(0.5))
                                    }
                                    .frame(width: 90)
                                    .padding(.vertical, GlowUpDesign.Spacing.md)
                                    .background(.ultraThinMaterial)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                                            .stroke(selectedStyle?.styleKey == style.styleKey ? Color.pink : .white.opacity(0.1), lineWidth: selectedStyle?.styleKey == style.styleKey ? 2 : 1)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, GlowUpDesign.Spacing.md)
                    }

                    // Selected style info
                    if let style = selectedStyle {
                        Text("Style: \(style.name) (\(style.subtitle))")
                            .font(GlowUpDesign.Typography.body)
                            .foregroundStyle(.white.opacity(0.7))
                    }

                    // Generate CTA
                    if let style = selectedStyle {
                        Button {
                            if style.isPremium && !subscriptionManager.isSubscribed {
                                router.presentPaywall()
                            } else {
                                Task { await generateArtStyle(style: style) }
                            }
                        } label: {
                            HStack {
                                if isProcessing {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "paintpalette.fill")
                                    Text("Generate \(style.name)")
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
                    }

                    // Disclaimer
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
        .onAppear { AnalyticsService.shared.trackScreen("instant_style") }
    }

    private func generateArtStyle(style: ArtStyleOption) async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let quality = subscriptionManager.isSubscribed ? "hd" : "standard"
            let result = try await featureService.instantStyle(image: selectedImage, style: style.styleKey, quality: quality)

            transformContext.transformedImage = result
            transformContext.featureType = "instant_style"
            router.navigate(to: .featureResult(featureType: "instant_style"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
