import SwiftUI

struct RootView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @StateObject private var transformContext = TransformContext()
    // H7 FIX: Onboarding gating
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @State private var selectedTab = 0

    var body: some View {
        if !hasCompletedOnboarding {
            OnboardingView(hasCompletedOnboarding: $hasCompletedOnboarding)
        } else {
            TabView(selection: $selectedTab) {
                NavigationStack(path: $router.path) {
                    CameraView()
                        .navigationDestination(for: Route.self) { route in
                            switch route {
                            case .featureHub:
                                if let img = transformContext.selectedImage {
                                    FeatureHubView(selectedImage: img)
                                }
                            case .styleSelection:
                                if let img = transformContext.selectedImage {
                                    StyleSelectionView(selectedImage: img)
                                }
                            case .processing(let styleId, _):
                                if let img = transformContext.selectedImage,
                                   let style = transformContext.selectedStyle {
                                    ProcessingView(image: img, style: style)
                                }
                            case .result(_, let isHD, _):
                                if let orig = transformContext.selectedImage,
                                   let trans = transformContext.transformedImage,
                                   let style = transformContext.selectedStyle {
                                    ResultView(originalImage: orig, transformedImage: trans, style: style, isHD: isHD)
                                }
                            case .pricing:
                                PricingView()
                            case .hdCompare:
                                HDCompareView()
                            // New feature screens
                            case .faceSwap:
                                if let img = transformContext.selectedImage {
                                    FaceSwapView(selectedImage: img)
                                }
                            case .instantStyle:
                                if let img = transformContext.selectedImage {
                                    InstantStyleView(selectedImage: img)
                                }
                            case .headshot:
                                if let img = transformContext.selectedImage {
                                    HeadshotView(selectedImage: img)
                                }
                            case .hairChange:
                                if let img = transformContext.selectedImage {
                                    HairChangeView(selectedImage: img)
                                }
                            case .relight:
                                if let img = transformContext.selectedImage {
                                    RelightView(selectedImage: img)
                                }
                            case .ageTransform:
                                if let img = transformContext.selectedImage {
                                    AgeTransformView(selectedImage: img)
                                }
                            case .tryOn:
                                if let img = transformContext.selectedImage {
                                    TryOnView(selectedImage: img)
                                }
                            case .coupleGlowUp:
                                CoupleGlowUpView()
                            case .caricature:
                                if let img = transformContext.selectedImage {
                                    CaricatureView(selectedImage: img)
                                }
                            case .photoRestore:
                                if let img = transformContext.selectedImage {
                                    PhotoRestoreView(selectedImage: img)
                                }
                            case .petPortrait:
                                if let img = transformContext.selectedImage {
                                    PetPortraitView(selectedImage: img)
                                }
                            case .fitnessTransform:
                                if let img = transformContext.selectedImage {
                                    FitnessTransformView(selectedImage: img)
                                }
                            case .upscale:
                                if let img = transformContext.selectedImage {
                                    UpscaleView(selectedImage: img)
                                }
                            case .beautyFilter:
                                BeautyFilterView()
                            case .virtualMakeup:
                                VirtualMakeupView()
                            case .featureProcessing(let featureType, _):
                                if let img = transformContext.selectedImage {
                                    FeatureProcessingView(image: img, featureType: featureType)
                                }
                            case .featureResult(let featureType, _):
                                if let orig = transformContext.selectedImage,
                                   let trans = transformContext.transformedImage {
                                    FeatureResultView(originalImage: orig, transformedImage: trans, featureType: featureType)
                                }
                            default:
                                EmptyView()
                            }
                        }
                }
                .tabItem { Image(systemName: "camera.fill"); Text("Glow Up") }
                .tag(0)

                NavigationStack { HistoryView() }
                .tabItem { Image(systemName: "clock.fill"); Text("History") }
                .tag(1)

                NavigationStack { SettingsView() }
                .tabItem { Image(systemName: "gearshape.fill"); Text("Settings") }
                .tag(2)
            }
            .tint(.pink)
            .environmentObject(transformContext)
        }
    }
}
