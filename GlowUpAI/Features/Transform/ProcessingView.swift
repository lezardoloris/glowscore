import SwiftUI
import Network

struct ProcessingView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var subscriptionManager: SubscriptionManager
    @EnvironmentObject var transformContext: TransformContext
    let image: UIImage
    let style: StylePreset

    @State private var progress: Double = 0
    @State private var statusText = "Analyzing your face..."
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var timerTask: Task<Void, Never>?

    // H2 FIX: UsageMeter integration (singleton to prevent TOCTOU race)
    private let usageMeter = UsageMeter.shared
    private let transformService = TransformationService()
    private let analytics = AnalyticsService.shared

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
                            .stroke(LinearGradient(colors: [.pink, .purple, .blue], startPoint: .topLeading, endPoint: .bottomTrailing), lineWidth: 3)
                            .scaleEffect(1.0 + progress * 0.1)
                            .opacity(1.0 - progress * 0.3)
                    )
                    .shadow(color: .purple.opacity(0.5), radius: 30)
                VStack(spacing: 12) {
                    Text(statusText).font(.headline).foregroundStyle(.white)
                    ProgressView(value: progress)
                        .tint(LinearGradient(colors: [.pink, .purple], startPoint: .leading, endPoint: .trailing))
                        .frame(width: 200)

                    // H2: Show remaining HD count for subscribers
                    if subscriptionManager.isSubscribed {
                        Text("\(usageMeter.remainingHD) HD left today")
                            .font(.caption2).foregroundStyle(.white.opacity(0.4))
                    }

                    Text("\(style.name) Transformation").font(.caption).foregroundStyle(.white.opacity(0.5))
                }
                Spacer()
            }
        }
        .navigationBarBackButtonHidden()
        .onAppear { startTimer(); AnalyticsService.shared.trackScreen("processing") }
        .onDisappear { timerTask?.cancel() } // M7 FIX: Cancel timer on disappear
        .task { await performTransformation() }
        .onChange(of: errorMessage) { _, newVal in showError = (newVal != nil) }
        .alert("Error", isPresented: $showError) {
            Button("Try Again") { errorMessage = nil; resetProgress(); Task { await performTransformation() } }
            Button("Go Back") { errorMessage = nil; router.goBack() }
        } message: { Text(errorMessage ?? "") }
    }

    // M6 FIX: Centralized reset for retry
    private func resetProgress() {
        progress = 0
        statusText = "Analyzing your face..."
        timerTask?.cancel()
        startTimer()
    }

    private func startTimer() {
        timerTask = Task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(300))
                guard !Task.isCancelled else { break }
                await MainActor.run {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        if progress < 0.9 { progress += 0.02 }
                        if progress < 0.3 { statusText = "Analyzing your face..." }
                        else if progress < 0.6 { statusText = "Applying \(style.name)..." }
                        else { statusText = "Almost there..." }
                    }
                }
            }
        }
    }

    private func performTransformation() async {
        // M4 FIX: Network reachability check (safe one-shot, no double-resume)
        if subscriptionManager.isSubscribed {
            let isConnected = await withCheckedContinuation { (continuation: CheckedContinuation<Bool, Never>) in
                let monitor = NWPathMonitor()
                var resumed = false
                monitor.pathUpdateHandler = { path in
                    monitor.cancel()
                    guard !resumed else { return }
                    resumed = true
                    continuation.resume(returning: path.status == .satisfied)
                }
                monitor.start(queue: DispatchQueue(label: "NetworkCheck"))
            }
            if !isConnected {
                errorMessage = "No internet connection. HD transformations require a network connection."
                return
            }
        }

        let startTime = Date()
        analytics.trackTransformStart(style: style.id, tier: subscriptionManager.isSubscribed ? "hd" : "preview")

        do {
            let result: UIImage
            let isHD: Bool

            if subscriptionManager.isSubscribed {
                // H2 FIX: Check UsageMeter before API call
                guard usageMeter.canGenerateHD else {
                    errorMessage = "You've reached your daily limit of \(Configuration.maxHDTransformsPerDay) HD transformations. Try again tomorrow!"
                    return
                }
                // M5 FIX: Retry logic (1 automatic retry)
                do {
                    result = try await transformService.transformHD(image: image, style: style, subscriberToken: subscriptionManager.subscriberToken)
                } catch {
                    // One automatic retry
                    try? await Task.sleep(for: .seconds(1))
                    result = try await transformService.transformHD(image: image, style: style, subscriberToken: subscriptionManager.subscriberToken)
                }
                usageMeter.recordHDGeneration()
                isHD = true
            } else {
                // H2: Check free preview limit
                guard usageMeter.canGeneratePreview else {
                    errorMessage = "You've used your \(Configuration.maxFreeTransformsPerDay) free transforms today. Go Premium for HD!"
                    router.navigate(to: .pricing)
                    return
                }
                result = try await transformService.transformPreview(image: image, style: style)
                usageMeter.recordPreviewGeneration()
                isHD = false
            }

            // H3 FIX: Save to history
            do {
                let paths = try await ImageService.shared.saveTransformationLocally(original: image, result: result)
                let transformation = Transformation(
                    stylePresetId: style.id,
                    originalImagePath: paths.originalPath,
                    transformedImagePath: paths.resultPath,
                    isHD: isHD
                )
                TransformationHistory.shared.add(transformation)
            } catch {
                print("Failed to save to history: \(error)")
                // Non-blocking — don't fail the transform because of save failure
            }

            let duration = Date().timeIntervalSince(startTime)
            analytics.trackTransformComplete(style: style.id, tier: isHD ? "hd" : "preview", durationSeconds: duration)

            await MainActor.run {
                withAnimation { progress = 1.0; statusText = "Done!" }
            }
            try? await Task.sleep(for: .milliseconds(500))
            await MainActor.run {
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            }

            // Store in TransformContext for navigation
            transformContext.transformedImage = result
            transformContext.selectedStyle = style
            transformContext.isHD = isHD

            router.navigate(to: .result(styleId: style.id, isHD: isHD))


        } catch let error as TransformationService.TransformError {
            analytics.trackTransformError(style: style.id, error: error.localizedDescription)
            if case .notSubscribed = error {
                await subscriptionManager.checkSubscriptionStatus()
            }
            errorMessage = error.localizedDescription
        } catch {
            analytics.trackTransformError(style: style.id, error: error.localizedDescription)
            errorMessage = error.localizedDescription
        }
    }
}
