import SwiftUI

// C2 FIX: Use stable ID instead of UIImage in Route to fix Hashable/Equatable
enum Route: Hashable {
    case camera
    case featureHub
    case styleSelection(id: UUID = UUID())
    case processing(styleId: String, id: UUID = UUID())
    case result(styleId: String, isHD: Bool, id: UUID = UUID())
    case pricing
    case hdCompare
    case history
    case settings
    case share(id: UUID = UUID())
    // New feature routes
    case faceSwap
    case instantStyle
    case headshot
    case hairChange
    case relight
    case ageTransform
    case tryOn
    case coupleGlowUp
    // Video features (return video, not image)
    case animatePortrait
    case talkingPhoto
    // Image features
    case backgroundRemoval
    case caricature
    case photoRestore
    case petPortrait
    case fitnessTransform
    case upscale
    // On-device features (no network)
    case beautyFilter
    case virtualMakeup
    // Video result
    case videoResult(featureType: String, id: UUID = UUID())
    // Generic feature processing & result
    case featureProcessing(featureType: String, id: UUID = UUID())
    case featureResult(featureType: String, id: UUID = UUID())
}

// Store transient images separately from navigation state
@MainActor
class TransformContext: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var transformedImage: UIImage?
    @Published var selectedStyle: StylePreset?
    @Published var isHD: Bool = false

    // New feature context
    @Published var secondImage: UIImage?       // For face swap target, couple partner, garment
    @Published var featureType: String = ""
    @Published var featureParams: [String: String] = [:]

    // Video feature context
    @Published var resultVideoURL: URL?
    @Published var drivingVideoURL: URL?
    @Published var audioURL: URL?
}

@MainActor
class NavigationRouter: ObservableObject {
    @Published var path = NavigationPath()

    func navigate(to route: Route) {
        path.append(route)
    }

    func goBack() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }

    func goToRoot() {
        path = NavigationPath()
    }

    /// Navigate to the full-page Pricing screen
    func presentPaywall() {
        navigate(to: .pricing)
    }
}
