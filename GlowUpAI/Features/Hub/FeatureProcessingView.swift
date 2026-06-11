import SwiftUI

struct FeatureProcessingView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var transformContext: TransformContext
    let image: UIImage
    let featureType: String

    @State private var progress: Double = 0
    @State private var statusText = "Processing..."
    @State private var timerTask: Task<Void, Never>?

    private var featureDisplayName: String {
        switch featureType {
        case "face_swap": return "Face Swap"
        case "instant_style": return "Art Style"
        case "headshot": return "AI Headshot"
        case "hair_change": return "Hair Change"
        case "relight": return "Relight"
        case "age_transform": return "Age Transform"
        case "try_on": return "Try-On"
        default: return "Feature"
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 32) {
                Spacer()
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 200, height: 200)
                    .clipShape(Circle())
                    .overlay(
                        Circle()
                            .stroke(GlowUpDesign.Colors.heroGradient, lineWidth: 3)
                            .scaleEffect(1.0 + progress * 0.1)
                            .opacity(1.0 - progress * 0.3)
                    )
                    .shadow(color: .purple.opacity(0.5), radius: 30)

                VStack(spacing: GlowUpDesign.Spacing.sm) {
                    Text(statusText)
                        .font(GlowUpDesign.Typography.headline)
                        .foregroundStyle(.white)

                    ProgressView(value: progress)
                        .tint(GlowUpDesign.Colors.gradient)
                        .frame(width: 200)

                    Text("\(featureDisplayName) Processing")
                        .font(GlowUpDesign.Typography.caption)
                        .foregroundStyle(.white.opacity(0.5))
                }
                Spacer()
            }
        }
        .navigationBarBackButtonHidden()
        .onAppear {
            startTimer()
            AnalyticsService.shared.trackScreen("feature_processing_\(featureType)")
        }
        .onDisappear { timerTask?.cancel() }
    }

    private func startTimer() {
        timerTask = Task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(300))
                guard !Task.isCancelled else { break }
                await MainActor.run {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        if progress < 0.9 { progress += 0.02 }
                        if progress < 0.3 { statusText = "Analyzing..." }
                        else if progress < 0.6 { statusText = "Applying \(featureDisplayName)..." }
                        else { statusText = "Almost there..." }
                    }
                }
            }
        }
    }
}
