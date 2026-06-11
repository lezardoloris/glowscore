import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var router: NavigationRouter
    @State private var showDeleteConfirmation = false
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            List {
                Section("Subscription") {
                    if subscriptionManager.isSubscribed {
                        HStack { Image(systemName: "checkmark.seal.fill").foregroundStyle(.pink); VStack(alignment: .leading) { Text("Premium Active").font(.headline); Text("Full access to all features").font(.caption).foregroundStyle(.secondary) } }
                        Button("Manage Subscription") { if let url = URL(string: "https://apps.apple.com/account/subscriptions") { UIApplication.shared.open(url) } }
                    } else {
                        Button { router.navigate(to: .pricing) } label: { HStack { Image(systemName: "crown.fill").foregroundStyle(.pink); Text("Upgrade to Premium").font(.headline); Spacer(); Text("From $2.99/week").font(.caption).foregroundStyle(.secondary) } }
                    }
                    Button("Restore Purchases") { Task { try? await subscriptionManager.restorePurchases() } }
                }
                Section("About") {
                    Link("Privacy Policy", destination: URL(string: "https://glowupai.app/privacy")!)
                    Link("Terms of Use", destination: URL(string: "https://glowupai.app/terms")!)
                    Link("Contact Support", destination: URL(string: "mailto:support@glowupai.app")!)
                }
                // H10 FIX: GDPR delete all data
                Section("Data") {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        HStack { Image(systemName: "trash"); Text("Delete All Data") }
                    }
                }
                Section("Disclaimer") {
                    Text("GlowUp AI creates AI-generated artistic visualizations for entertainment and creative exploration only. Results are creative interpretations and do not represent realistic outcomes. They should not be used for professional, medical, or identity purposes.").font(.caption).foregroundStyle(.secondary)
                }
                Section { HStack { Text("Version"); Spacer(); Text(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0.0").foregroundStyle(.secondary) } }
            }.scrollContentBackground(.hidden)
        }
        .navigationTitle("Settings").navigationBarTitleDisplayMode(.large)
        .onAppear { AnalyticsService.shared.trackScreen("settings") }
        .alert("Delete All Data?", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive) {
                TransformationHistory.shared.deleteAll()
                UserDefaults.standard.removeObject(forKey: "hd_generation_count")
                UserDefaults.standard.removeObject(forKey: "free_transform_count")
                AnalyticsService.shared.trackDeleteAllData()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will permanently delete all your saved transformations and usage data.")
        }
    }
}
