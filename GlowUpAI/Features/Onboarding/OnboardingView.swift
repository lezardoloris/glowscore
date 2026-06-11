import SwiftUI
import AVFoundation
import RevenueCat

// MARK: - Onboarding Container (3 onboarding pages + camera as 4th screen, replaces old carousel)

struct OnboardingView: View {
    @Binding var hasCompletedOnboarding: Bool
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @State private var currentPage = 0

    private let pageCount = 3

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                TabView(selection: $currentPage) {
                    OnboardingHookScreen(onContinue: advancePage)
                        .tag(0)
                    OnboardingCameraScreen(onContinue: advancePage)
                        .tag(1)
                    OnboardingSoftPricingScreen(
                        onStartTrial: { await startTrial() },
                        onStartFree: { completeOnboarding(trialStarted: false) }
                    )
                    .tag(2)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.35), value: currentPage)

                // Custom page indicator dots
                HStack(spacing: GlowUpDesign.Spacing.sm) {
                    ForEach(0..<pageCount, id: \.self) { index in
                        Capsule()
                            .fill(
                                index == currentPage
                                    ? AnyShapeStyle(GlowUpDesign.Colors.gradient)
                                    : AnyShapeStyle(Color.white.opacity(0.3))
                            )
                            .frame(width: index == currentPage ? 24 : 8, height: 8)
                            .animation(.spring(duration: 0.3), value: currentPage)
                    }
                }
                .padding(.bottom, GlowUpDesign.Spacing.lg)
            }
        }
        .onAppear {
            AnalyticsService.shared.trackOnboardingStarted()
        }
    }

    // MARK: - Actions

    private func advancePage() {
        withAnimation { currentPage += 1 }
    }

    private func startTrial() async {
        AnalyticsService.shared.track("onboarding_trial_started")
        await subscriptionManager.fetchOfferings()
        guard let offering = subscriptionManager.currentOffering,
              let package = offering.availablePackages.first(where: { $0.identifier == "$rc_annual" }) else {
            // If offerings fail to load, just complete onboarding
            completeOnboarding(trialStarted: false)
            return
        }
        do {
            let success = try await subscriptionManager.purchase(package: package)
            if success {
                completeOnboarding(trialStarted: true)
            }
        } catch {
            // User cancelled or error — stay on screen
            print("Purchase error: \(error)")
        }
    }

    private func completeOnboarding(trialStarted: Bool) {
        if !trialStarted {
            AnalyticsService.shared.track("onboarding_skipped_to_free")
        }
        AnalyticsService.shared.trackOnboardingCompleted()
        hasCompletedOnboarding = true
    }
}

// MARK: - Screen 1: Hook — "See Your Best Self"

private struct OnboardingHookScreen: View {
    let onContinue: () -> Void
    @State private var sliderPosition: CGFloat = 0.3
    @State private var animatingForward = true

