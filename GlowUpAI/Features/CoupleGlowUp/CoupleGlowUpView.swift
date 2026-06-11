import SwiftUI
import PhotosUI

struct CoupleGlowUpView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext

    @State private var yourPhoto: UIImage?
    @State private var partnerPhoto: UIImage?
    @State private var yourPhotoItem: PhotosPickerItem?
    @State private var partnerPhotoItem: PhotosPickerItem?
    @State private var selectedStyle: StylePreset?
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var yourResult: UIImage?
    @State private var partnerResult: UIImage?

    private let transformService = TransformationService()
    private let styles = StylePreset.defaults

    private let columns = [
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.sm),
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.sm)
    ]

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    Text("Couple Glow Up")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    // Two photo slots
                    HStack(spacing: GlowUpDesign.Spacing.md) {
                        photoSlot(title: "Your Photo", image: yourPhoto, pickerSelection: $yourPhotoItem)
                        photoSlot(title: "Partner's Photo", image: partnerPhoto, pickerSelection: $partnerPhotoItem)
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Style selector
                    if yourPhoto != nil && partnerPhoto != nil {
                        VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                            Text("Choose Style")
                                .font(GlowUpDesign.Typography.headline)
                                .foregroundStyle(.white)
                                .padding(.horizontal, GlowUpDesign.Spacing.md)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: GlowUpDesign.Spacing.sm) {
                                    ForEach(styles) { style in
                                        Button {
                                            withAnimation(GlowUpDesign.Animation.quick) {
                                                selectedStyle = style
                                            }
                                        } label: {
                                            VStack(spacing: GlowUpDesign.Spacing.xs) {
                                                Image(systemName: style.icon)
                                                    .font(.title3)
                                                    .foregroundStyle(GlowUpDesign.Colors.gradient)
                                                Text(style.name)
                                                    .font(.caption2)
                                                    .foregroundStyle(.white)
                                            }
                                            .frame(width: 80)
                                            .padding(.vertical, GlowUpDesign.Spacing.sm)
                                            .background(.ultraThinMaterial)
                                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                            .overlay(
                                                RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                                    .stroke(selectedStyle?.id == style.id ? Color.pink : .white.opacity(0.1), lineWidth: selectedStyle?.id == style.id ? 2 : 1)
                                            )
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, GlowUpDesign.Spacing.md)
                            }
                        }
                    }

                    // Results (side by side)
                    if let yourRes = yourResult, let partnerRes = partnerResult {
                        VStack(spacing: GlowUpDesign.Spacing.sm) {
                            Text("Results")
                                .font(GlowUpDesign.Typography.headline)
                                .foregroundStyle(.white)

                            HStack(spacing: GlowUpDesign.Spacing.sm) {
                                Image(uiImage: yourRes)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(maxWidth: .infinity)
                                    .aspectRatio(1, contentMode: .fit)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))

                                Image(uiImage: partnerRes)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(maxWidth: .infinity)
                                    .aspectRatio(1, contentMode: .fit)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                            }
                        }
                        .padding(.horizontal, GlowUpDesign.Spacing.md)
                    }

                    // Generate CTA
                    if yourPhoto != nil && partnerPhoto != nil && selectedStyle != nil {
                        Button {
                            Task { await generateCoupleGlowUp() }
                        } label: {
                            HStack {
                                if isProcessing {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "heart.fill")
                                    Text("Glow Up Together")
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
        .onChange(of: yourPhotoItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    yourPhoto = image
                }
            }
        }
        .onChange(of: partnerPhotoItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    partnerPhoto = image
                }
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
        .onAppear { AnalyticsService.shared.trackScreen("couple_glow_up") }
    }

    @ViewBuilder
    private func photoSlot(title: String, image: UIImage?, pickerSelection: Binding<PhotosPickerItem?>) -> some View {
        VStack(spacing: GlowUpDesign.Spacing.sm) {
            Text(title)
                .font(GlowUpDesign.Typography.caption)
                .foregroundStyle(.white.opacity(0.6))

            PhotosPicker(selection: pickerSelection, matching: .images) {
                if let img = image {
                    Image(uiImage: img)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity)
                        .aspectRatio(1, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                } else {
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title)
                            .foregroundStyle(GlowUpDesign.Colors.gradient)
                        Text("Add Photo")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.5))
                    }
                    .frame(maxWidth: .infinity)
                    .aspectRatio(1, contentMode: .fit)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                    .overlay(
                        RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                            .stroke(.white.opacity(0.2), lineWidth: 1)
                    )
                }
            }
        }
    }

    private func generateCoupleGlowUp() async {
        guard let your = yourPhoto, let partner = partnerPhoto, let style = selectedStyle else { return }
        isProcessing = true
        defer { isProcessing = false }

        do {
            let token = subscriptionManager.subscriberToken

            // Run both transforms in parallel
            async let yourTransform = subscriptionManager.isSubscribed
                ? transformService.transformHD(image: your, style: style, subscriberToken: token)
                : transformService.transformPreview(image: your, style: style)

            async let partnerTransform = subscriptionManager.isSubscribed
                ? transformService.transformHD(image: partner, style: style, subscriberToken: token)
                : transformService.transformPreview(image: partner, style: style)

            let (yourRes, partnerRes) = try await (yourTransform, partnerTransform)
            yourResult = yourRes
            partnerResult = partnerRes

            UINotificationFeedbackGenerator().notificationOccurred(.success)
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
