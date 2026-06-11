import Foundation
import RevenueCat
import SwiftUI

@MainActor
class SubscriptionManager: ObservableObject {
    @Published var isSubscribed = false
    @Published var currentOffering: Offering?
    @Published var customerInfo: CustomerInfo?
    @Published var isLoading = false

    private let entitlementID = "glowup_premium"

    init() {
        Task { await checkSubscriptionStatus() }
    }

    // C4 FIX: Cache subscription status for offline access
    private let cacheKey = "cached_subscription_status"

    func checkSubscriptionStatus() async {
        do {
            let info = try await Purchases.shared.customerInfo()
            self.customerInfo = info
            self.isSubscribed = info.entitlements[entitlementID]?.isActive == true
            UserDefaults.standard.set(self.isSubscribed, forKey: cacheKey)
        } catch {
            print("Error checking subscription: \(error)")
            // Fall back to cached status when offline
            self.isSubscribed = UserDefaults.standard.bool(forKey: cacheKey)
        }
    }

    func fetchOfferings() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let offerings = try await Purchases.shared.offerings()
            self.currentOffering = offerings.current
        } catch {
            print("Error fetching offerings: \(error)")
        }
    }

    func purchase(package: Package) async throws -> Bool {
        isLoading = true
        defer { isLoading = false }

        let result = try await Purchases.shared.purchase(package: package)

        if result.customerInfo.entitlements[entitlementID]?.isActive == true {
            self.isSubscribed = true
            self.customerInfo = result.customerInfo
            return true
        }
        return false
    }

    /// Purchase a non-recurring lifetime product
    func purchaseLifetime(package: Package) async throws -> Bool {
        isLoading = true
        defer { isLoading = false }

        let result = try await Purchases.shared.purchase(package: package)

        if result.customerInfo.entitlements[entitlementID]?.isActive == true {
            self.isSubscribed = true
            self.customerInfo = result.customerInfo
            UserDefaults.standard.set(true, forKey: cacheKey)
            return true
        }
        return false
    }

    func restorePurchases() async throws {
        isLoading = true
        defer { isLoading = false }

        let info = try await Purchases.shared.restorePurchases()
        self.customerInfo = info
        self.isSubscribed = info.entitlements[entitlementID]?.isActive == true
    }

    var subscriberToken: String {
        Purchases.shared.appUserID
    }
}
