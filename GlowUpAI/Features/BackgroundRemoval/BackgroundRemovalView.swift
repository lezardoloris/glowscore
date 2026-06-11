import SwiftUI

struct BackgroundRemovalView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

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

                    Text("Remove Background")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Instantly remove the background from your photo")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, GlowUpDesign.Spacing.lg)

                    // Info cards
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        infoRow(icon: "checkmark.circle.fill", color: .green, text: "AI-powered portrait detection")
                        infoRow(icon: "checkmark.circle.fill", color: .green, text: "Clean transparent PNG output")
                        infoRow(icon: "checkmark.circle.fill", color: .green, text: "Perfect for profile photos & stickers")
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate button
                    Button {
                        Task { await generate() }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView().tint(.white)
                            }
                            Text(isProcessing ? "Removing Background..." : "Remove Background")
                                .font(GlowUpDesign.Typography.headline)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(GlowUpDesign.Colors.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .disabled(isProcessing)
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    Text("Uses AI portrait segmentation for clean cutouts.")
                        .font(GlowUpDesign.Typography.micro)
                        .foregroundStyle(.white.opacity(0.25))
                        .multilineTextAlignment(.center)

                    Spacer(minLength: GlowUpDesign.Spacing.xxl)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: $showError) {
            Button("OK") {}
        } message: {
            Text(errorMessage ?? "Unknown error")
        }
        .onAppear { AnalyticsService.shared.trackScreen("background_removal") }
    }

    private func infoRow(icon: String, color: Color, text: String) -> some View {
        HStack(spacing: GlowUpDesign.Spacing.sm) {
            Image(systemName: icon)
                .foregroundStyle(color)
            Text(text)
                .font(GlowUpDesign.Typography.body)
                .foregroundStyle(.white.opacity(0.7))
            Spacer()
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
    }

    private func generate() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let result = try await featureService.backgroundRemoval(image: selectedImage)
            transformContext.transformedImage = result
            transformContext.featureType = "background_removal"
            router.navigate(to: .featureResult(featureType: "background_removal"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
