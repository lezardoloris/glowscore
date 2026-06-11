import SwiftUI
import RevenueCat
import FirebaseCore

@main
struct GlowUpAIApp: App {
    @StateObject private var subscriptionManager = SubscriptionManager()
    @StateObject private var navigationRouter = NavigationRouter()
    @Environment(\.scenePhase) private var scenePhase

    init() {
        // Firebase must be configured first
        FirebaseApp.configure()

        // RevenueCat subscription management
        Purchases.configure(withAPIKey: Configuration.revenueCatAPIKey)

        // Analytics
        AnalyticsService.shared.configure()

        // Request notification permissions and schedule persistent notifications
        Task {
            let granted = await NotificationService.shared.requestPermission()
            if granted {
                NotificationService.shared.scheduleWeeklyStyleNotification()
                NotificationService.shared.scheduleReEngagementNotification()
            }
        }

        // Dark mode is forced via UIUserInterfaceStyle=Dark in Info.plist
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(subscriptionManager)
                .environmentObject(navigationRouter)
                .preferredColorScheme(.dark)
                .onChange(of: scenePhase) { _, newPhase in
                    if newPhase == .active {
                        // Reschedule re-engagement on every app open
                        NotificationService.shared.scheduleReEngagementNotification()
                    }
                }
        }
    }
}
