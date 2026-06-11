import SwiftUI
import RevenueCat

struct PricingView: View {
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var router: NavigationRouter
    @State private var selectedPlan: PlanType = .annual
    @State private var isPurchasing = false
    @State private var errorMessage: String?

    enum PlanType: String, CaseIterable {
        case weekly = "Weekly"
        case annual = "Annual"
        case lifetime = "Lifetime"
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.1, green: 0.0, blue: 0.2), .black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Crown icon
                    Image(systemName: "crown.fill")
                        .font(.system(size: 52))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(red: 1.0, green: 0.84, blue: 0.0), Color(red: 0.93, green: 0.69, blue: 0.13)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .padding(.top, 24)

                    // Headline
                    Text("Go Premium")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(.white)

                    // Feature checklist
                    VStack(alignment: .leading, spacing: 16) {
                        PricingFeatureRow(icon: "photo.fill", text: "HD / 4K Quality")
                        PricingFeatureRow(icon: "star.fill", text: "Exclusive Monthly Drops")
                        PricingFeatureRow(icon: "nosign", text: "No Ads")
                        PricingFeatureRow(icon: "square.stack.3d.up.fill", text: "Batch Processing")
                        PricingFeatureRow(icon: "bolt.fill", text: "Priority Generation")
                    }
                    .padding(.horizontal, 32)

                    // Pricing cards
                    VStack(spacing: 12) {
                        // Weekly
                        PricingCard(
                            title: "Weekly",
                            price: "$2.99/week",
                            detail: nil,
                            badge: nil,
                            isSelected: selectedPlan == .weekly,
                            accentColor: .white.opacity(0.3)
                        ) {
                            selectedPlan = .weekly
                        }

                        // Annual — pre-selected, BEST VALUE
                        PricingCard(
                            title: "Annual",
                            price: "$14.99/year",
                            detail: "Just $0.29/week",
                            badge: "BEST VALUE",
                            isSelected: selectedPlan == .annual,
                            accentColor: .purple
                        ) {
                            selectedPlan = .annual
                        }

                        // Lifetime
                        PricingCard(
                            title: "Lifetime",
                            price: "$39.99",
                            detail: "Pay Once",
                            badge: nil,
                            isSelected: selectedPlan == .lifetime,
                            accentColor: .white.opacity(0.3)
                        ) {
                            selectedPlan = .lifetime
                        }
                    }
                    .padding(.horizontal, 20)

                    // Primary CTA
                    Button {
                        Task { await purchase() }
                    } label: {
                        Group {
                            if isPurchasing {
                                ProgressView().tint(.white)
                            } else {
                                Text(ctaText)
                                    .font(.headline)
                            }
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            LinearGradient(
                                colors: [.pink, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(isPurchasing)
                    .padding(.horizontal, 20)

                    // Secondary CTA — "Start Free Instead"
                    Button {
                        router.goBack()
                    } label: {
                        Text("Start Free Instead")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white.opacity(0.9))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .padding(.horizontal, 20)

                    // Legal footer
                    VStack(spacing: 8) {
                        Button("Restore Purchases") {
                            Task {
                                try? await subscriptionManager.restorePurchases()
                                if subscriptionManager.isSubscribed {
                                    router.goBack()
                                }
                            }
                        }
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.5))

                        Text("Cancel anytime. Auto-renews unless cancelled 24h before period ends. Payment charged to Apple ID.")
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.3))
                            .multilineTextAlignment(.center)

                        HStack(spacing: 16) {
                            Link("Terms of Use", destination: Configuration.termsURL)
                            Link("Privacy Policy", destination: Configuration.privacyURL)
                        }
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.3))
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: Binding(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK") { errorMessage = nil }
        } message: {
            Text(errorMessage ?? "")
        }
        .task {
            AnalyticsService.shared.trackScreen("pricing")
            await subscriptionManager.fetchOfferings()
        }
    }

    private var ctaText: String {
        switch selectedPlan {
        case .weekly: return "Start 3-Day Free Trial"
        case .annual: return "Start 3-Day Free Trial"
        case .lifetime: return "Buy Lifetime Access"
        }
    }

    private func purchase() async {
        isPurchasing = true
        defer { isPurchasing = false }

        guard let offering = subscriptionManager.currentOffering else {
            errorMessage = "Could not load pricing options."
            return
        }

        let pkgID: String
        switch selectedPlan {
        case .weekly: pkgID = "$rc_weekly"
        case .annual: pkgID = "$rc_annual"
        case .lifetime: pkgID = "$rc_lifetime"
        }

        guard let package = offering.availablePackages.first(where: { $0.identifier == pkgID }) else {
            errorMessage = "Plan not available."
            return
        }

        do {
            let ok: Bool
            if selectedPlan == .lifetime {
                ok = try await subscriptionManager.purchaseLifetime(package: package)
            } else {
                ok = try await subscriptionManager.purchase(package: package)
            }
            if ok { router.goBack() }
        } catch {
            // Don't show error when user simply cancels purchase
            if let purchasesError = error as? RevenueCat.PurchasesError,
               purchasesError.code == .purchaseCancelledError { return }
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Subviews

struct PricingFeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.pink)
                .frame(width: 24)
            Text(text)
                .foregroundStyle(.white.opacity(0.9))
        }
        .font(.subheadline)
    }
}

struct PricingCard: View {
    let title: String
    let price: String
    let detail: String?
    let badge: String?
    let isSelected: Bool
    let accentColor: Color
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let badge {
                        Text(badge)
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(.pink)
                            .clipShape(Capsule())
                    }
                    Text(price)
                        .font(.headline)
                        .foregroundStyle(.white)
                    if let detail {
                        Text(detail)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? .purple : .white.opacity(0.3))
                    .font(.title2)
            }
            .padding(16)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? .purple : .white.opacity(0.1), lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}
