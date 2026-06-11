import SwiftUI

struct AgeTransformView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let selectedImage: UIImage

    @State private var selectedAgeIndex: Int = 3 // Default: Young Adult (25)
    @State private var isProcessing = false
    @State private var errorMessage: String?
    @State private var showError = false

    private let featureService = FeatureService.shared

    private let ageSteps: [(age: Int, label: String)] = [
        (5, "Baby"),
        (10, "Child"),
        (15, "Teen"),
        (25, "Young Adult"),
        (40, "Middle Age"),
        (60, "Senior"),
        (80, "Elder"),
    ]

    var currentAge: Int { ageSteps[selectedAgeIndex].age }
    var currentLabel: String { ageSteps[selectedAgeIndex].label }

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: GlowUpDesign.Spacing.lg) {
                    // User selfie
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 120, height: 120)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                        .padding(.top, GlowUpDesign.Spacing.md)

                    Text("Age Machine")
                        .font(GlowUpDesign.Typography.title)
                        .foregroundStyle(.white)

                    // Age display
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        Text("\(currentAge)")
                            .font(.system(size: 56, weight: .bold))
                            .foregroundStyle(GlowUpDesign.Colors.gradient)

                        Text(currentLabel)
                            .font(GlowUpDesign.Typography.headline)
                            .foregroundStyle(.white.opacity(0.7))
                    }

                    // Age slider (discrete steps)
                    VStack(spacing: GlowUpDesign.Spacing.sm) {
                        // Custom discrete slider using buttons
                        HStack(spacing: 0) {
                            ForEach(0..<ageSteps.count, id: \.self) { index in
                                Button {
                                    withAnimation(GlowUpDesign.Animation.spring) {
                                        selectedAgeIndex = index
                                    }
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                } label: {
                                    VStack(spacing: GlowUpDesign.Spacing.xs) {
                                        Circle()
                                            .fill(index == selectedAgeIndex ? Color.pink : .white.opacity(0.3))
                                            .frame(width: index == selectedAgeIndex ? 16 : 10, height: index == selectedAgeIndex ? 16 : 10)
                                            .animation(GlowUpDesign.Animation.spring, value: selectedAgeIndex)

                                        Text("\(ageSteps[index].age)")
                                            .font(.system(size: 10, weight: index == selectedAgeIndex ? .bold : .regular))
                                            .foregroundStyle(index == selectedAgeIndex ? .white : .white.opacity(0.4))
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, GlowUpDesign.Spacing.md)

                        // Connecting line
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Rectangle()
                                    .fill(.white.opacity(0.2))
                                    .frame(height: 2)

                                Rectangle()
                                    .fill(GlowUpDesign.Colors.gradient)
                                    .frame(width: geo.size.width * CGFloat(selectedAgeIndex) / CGFloat(ageSteps.count - 1), height: 2)
                                    .animation(GlowUpDesign.Animation.spring, value: selectedAgeIndex)
                            }
                        }
                        .frame(height: 2)
                        .padding(.horizontal, GlowUpDesign.Spacing.xl)

                        // Age labels
                        HStack {
                            ForEach(0..<ageSteps.count, id: \.self) { index in
                                Text(ageSteps[index].label)
                                    .font(.system(size: 8))
                                    .foregroundStyle(index == selectedAgeIndex ? .white : .white.opacity(0.3))
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .padding(.horizontal, GlowUpDesign.Spacing.md)
                    }

                    // Generate CTA
                    Button {
                        Task { await generateAgeTransform() }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "hourglass")
                                Text("See Yourself at \(currentAge)")
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
        .onAppear { AnalyticsService.shared.trackScreen("age_transform") }
    }

    private func generateAgeTransform() async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let quality = subscriptionManager.isSubscribed ? "hd" : "standard"
            let result = try await featureService.ageTransform(image: selectedImage, targetAge: currentAge, quality: quality)

            transformContext.transformedImage = result
            transformContext.featureType = "age_transform"
            router.navigate(to: .featureResult(featureType: "age_transform"))
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
