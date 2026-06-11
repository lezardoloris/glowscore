import SwiftUI

struct HairStyle: Identifiable {
    let id = UUID()
    let name: String
    let prompt: String
}

struct HairChangeView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedHairStyle: HairStyle?
    @State private var customPrompt = ""
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let hairStyles: [HairStyle] = [
        HairStyle(name: "Blonde Bob", prompt: "short blonde bob hairstyle"),
        HairStyle(name: "Red Curls", prompt: "red curly hair"),
        HairStyle(name: "Buzz Cut", prompt: "buzz cut very short hair"),
        HairStyle(name: "Long Straight", prompt: "long straight silky hair"),
        HairStyle(name: "Braids", prompt: "braided hairstyle"),
        HairStyle(name: "Mohawk", prompt: "mohawk hairstyle"),
        HairStyle(name: "Afro", prompt: "natural afro hairstyle"),
        HairStyle(name: "Platinum", prompt: "platinum blonde hair"),
        HairStyle(name: "Balayage", prompt: "balayage highlights hairstyle"),
        HairStyle(name: "Bangs", prompt: "hair with bangs fringe"),
        HairStyle(name: "Pixie Cut", prompt: "pixie cut short hairstyle"),
        HairStyle(name: "Dreadlocks", prompt: "dreadlocks hairstyle"),
    ]

    private let columns = [
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.sm),
        GridItem(.flexible(), spacing: GlowUpDesign.Spacing.sm)
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

                    Text("Hair Change")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    // Hairstyle grid
                    LazyVGrid(columns: columns, spacing: GlowUpDesign.Spacing.sm) {
                        ForEach(hairStyles) { style in
                            Button {
                                withAnimation(GlowUpDesign.Animation.quick) {
                                    selectedHairStyle = style
                                    customPrompt = ""
                                }
                            } label: {
                                Text(style.name)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, GlowUpDesign.Spacing.md)
                                    .background(.ultraThinMaterial)
                                    .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                            .stroke(selectedHairStyle?.name == style.name ? Color.pink : .white.opacity(0.1), lineWidth: selectedHairStyle?.name == style.name ? 2 : 1)
                                    )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Custom text input
                    VStack(alignment: .leading, spacing: GlowUpDesign.Spacing.sm) {
                        Text("Or describe any hairstyle:")
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(.white.opacity(0.6))

                        TextField("e.g., wavy silver hair with highlights", text: $customPrompt)
                            .textFieldStyle(.plain)
                            .foregroundStyle(.white)
                            .padding(GlowUpDesign.Spacing.md)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                            .overlay(
                                RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                    .stroke(.white.opacity(0.1), lineWidth: 1)
                            )
                            .onChange(of: customPrompt) { _, newValue in
                                if !newValue.isEmpty { selectedHairStyle = nil }
                            }
                    }
                    .padding(.horizontal, GlowUpDesign.Spacing.md)

                    // Generate CTA
                    if selectedHairStyle != nil || !customPrompt.isEmpty {
                        Button {
                            Task { await generateHairChange() }
                        } label: {
                            HStack {
                                if isProcessing {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "scissors")
                                    Text("Change Hair")
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
        .onAppear { AnalyticsService.shared.trackScreen("hair_change") }
    }

    private func generateHairChange() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let prompt = customPrompt.isEmpty ? (selectedHairStyle?.prompt ?? "") : customPrompt
            let quality = subscriptionManager.isSubscribed ? "hd" : "standard"
            let result = try await featureService.hairChange(image: selectedImage, prompt: prompt, quality: quality)

            transformContext.transformedImage = result
            transformContext.featureType = "hair_change"
            router.navigate(to: .featureResult(featureType: "hair_change"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
