import Foundation
import FirebaseAnalytics

final class AnalyticsService {
    static let shared = AnalyticsService()

    private init() {}

    func configure() {
        // Firebase is auto-configured via GoogleService-Info.plist
        // Set default user properties
        Analytics.setUserProperty(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String, forName: "app_version")
    }

    func track(_ event: String, properties: [String: Any] = [:]) {
        #if DEBUG
        print("[Analytics] \(event): \(properties)")
        #endif
        // M11 FIX: Wire to Firebase Analytics
        Analytics.logEvent(event, parameters: properties.compactMapValues { value -> Any? in
            // Firebase only accepts String, Int, Double
            if let str = value as? String { return str }
            if let num = value as? NSNumber { return num }
            return String(describing: value)
        })
    }

    func trackScreen(_ name: String) {
        Analytics.logEvent(AnalyticsEventScreenView, parameters: [
            AnalyticsParameterScreenName: name
        ])
    }

    func setUserProperty(_ value: String, forName name: String) {
        Analytics.setUserProperty(value, forName: name)
    }

    // MARK: - User Properties

    func setUserProperty(key: String, value: String) {
        Analytics.setUserProperty(value, forName: key)
    }

    // MARK: - Funnel Events

    func trackOnboardingStarted() {
        track("onboarding_started")
    }

    func trackOnboardingCompleted() {
        track("onboarding_completed")
    }

    /// Legacy alias kept for existing call sites.
    func trackOnboardingComplete() {
        trackOnboardingCompleted()
    }

    func trackPricingViewed() {
        track("pricing_viewed")
    }

    func trackSkippedToFree() {
        track("skipped_to_free")
    }

    func trackSubscriptionPurchased(plan: String) {
        track("subscription_purchased", properties: ["plan": plan])
    }

    func trackShareInitiated(destination: String) {
        track("share_initiated", properties: ["destination": destination])
    }

    func trackStyleSelected(styleId: String) {
        track("style_selected", properties: ["style_id": styleId])
    }

    func trackTransformCompleted(quality: String) {
        track("transform_completed_quality", properties: ["quality": quality])
    }

    func trackPhotoCaptured(source: String) {
        track("photo_captured", properties: ["source": source])
    }

    func trackFaceDetected(confidence: Float) {
        track("face_detected", properties: ["confidence": Double(confidence)])
    }

    func trackTransformStart(style: String, tier: String) {
        track("transform_started", properties: ["style": style, "tier": tier])
    }

    func trackTransformComplete(style: String, tier: String, durationSeconds: Double) {
        track("transform_completed", properties: [
            "style": style,
            "tier": tier,
            "duration_seconds": durationSeconds
        ])
    }

    func trackTransformError(style: String, error: String) {
        track("transform_error", properties: ["style": style, "error": error])
    }

    func trackPaywallViewed(trigger: String) {
        track("paywall_viewed", properties: ["trigger": trigger])
    }

    func trackTrialStarted(plan: String) {
        track("trial_started", properties: ["plan": plan])
    }

    func trackSubscriptionStarted(productID: String) {
        track("subscription_started", properties: ["product_id": productID])
    }

    func trackSubscriptionRestored() {
        track("subscription_restored")
    }

    func trackShareCompleted(destination: String, format: String) {
        track("share_completed", properties: ["destination": destination, "format": format])
    }

    func trackSaveToLibrary() {
        track("save_to_library")
    }

    func trackHistoryViewed(count: Int) {
        track("history_viewed", properties: ["items_count": count])
    }

    func trackDeleteAllData() {
        track("delete_all_data")
    }

    func trackDailyLimitReached(tier: String) {
        track("daily_limit_reached", properties: ["tier": tier])
    }
}
