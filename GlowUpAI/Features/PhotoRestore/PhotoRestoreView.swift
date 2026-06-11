import SwiftUI

struct PhotoRestoreView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var fixColors = true
    @State private var removeScratches = true
    @State private var enhanceResolution = true
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

                    Text("Photo Restore")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    Text("Fix old or damaged photos with AI")
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, GlowUpDesign.Spacing.lg)

                    // Toggle options
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        toggleRow(title: "Fix Colors", subtitle: "Correct faded or discolored areas", isOn: $fixColors)
                        toggleRow(title: "Remove Scratches", subtitle: "Repair scratches and damage", isOn: $removeScratches)
                        toggleRow(title: "Enhance Resolution", subtitle: "Sharpen and upscale details", isOn: $enhanceResolution)
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
                            Text(isProcessing ? "Restoring..." : "Restore Photo")
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

                    Text("Works best with old photographs, scanned prints, and damaged images.")
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
        .onAppear { AnalyticsService.shared.trackScreen("photo_restore") }
    }

    private func toggleRow(title: String, subtitle: String, isOn: Binding<Bool>) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(GlowUpDesign.Typography.body)
                    .foregroundStyle(.white)
                Text(subtitle)
                    .font(GlowUpDesign.Typography.caption)
                    .foregroundStyle(.white.opacity(0.5))
            }
            Spacer()
            Toggle("", isOn: isOn)
                .tint(GlowUpDesign.Colors.primary)
                .labelsHidden()
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
    }

    private func generate() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let result = try await featureService.photoRestore(
                image: selectedImage,
                fixColors: fixColors,
                removeScratches: removeScratches,
                enhanceResolution: enhanceResolution
            )
            transformContext.transformedImage = result
            transformContext.featureType = "photo_restore"
            router.navigate(to: .featureResult(featureType: "photo_restore"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
