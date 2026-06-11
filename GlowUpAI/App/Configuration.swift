import Foundation

enum Configuration {
    // MARK: - API Keys (read from Info.plist → xcconfig, NEVER hardcode production keys)

    static let revenueCatAPIKey: String = {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "REVENUECAT_API_KEY") as? String,
              !key.isEmpty, key != "$(REVENUECAT_API_KEY)" else {
            #if DEBUG
            print("⚠️ RevenueCat API key not configured. Set REVENUECAT_API_KEY in xcconfig.")
            return "appl_dev_placeholder"
            #else
            fatalError("RevenueCat API key must be configured for release builds")
            #endif
        }
        return key
    }()

    static let workerBaseURL: String = {
        guard let url = Bundle.main.object(forInfoDictionaryKey: "WORKER_BASE_URL") as? String,
              !url.isEmpty, url != "$(WORKER_BASE_URL)" else {
            #if DEBUG
            return "https://glowup-api-dev.workers.dev"
            #else
            fatalError("Worker base URL must be configured for release builds")
            #endif
        }
        return url
    }()

    // API Endpoints
    static let transformEndpoint = "\(workerBaseURL)/api/transform"
    static let stylesEndpoint = "\(workerBaseURL)/api/styles"
    static let healthEndpoint = "\(workerBaseURL)/api/health"
    static let faceSwapEndpoint = "\(workerBaseURL)/api/face-swap"
    static let instantStyleEndpoint = "\(workerBaseURL)/api/instant-style"
    static let headshotEndpoint = "\(workerBaseURL)/api/headshot"
    static let hairChangeEndpoint = "\(workerBaseURL)/api/hair-change"
    static let relightEndpoint = "\(workerBaseURL)/api/relight"
    static let ageTransformEndpoint = "\(workerBaseURL)/api/age-transform"
    static let tryOnEndpoint = "\(workerBaseURL)/api/try-on"
    static let featuresEndpoint = "\(workerBaseURL)/api/features"
    static let animatePortraitEndpoint = "\(workerBaseURL)/api/animate-portrait"
    static let talkingPhotoEndpoint = "\(workerBaseURL)/api/talking-photo"
    static let backgroundRemovalEndpoint = "\(workerBaseURL)/api/background-removal"
    static let caricatureEndpoint = "\(workerBaseURL)/api/caricature"
    static let photoRestoreEndpoint = "\(workerBaseURL)/api/photo-restore"
    static let petPortraitEndpoint = "\(workerBaseURL)/api/pet-portrait"
    static let fitnessTransformEndpoint = "\(workerBaseURL)/api/fitness-transform"
    static let upscaleEndpoint = "\(workerBaseURL)/api/upscale"

    // Subscription Product IDs
    static let weeklyProductID = "glowup_weekly_299"
    static let annualProductID = "glowup_annual_1499"
    static let lifetimeProductID = "glowup_lifetime_3999"

    // Usage Limits
    static let maxFreeTransformsPerDay = 5
    static let maxHDTransformsPerDay = 10

    // Image Settings
    static let previewSize: CGFloat = 512
    static let hdSize: CGFloat = 1024

    // Legal URLs
    static let termsURL = URL(string: "https://glowupai.app/terms")!
    static let privacyURL = URL(string: "https://glowupai.app/privacy")!
    static let supportEmail = "support@glowupai.app"
    static let subscriptionManagementURL = URL(string: "https://apps.apple.com/account/subscriptions")!
}
