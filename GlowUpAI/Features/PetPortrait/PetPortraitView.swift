import SwiftUI

struct PetPreset: Identifiable {
    let id = UUID()
    let key: String
    let emoji: String
    let name: String
}

struct PetPortraitView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedPreset: String?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let presets: [PetPreset] = [
        PetPreset(key: "royal", emoji: "\u{1F451}", name: "Royal"),
        PetPreset(key: "superhero", emoji: "\u{1F9B8}", name: "Superhero"),
        PetPreset(key: "astronaut", emoji: "\u{1F680}", name: "Astronaut"),
        PetPreset(key: "renaissance", emoji: "\u{1F3A8}", name: "Renaissance"),
        PetPreset(key: "anime", emoji: "\u{1F338}", name: "Anime"),
        PetPreset(key: "detective", emoji: "\u{1F50D}", name: "Detective"),
        PetPreset(key: "wizard", emoji: "\u{1F9D9}", name: "Wizard"),
        PetPreset(key: "chef", emoji: "\u{1F468}\u{200D}\u{1F373}", name: "Chef"),
    ]

    private let columns = [
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.sm),
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.sm)
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // Pet photo
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Pet Portrait")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Choose a style for your pet")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.5))

                    // Style grid
                    LazyVGrid(columns: columns, spacing: GlowUpDesign.Spacing.sm) {
                        ForEach(presets) { preset in
                            Button {
                                withAnimation(GlowUpDesign.Animation.quick) {
                                    selectedPreset = preset.key
                                }
                            } label: {
                                VStack(spacing: GlowUpDesign.Spacing.sm) {
                                    Text(preset.emoji)
                                        .font(.system(size: 32))
                                    Text(preset.name)
                                        .font(.subheadline.weight(.medium))
                                        .foregroundStyle(.white)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, GlowUpDesign.Spacing.md)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                .overlay(
                                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                        .stroke(selectedPreset == preset.key ? Color.pink : .white.opacity(0.1), lineWidth: selectedPreset == preset.key ? 2 : 1)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate CTA
                    if let preset = selectedPreset {
                        Button {
                            Task { await generate(style: preset) }
                        } label: {
                            HStack {
                                if isProcessing {
                                    ProgressView().tint(.white)
                                } else {
                                    Image(systemName: "pawprint.fill")
                                    Text("Generate Portrait")
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
        .onAppear { AnalyticsService.shared.trackScreen("pet_portrait") }
    }

    private func generate(style: String) async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let result = try await featureService.petPortrait(image: selectedImage, style: style)
            transformContext.transformedImage = result
            transformContext.featureType = "pet_portrait"
            router.navigate(to: .featureResult(featureType: "pet_portrait"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
