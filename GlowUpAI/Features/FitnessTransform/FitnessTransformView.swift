import SwiftUI

struct FitnessIntensity: Identifiable {
    let id = UUID()
    let key: String
    let emoji: String
    let name: String
    let subtitle: String
}

struct FitnessTransformView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedIntensity = "moderate"
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let intensities: [FitnessIntensity] = [
        FitnessIntensity(key: "light", emoji: "\u{1F3C3}", name: "Light", subtitle: "Subtle toning"),
        FitnessIntensity(key: "moderate", emoji: "\u{1F4AA}", name: "Moderate", subtitle: "Athletic build"),
        FitnessIntensity(key: "dramatic", emoji: "\u{1F525}", name: "Dramatic", subtitle: "Peak fitness"),
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User photo
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 160, height: 160)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                        .overlay(
                            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                                .stroke(.white.opacity(0.2), lineWidth: 1)
                        )
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.lg)

                    Text("Fitness Transform")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Visualize your fitness goals")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.5))

                    // Intensity pills
                    HStack(spacing: GlowUpDesign.Spacing.sm) {
                        ForEach(intensities) { intensity in
                            Button {
                                withAnimation(GlowUpDesign.Animation.quick) {
                                    selectedIntensity = intensity.key
                                }
                            } label: {
                                VStack(spacing: GlowUpDesign.Spacing.sm) {
                                    Text(intensity.emoji)
                                        .font(.system(size: 28))
                                    Text(intensity.name)
                                        .font(.subheadline.weight(.medium))
                                        .foregroundStyle(.white)
                                    Text(intensity.subtitle)
                                        .font(.caption2)
                                        .foregroundStyle(.white.opacity(0.5))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, GlowUpDesign.Spacing.md)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                .overlay(
                                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                        .stroke(selectedIntensity == intensity.key ? Color.pink : .white.opacity(0.1), lineWidth: selectedIntensity == intensity.key ? 2 : 1)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate button
                    Button {
                        Task { await generate() }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView().tint(.white)
                            } else {
                                Image(systemName: "figure.run")
                                Text("Transform")
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

                    // Disclaimer
                    Text("AI visualization for motivation only. Results are artistic representations.")
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
        .onAppear { AnalyticsService.shared.trackScreen("fitness_transform") }
    }

    private func generate() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let result = try await featureService.fitnessTransform(image: selectedImage, intensity: selectedIntensity)
            transformContext.transformedImage = result
            transformContext.featureType = "fitness_transform"
            router.navigate(to: .featureResult(featureType: "fitness_transform"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
