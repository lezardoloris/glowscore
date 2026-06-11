import SwiftUI
import AVKit

struct VideoResultView: View {
    @EnvironmentObject var router: NavigationRouter
    @EnvironmentObject var transformContext: TransformContext
    let featureType: String

    @State private var player: AVPlayer?
    @State private var isSaving = false
    @State private var showSavedAlert = false
    @State private var loopObserver: NSObjectProtocol?
    @State private var errorMessage: String?
    @State private var showError = false

    private var featureTitle: String {
        switch featureType {
        case "animate_portrait": return "Animated Portrait"
        case "talking_photo": return "Talking Photo"
        default: return "Video Result"
        }
    }

    var body: some View {
        ZStack {
            GlowUpDesign.Colors.background.ignoresSafeArea()

            VStack(spacing: GlowUpDesign.Spacing.lg) {
                // Feature title
                HStack {
                    Image(systemName: featureType == "animate_portrait" ? "play.circle.fill" : "waveform.circle.fill")
                        .foregroundStyle(GlowUpDesign.Colors.gradient)
                    Text(featureTitle)
                        .font(GlowUpDesign.Typography.headline)
                        .foregroundStyle(.white)
                }

                // Video player
                if let player {
                    VideoPlayer(player: player)
                        .aspectRatio(1, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large))
                        .overlay(
                            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.large)
                                .stroke(.white.opacity(0.1), lineWidth: 1)
                        )
                        .padding(.horizontal, GlowUpDesign.Spacing.md)
                } else {
                    VStack {
                        ProgressView()
                            .tint(.white)
                        Text("Loading video...")
                            .font(GlowUpDesign.Typography.caption)
                            .foregroundStyle(.white.opacity(0.5))
                    }
                    .frame(maxWidth: .infinity)
                    .aspectRatio(1, contentMode: .fit)
                }

                Text("AI-generated artistic animation for entertainment purposes only.")
                    .font(GlowUpDesign.Typography.micro)
                    .foregroundStyle(.white.opacity(0.25))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, GlowUpDesign.Spacing.lg)

                Spacer()

                // Action buttons
                HStack(spacing: GlowUpDesign.Spacing.md) {
                    // Share
                    Button {
                        shareVideo()
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "square.and.arrow.up")
                            Text("Share")
                        }
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        .overlay(
                            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                .stroke(.white.opacity(0.1), lineWidth: 1)
                        )
                    }

                    // Save
                    Button {
                        saveVideo()
                    } label: {
                        HStack(spacing: 6) {
                            if isSaving {
                                ProgressView().tint(.white)
                            } else {
                                Image(systemName: "square.and.arrow.down")
                            }
                            Text("Save")
                        }
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                        .overlay(
                            RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium)
                                .stroke(.white.opacity(0.1), lineWidth: 1)
                        )
                    }
                    .disabled(isSaving)

                    // Try Another
                    Button {
                        router.goToRoot()
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "arrow.counterclockwise")
                            Text("New")
                        }
                        .font(GlowUpDesign.Typography.body)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(GlowUpDesign.Colors.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: GlowUpDesign.Radius.medium))
                    }
                }
                .padding(.horizontal, GlowUpDesign.Spacing.md)
                .padding(.bottom, GlowUpDesign.Spacing.lg)
            }
            .padding(.top, GlowUpDesign.Spacing.md)
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .onAppear {
            setupPlayer()
            AnalyticsService.shared.trackScreen("video_result")
        }
        .onDisappear {
            player?.pause()
            if let obs = loopObserver {
                NotificationCenter.default.removeObserver(obs)
                loopObserver = nil
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") {}
        } message: {
            Text(errorMessage ?? "Unknown error")
        }
        .alert("Saved!", isPresented: $showSavedAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Video saved to your library.")
        }
    }

    private func setupPlayer() {
        guard let videoURL = transformContext.resultVideoURL else { return }
        let avPlayer = AVPlayer(url: videoURL)
        avPlayer.actionAtItemEnd = .none

        // Loop playback (store observer for cleanup)
        loopObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: avPlayer.currentItem,
            queue: .main
        ) { _ in
            avPlayer.seek(to: .zero)
            avPlayer.play()
        }

        player = avPlayer
        avPlayer.play()
    }

    private func downloadVideoToTemp() async throws -> URL {
        guard let videoURL = transformContext.resultVideoURL else {
            throw FeatureService.FeatureError.invalidResponse
        }
        if videoURL.isFileURL { return videoURL }
        let (data, _) = try await URLSession.shared.data(from: videoURL)
        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("mp4")
        try data.write(to: tempURL)
        return tempURL
    }

    private func shareVideo() {
        Task {
            do {
                let localURL = try await downloadVideoToTemp()
                let activityVC = UIActivityViewController(activityItems: [localURL], applicationActivities: nil)
                if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let rootVC = scene.windows.first?.rootViewController {
                    await MainActor.run {
                        rootVC.present(activityVC, animated: true)
                    }
                }
                AnalyticsService.shared.track("video_shared", properties: ["feature": featureType])
            } catch {
                errorMessage = "Could not share video."
                showError = true
            }
        }
    }

    private func saveVideo() {
        guard transformContext.resultVideoURL != nil else { return }
        isSaving = true

        Task {
            do {
                let localURL = try await downloadVideoToTemp()
                UISaveVideoAtPathToSavedPhotosAlbum(localURL.path, nil, nil, nil)
                showSavedAlert = true
                AnalyticsService.shared.track("video_saved", properties: ["feature": featureType])
            } catch {
                errorMessage = "Could not save video: \(error.localizedDescription)"
                showError = true
            }
            isSaving = false
        }
    }
}