    // Auto-cycling timer for fake before/after slider
    private let timer = Timer.publish(every: 0.03, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: GlowUpDesign.Spacing.lg) {
            Spacer()

            // Before / After demo area
            // TODO: Replace with real before/after sample images
            ZStack {
                GeometryReader { geo in
                    let w = geo.size.width
                    let h = geo.size.height
                    let dividerX = w * sliderPosition

                    // "After" side — gradient placeholder
                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.xl)
                        .fill(
                            LinearGradient(
                                colors: [.pink.opacity(0.7), .purple.opacity(0.7)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            VStack {
                                Image(systemName: "sparkles")
                                    .font(.system(size: 48))
                                    .foregroundStyle(.white.opacity(0.9))
                                Text("AFTER")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                        )

                    // "Before" side — darker placeholder
                    RoundedRectangle(cornerRadius: GlowUpDesign.Radius.xl)
                        .fill(Color.gray.opacity(0.5))
                        .overlay(
                            VStack {
                                Image(systemName: "person.fill")
                                    .font(.system(size: 48))
                                    .foregroundStyle(.white.opacity(0.6))
                                Text("BEFORE")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white.opacity(0.5))
                            }
                        )
                        .clipShape(HorizontalClipShape(splitAt: sliderPosition))

                    // Divider line
                    Rectangle()
                        .fill(.white)
                        .frame(width: 2, height: h)
                        .position(x: dividerX, y: h / 2)
                        .shadow(color: .black.opacity(0.3), radius: 4)

                    // Handle
                    Circle()
                        .fill(.white)
                        .frame(width: 36, height: 36)
                        .overlay(
                            HStack(spacing: 2) {
                                Image(systemName: "chevron.left")
                                    .font(.caption2.bold())
                                Image(systemName: "chevron.right")
                                    .font(.caption2.bold())
                            }
                            .foregroundStyle(.black)
                        )
                        .shadow(color: .black.opacity(0.3), radius: 6)
                        .position(x: dividerX, y: h / 2)
                }
            }
            .frame(height: 280)
            .padding(.horizontal, GlowUpDesign.Spacing.xl)
            .onReceive(timer) { _ in
                if animatingForward {
                    sliderPosition += 0.005
                    if sliderPosition >= 0.75 { animatingForward = false }
                } else {
                    sliderPosition -= 0.005
                    if sliderPosition <= 0.25 { animatingForward = true }
                }
            }

            // Headlines
            VStack(spacing: GlowUpDesign.Spacing.sm) {
                Text("See Your Best Self")
                    .font(GlowUpDesign.Typography.heroTitle)
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)

                Text("AI-powered glow ups in 30 seconds")
                    .font(.body)
                    .foregroundStyle(.subtleText)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, GlowUpDesign.Spacing.lg)

            // Reassurance
            HStack(spacing: 6) {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(.green)
                Text("100% free to try")
                    .foregroundStyle(.white.opacity(0.8))
            }
            .font(.subheadline)

            Spacer()

            // CTA
            Button(action: onContinue) {
                HStack {
                    Text("Get Started")
                        .font(.headline)
                    Image(systemName: "arrow.right")
                        .font(.headline)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(GlowUpDesign.Colors.gradient)
                .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
            }
            .padding(.horizontal, GlowUpDesign.Spacing.lg)
            .padding(.bottom, GlowUpDesign.Spacing.md)
        }
    }
}

// MARK: - Screen 2: Camera Permission

private struct OnboardingCameraScreen: View {
    let onContinue: () -> Void
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: GlowUpDesign.Spacing.xl) {
            Spacer()

            // Camera icon with shield badge
            ZStack {
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.purple.opacity(0.2), .clear],
                            center: .center,
                            startRadius: 40,
                            endRadius: 120
                        )
                    )
                    .frame(width: 220, height: 220)
                    .scaleEffect(isAnimating ? 1.05 : 0.95)

                ZStack(alignment: .bottomTrailing) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(GlowUpDesign.Colors.gradient)

                    Image(systemName: "shield.checkered")
                        .font(.system(size: 28))
                        .foregroundStyle(.green)
                        .offset(x: 10, y: 10)
                }
            }

            // Headlines
            VStack(spacing: GlowUpDesign.Spacing.sm) {
                Text("One Quick Thing")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(.white)

                Text("GlowUp AI needs your camera to create transformations.")
                    .font(.body)
                    .foregroundStyle(.subtleText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, GlowUpDesign.Spacing.xl)
            }

            // Privacy badge
            HStack(spacing: 10) {
                Image(systemName: "lock.shield.fill")
                    .foregroundStyle(.green)
                Text("Photos processed on-device. Never uploaded without your action.")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(.horizontal, GlowUpDesign.Spacing.lg)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
            .padding(.horizontal, GlowUpDesign.Spacing.lg)

            Spacer()

            // CTA — Allow Camera
            VStack(spacing: GlowUpDesign.Spacing.md) {
                Button {
                    requestCameraPermission()
                } label: {
                    Text("Allow Camera Access")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(GlowUpDesign.Colors.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                }

                // Skip option
                Button {
                    onContinue()
                } label: {
                    Text("Or choose photos from library")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.5))
                }
            }
            .padding(.horizontal, GlowUpDesign.Spacing.lg)
            .padding(.bottom, GlowUpDesign.Spacing.md)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                isAnimating = true
            }
        }
    }

    private func requestCameraPermission() {
        AVCaptureDevice.requestAccess(for: .video) { _ in
            DispatchQueue.main.async {
                onContinue()
            }
        }
    }
}

