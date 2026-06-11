import SwiftUI

/// Deprecated: PaywallView replaced by PricingView in new monetization model.
/// Kept as a thin redirect for any remaining references.
struct PaywallView: View {
    @EnvironmentObject var router: NavigationRouter

    var body: some View {
        PricingView()
            .environmentObject(router)
    }
}
