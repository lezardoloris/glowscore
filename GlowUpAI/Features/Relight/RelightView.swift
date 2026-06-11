import SwiftUI

struct RelightView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedPreset = "golden_hour"
    @State private var selectedDirection = "right"
    @State private var customPrompt = ""
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let lightingPresets: [(key: String, name: String)] = [
        ("golden_hour", "Golden Hour"),
        ("studio_flash", "Studio Flash"),
        ("dramatic_side", "Dramatic Side"),
        ("neon_glow", "Neon Glow"),
        ("candlelight", "Candlelight"),
        ("moonlight", "Moonlight"),
    ]

    private let directions: [(key: String, name: String, icon: String)] = [
        ("left", "Left", "arrow.left"),
        ("right", "Right", "arrow.right"),
        ("top", "Top", "arrow.up"),
        ("bottom", "Bottom", "arrow.down"),
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

                    Text("Relight Photo")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    // Lighting presets (horizontal pills)
                    VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                        Text("Lighting Preset")
                            .font(GlowUpDesign.Typography.headline)
                            .foregroundStyle(.white)
                            .padding(.horizontal, GlowUpDesign.Spacing.md)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: GlowUpDesign.Spacing.sm) {
                                ForEach(lightingPresets, id: \.key) { preset in
                                    Button {
                                        withAnimation(GlowUpDesign.Animation.quick) {
                                            selectedPreset = preset.key
                                        }
                                    } label: {
                                        Text(preset.name)
                                            .font(.subheadline.weight(.medium))
                                            .foregroundStyle(selectedPreset == preset.key ? .white : .white.opacity(0.6))
                                            .padding(.horizontal, GlowUpDesign.Spacing.md)
                                            .padding(.vertical, GlowUpDesign.Spacing.sm)
                                            .background(selectedPreset == preset.key ? AnyShapeStyle(GlowUpDesign.Colors.gradient) : AnyShapeStyle(.ultraThinMaterial))
                                            .clipShape(Capsule())
                                            .overlay(
                                                Capsule()
                                                    .stroke(.white.opacity(0.1), lineWidth: selectedPreset == preset.key ? 0 : 1)
                                            )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal, GlowUpDesign.Spacing.md)
                        }
                    }

                    // Direction picker
                    VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                        Text("Light Direction")
                            .font(GlowUpDesign.Typography.headline)
                            .foregroundStyle(.white)

                        HStack(spacing: GlowUpDesign.Spacing.sm) {
                            ForEach(directions, id: \.key) { dir in
                                Button {
                                    withAnimation(GlowUpDesign.Animation.quick) {
                                        selectedDirection = dir.key
                                    }
                                } label: {
                                    VStack(spacing: GlowUpDesign.Spacing.xs) {
                                        Image(systemName: dir.icon)
                                            .font(.title3)
                                        Text(dir.name)
                                            .font(.caption2)
                                    }
                                    .foregroundStyle(selectedDirection == dir.key ? .pink : .white.opacity(0.7))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, GlowUpDesign.Spacing.md)
                                    .background(.ultraThinMaterial)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                            .stroke(selectedDirection == dir.key ? Color.pink : .white.opacity(0.1), lineWidth: selectedDirection == dir.key ? 2 : 1)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Custom lighting description
                    VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                        Text("Custom Lighting (optional)")
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(.white.opacity(0.6))

                        TextField("e.g., warm sunset through window", text: $customPrompt)
                            .textFieldStyle(.plain)
                            .foregroundStyle(.white)
                            .padding(GlowUpDesign.Spacing.md)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                            .overlay(
                                RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                    .stroke(.white.opacity(0.1), lineWidth: 1)
                            )
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate CTA
                    Button {
                        Task { await generateRelight() }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "lightbulb.fill")
                                Text("Relight Photo")
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
        .onAppear { AnalyticsService.shared.trackScreen("relight") }
    }

    private func generateRelight() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let prompt = customPrompt.isEmpty ? selectedPreset.replacingOccurrences(of: "_", with: " ") : customPrompt
            let quality = subscriptionManager.isSubscribed ? "hd" : "standard"
            let result = try await featureService.relight(image: selectedImage, prompt: prompt, direction: selectedDirection, quality: quality)

            transformContext.transformedImage = result
            transformContext.featureType = "relight"
            router.navigate(to: .featureResult(featureType: "relight"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