// MARK: - Screen 3: Soft Pricing

private struct OnboardingSoftPricingScreen: View {
    let onStartTrial: () async -> Void
    let onStartFree: () -> Void
    @State private var isPurchasing = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: GlowUpDesign.Spacing.lg) {
                Spacer(minLength: GlowUpDesign.Spacing.xl)

                // FREE tier
                VStack(alignment: .leading, spacing: 14) {
                    Text("FREE")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(.ultraThinMaterial)
                        .clipShape(Capsule())

                    OnboardingFeatureRow(icon: "paintpalette.fill", text: "All 8 styles")
                    OnboardingFeatureRow(icon: "bolt.fill", text: "5 transforms / day")
                    OnboardingFeatureRow(icon: "chart.bar.fill", text: "Full GlowScore")
                    OnboardingFeatureRow(icon: "square.and.arrow.up.fill", text: "Share to social")
                }
                .padding(.horizontal, GlowUpDesign.Spacing.xl)

                // Divider
                Rectangle()
                    .fill(.white.opacity(0.1))
                    .frame(height: 1)
                    .padding(.horizontal, GlowUpDesign.Spacing.xl)

                // PREMIUM tier
                VStack(alignment: .leading, spacing: 14) {
                    HStack(spacing: 8) {
                        Text("PREMIUM")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(GlowUpDesign.Colors.gradient)
                            .clipShape(Capsule())

                        Image(systemName: "crown.fill")
                            .foregroundStyle(.yellow)
                            .font(.subheadline)
                    }

                    Text("Everything free, PLUS:")
                        .font(.subheadline)
                        .foregroundStyle(.subtleText)

                    OnboardingFeatureRow(icon: "photo.fill", text: "HD / 4K quality", isPremium: true)
                    OnboardingFeatureRow(icon: "star.fill", text: "Exclusive monthly styles", isPremium: true)
                    OnboardingFeatureRow(icon: "nosign", text: "No ads", isPremium: true)
                    OnboardingFeatureRow(icon: "square.stack.3d.up.fill", text: "Batch processing", isPremium: true)
                }
                .padding(.horizontal, GlowUpDesign.Spacing.xl)

                Spacer(minLength: GlowUpDesign.Spacing.lg)

                // CTA — Trial
                VStack(spacing: GlowUpDesign.Spacing.sm) {
                    Button {
                        isPurchasing = true
                        Task {
                            await onStartTrial()
                            isPurchasing = false
                        }
                    } label: {
                        Group {
                            if isPurchasing {
                                ProgressView().tint(.white)
                            } else {
                                Text("Try Premium Free — 3 Days")
                                    .font(.headline)
                            }
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(GlowUpDesign.Colors.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                    .disabled(isPurchasing)

                    // CTA — Free
                    Button(action: onStartFree) {
                        Text("Start Free Instead")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white.opacity(0.9))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                    }
                }
                .padding(.horizontal, GlowUpDesign.Spacing.lg)

                // Legal footer
                VStack(spacing: 6) {
                    Text("Cancel anytime. $14.99/year after trial.")
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.3))

                    HStack(spacing: 16) {
                        Link("Terms", destination: Configuration.termsURL)
                        Text("|").foregroundStyle(.white.opacity(0.2))
                        Link("Privacy", destination: Configuration.privacyURL)
                    }
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.3))
                }
                .padding(.bottom, GlowUpDesign.Spacing.xl)
            }
        }
        .onAppear {
            AnalyticsService.shared.track("onboarding_pricing_viewed")
        }
    }
}

// MARK: - Subviews

private struct OnboardingFeatureRow: View {
    let icon: String
    let text: String
    var isPremium: Bool = false

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(isPremium ? .purple : .pink)
                .frame(width: 24)
            Text(text)
                .foregroundStyle(.white.opacity(0.9))
        }
        .font(.subheadline)
    }
}
