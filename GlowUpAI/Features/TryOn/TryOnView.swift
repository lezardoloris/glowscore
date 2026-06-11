import SwiftUI
import PhotosUI

struct TryOnView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var garmentImage: UIImage?
    @State private var selectedItem: PhotosPickerItem?
    @State private var garmentType = "upper_body"
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let garmentTypes: [(key: String, name: String, icon: String)] = [
        ("upper_body", "Upper Body", "tshirt.fill"),
        ("lower_body", "Lower Body", "figure.walk"),
        ("dresses", "Dresses", "figure.dress.line.vertical.figure"),
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User photo
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 120, height: 160)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                        .overlay(
                            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                                .stroke(.white.opacity(0.3), lineWidth: 2)
                        )
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Virtual Try-On")
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

                    // Garment image picker
                    VStack(spacing: GlowUpDesign.Spacing.md) {
                        if let garment = garmentImage {
                            Image(uiImage: garment)
                                .resizable()
                                .scaledToFit()
                                .frame(height: 120)
                                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        }

                        PhotosPicker(selection: $selectedItem, matching: .images) {
                            HStack {
                                Image(systemName: garmentImage == nil ? "photo.on.rectangle" : "arrow.triangle.2.circlepath")
                                Text(garmentImage == nil ? "Select a Garment" : "Change Garment")
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                            .overlay(
                                RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                    .stroke(.white.opacity(0.2), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Garment type picker
                    VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                        Text("Garment Type")
                            .font(GlowUpDesign.Typography.headline)
                            .foregroundStyle(.white)

                        HStack(spacing: GlowUpDesign.Spacing.sm) {
                            ForEach(garmentTypes, id: \.key) { type in
                                Button {
                                    withAnimation(GlowUpDesign.Animation.quick) {
                                        garmentType = type.key
                                    }
                                } label: {
                                    VStack(spacing: GlowUpDesign.Spacing.xs) {
                                        Image(systemName: type.icon)
                                            .font(.title3)
                                        Text(type.name)
                                            .font(.caption2)
                                    }
                                    .foregroundStyle(garmentType == type.key ? .pink : .white.opacity(0.7))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, GlowUpDesign.Spacing.md)
                                    .background(.ultraThinMaterial)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                            .stroke(garmentType == type.key ? Color.pink : .white.opacity(0.1), lineWidth: garmentType == type.key ? 2 : 1)
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
                            Task { await generateTryOn() }
                        }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "tshirt.fill")
                                Text("Try On")
                            }
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(garmentImage != nil ? AnyShapeStyle(GlowUpDesign.Colors.gradient) : AnyShapeStyle(Color.gray.opacity(0.5)))
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .disabled(garmentImage == nil || isProcessing)
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    if !subscriptionManager.isSubscribed {
                        Text("Subscribe to unlock Virtual Try-On")
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
        .onChange(of: selectedItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    garmentImage = image
                }
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
        .onAppear { AnalyticsService.shared.trackScreen("try_on") }
    }

    private func generateTryOn() async {
        guard let garment = garmentImage else { return }
        isProcessing = true
        defer { isProcessing = false }

        do {
            let result = try await featureService.tryOn(humanImage: selectedImage, garmentImage: garment, garmentType: garmentType)

            transformContext.transformedImage = result
            transformContext.featureType = "try_on"
            router.navigate(to: .featureResult(featureType: "try_on"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
